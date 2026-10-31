"use strict";
/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureSelectionManager = void 0;
const int_1 = require("../../../mol-data/int");
const boundary_helper_1 = require("../../../mol-math/geometry/boundary-helper");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const loci_1 = require("../../../mol-model/loci");
const structure_1 = require("../../../mol-model/structure");
const mol_state_1 = require("../../../mol-state");
const mol_task_1 = require("../../../mol-task");
const label_1 = require("../../../mol-theme/label");
const array_1 = require("../../../mol-util/array");
const component_1 = require("../../component");
const objects_1 = require("../../objects");
const mol_util_1 = require("../../../mol-util");
const util_1 = require("../../../mol-data/util");
const boundaryHelper = new boundary_helper_1.BoundaryHelper('98');
const HISTORY_CAPACITY = 24;
class StructureSelectionManager extends component_1.StatefulPluginComponent {
    get entries() { return this.state.entries; }
    get additionsHistory() { return this.state.additionsHistory; }
    get stats() {
        if (this.state.stats)
            return this.state.stats;
        this.state.stats = this.calcStats();
        return this.state.stats;
    }
    getEntry(s) {
        // ignore decorators to get stable ref
        const cell = this.plugin.helpers.substructureParent.get(s, true);
        if (!cell)
            return;
        const ref = cell.transform.ref;
        if (!this.entries.has(ref)) {
            const entry = new SelectionEntry(structure_1.StructureElement.Loci(s, []));
            this.entries.set(ref, entry);
            return entry;
        }
        return this.entries.get(ref);
    }
    calcStats() {
        let structureCount = 0;
        let elementCount = 0;
        const stats = structure_1.StructureElement.Stats.create();
        this.entries.forEach(v => {
            const { elements } = v.selection;
            if (elements.length) {
                structureCount += 1;
                for (let i = 0, il = elements.length; i < il; ++i) {
                    elementCount += int_1.OrderedSet.size(elements[i].indices);
                }
                structure_1.StructureElement.Stats.add(stats, stats, structure_1.StructureElement.Stats.ofLoci(v.selection));
            }
        });
        const label = (0, label_1.structureElementStatsLabel)(stats, { countsOnly: true });
        return { structureCount, elementCount, label };
    }
    add(loci) {
        if (!structure_1.StructureElement.Loci.is(loci))
            return false;
        const entry = this.getEntry(loci.structure);
        if (!entry)
            return false;
        const sel = entry.selection;
        entry.selection = structure_1.StructureElement.Loci.union(entry.selection, loci);
        this.tryAddHistory(loci);
        this.referenceLoci = loci;
        this.events.loci.add.next(loci);
        return !structure_1.StructureElement.Loci.areEqual(sel, entry.selection);
    }
    remove(loci) {
        if (!structure_1.StructureElement.Loci.is(loci))
            return false;
        const entry = this.getEntry(loci.structure);
        if (!entry)
            return false;
        const sel = entry.selection;
        entry.selection = structure_1.StructureElement.Loci.subtract(entry.selection, loci);
        // this.addHistory(loci);
        this.referenceLoci = loci;
        this.events.loci.remove.next(loci);
        return !structure_1.StructureElement.Loci.areEqual(sel, entry.selection);
    }
    intersect(loci) {
        if (!structure_1.StructureElement.Loci.is(loci))
            return false;
        const entry = this.getEntry(loci.structure);
        if (!entry)
            return false;
        const sel = entry.selection;
        entry.selection = structure_1.StructureElement.Loci.intersect(entry.selection, loci);
        // this.addHistory(loci);
        this.referenceLoci = loci;
        return !structure_1.StructureElement.Loci.areEqual(sel, entry.selection);
    }
    set(loci) {
        if (!structure_1.StructureElement.Loci.is(loci))
            return false;
        const entry = this.getEntry(loci.structure);
        if (!entry)
            return false;
        const sel = entry.selection;
        entry.selection = loci;
        this.tryAddHistory(loci);
        this.referenceLoci = undefined;
        return !structure_1.StructureElement.Loci.areEqual(sel, entry.selection);
    }
    modifyHistory(entry, action, modulus, groupByStructure = false) {
        const history = this.additionsHistory;
        const idx = history.indexOf(entry);
        if (idx < 0)
            return;
        let swapWith = void 0;
        switch (action) {
            case 'remove':
                (0, array_1.arrayRemoveAtInPlace)(history, idx);
                break;
            case 'up':
                swapWith = idx - 1;
                break;
            case 'down':
                swapWith = idx + 1;
                break;
        }
        if (swapWith !== void 0) {
            const mod = modulus ? Math.min(history.length, modulus) : history.length;
            while (true) {
                swapWith = swapWith % mod;
                if (swapWith < 0)
                    swapWith += mod;
                if (!groupByStructure || history[idx].loci.structure === history[swapWith].loci.structure) {
                    const t = history[idx];
                    history[idx] = history[swapWith];
                    history[swapWith] = t;
                    break;
                }
                else {
                    swapWith += action === 'up' ? -1 : +1;
                }
            }
        }
        this.events.additionsHistoryUpdated.next(void 0);
    }
    tryAddHistory(loci) {
        if (loci_1.Loci.isEmpty(loci))
            return;
        let idx = 0, entry = void 0;
        for (const l of this.additionsHistory) {
            if (loci_1.Loci.areEqual(l.loci, loci)) {
                entry = l;
                break;
            }
            idx++;
        }
        if (entry) {
            // move to top
            (0, array_1.arrayRemoveAtInPlace)(this.additionsHistory, idx);
            this.additionsHistory.unshift(entry);
            this.events.additionsHistoryUpdated.next(void 0);
            return;
        }
        const stats = structure_1.StructureElement.Stats.ofLoci(loci);
        const label = (0, label_1.structureElementStatsLabel)(stats, { reverse: true });
        this.additionsHistory.unshift({ id: mol_util_1.UUID.create22(), loci, label });
        if (this.additionsHistory.length > HISTORY_CAPACITY)
            this.additionsHistory.pop();
        this.events.additionsHistoryUpdated.next(void 0);
    }
    clearHistory() {
        if (this.state.additionsHistory.length !== 0) {
            this.state.additionsHistory = [];
            this.events.additionsHistoryUpdated.next(void 0);
        }
    }
    clearHistoryForStructure(structure) {
        const historyEntryToRemove = [];
        for (const e of this.state.additionsHistory) {
            if (e.loci.structure.root === structure.root) {
                historyEntryToRemove.push(e);
            }
        }
        for (const e of historyEntryToRemove) {
            this.modifyHistory(e, 'remove');
        }
        if (historyEntryToRemove.length !== 0) {
            this.events.additionsHistoryUpdated.next(void 0);
        }
    }
    onRemove(ref, obj) {
        var _a;
        if (this.entries.has(ref)) {
            this.entries.delete(ref);
            if (obj === null || obj === void 0 ? void 0 : obj.data) {
                this.clearHistoryForStructure(obj.data);
            }
            if (((_a = this.referenceLoci) === null || _a === void 0 ? void 0 : _a.structure) === (obj === null || obj === void 0 ? void 0 : obj.data)) {
                this.referenceLoci = undefined;
            }
            this.state.stats = void 0;
            this.events.changed.next(void 0);
        }
    }
    onUpdate(ref, oldObj, obj) {
        var _a, _b, _c, _d;
        // no change to structure
        if (oldObj === obj || (oldObj === null || oldObj === void 0 ? void 0 : oldObj.data) === obj.data)
            return;
        // ignore decorators to get stable ref
        const cell = this.plugin.helpers.substructureParent.get(obj.data, true);
        if (!cell)
            return;
        // only need to update the root
        if (ref !== cell.transform.ref)
            return;
        if (!this.entries.has(ref))
            return;
        // use structure from last decorator as reference
        const structure = (_b = (_a = this.plugin.helpers.substructureParent.get(obj.data)) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data;
        if (!structure)
            return;
        // oldObj is not defined for inserts (e.g. TransformStructureConformation)
        if (!(oldObj === null || oldObj === void 0 ? void 0 : oldObj.data) || structure_1.Structure.areUnitIdsAndIndicesEqual(oldObj.data, obj.data)) {
            this.entries.set(ref, remapSelectionEntry(this.entries.get(ref), structure));
            // remap referenceLoci & prevHighlight if needed and possible
            if (((_c = this.referenceLoci) === null || _c === void 0 ? void 0 : _c.structure.root) === structure.root) {
                this.referenceLoci = structure_1.StructureElement.Loci.remap(this.referenceLoci, structure);
            }
            // remap history locis if needed and possible
            let changedHistory = false;
            for (const e of this.state.additionsHistory) {
                if (e.loci.structure.root === structure.root) {
                    e.loci = structure_1.StructureElement.Loci.remap(e.loci, structure);
                    changedHistory = true;
                }
            }
            if (changedHistory)
                this.events.additionsHistoryUpdated.next(void 0);
        }
        else {
            // clear the selection for ref
            this.entries.set(ref, new SelectionEntry(structure_1.StructureElement.Loci(structure, [])));
            if (((_d = this.referenceLoci) === null || _d === void 0 ? void 0 : _d.structure.root) === structure.root) {
                this.referenceLoci = undefined;
            }
            this.clearHistoryForStructure(structure);
            this.state.stats = void 0;
            this.events.changed.next(void 0);
        }
    }
    /** Removes all selections and returns them */
    clear() {
        const keys = this.entries.keys();
        const selections = [];
        while (true) {
            const k = keys.next();
            if (k.done)
                break;
            const s = this.entries.get(k.value);
            if (!structure_1.StructureElement.Loci.isEmpty(s.selection))
                selections.push(s.selection);
            s.selection = structure_1.StructureElement.Loci(s.selection.structure, []);
        }
        this.referenceLoci = undefined;
        this.state.stats = void 0;
        this.events.changed.next(void 0);
        this.events.loci.clear.next(void 0);
        this.clearHistory();
        return selections;
    }
    getLoci(structure) {
        const entry = this.getEntry(structure);
        if (!entry)
            return loci_1.EmptyLoci;
        return entry.selection;
    }
    getStructure(structure) {
        const entry = this.getEntry(structure);
        if (!entry)
            return;
        return entry.structure;
    }
    structureHasSelection(structure) {
        var _a, _b;
        const s = (_b = (_a = structure.cell) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data;
        if (!s)
            return false;
        const entry = this.getEntry(s);
        return !!entry && !structure_1.StructureElement.Loci.isEmpty(entry.selection);
    }
    has(loci) {
        if (structure_1.StructureElement.Loci.is(loci)) {
            const entry = this.getEntry(loci.structure);
            if (entry) {
                return structure_1.StructureElement.Loci.isSubset(entry.selection, loci);
            }
        }
        return false;
    }
    tryGetRange(loci) {
        if (!structure_1.StructureElement.Loci.is(loci))
            return;
        if (loci.elements.length !== 1)
            return;
        const entry = this.getEntry(loci.structure);
        if (!entry)
            return;
        const xs = loci.elements[0];
        if (!xs)
            return;
        const ref = this.referenceLoci;
        if (!ref || !structure_1.StructureElement.Loci.is(ref) || ref.structure !== loci.structure)
            return;
        let e;
        for (const _e of ref.elements) {
            if (xs.unit === _e.unit) {
                e = _e;
                break;
            }
        }
        if (!e)
            return;
        if (xs.unit !== e.unit)
            return;
        return getElementRange(loci.structure, e, xs);
    }
    /** Count of all selected elements */
    elementCount() {
        let count = 0;
        this.entries.forEach(v => {
            count += structure_1.StructureElement.Loci.size(v.selection);
        });
        return count;
    }
    getBoundary() {
        const min = linear_algebra_1.Vec3.create(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        const max = linear_algebra_1.Vec3.create(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
        boundaryHelper.reset();
        const boundaries = [];
        this.entries.forEach(v => {
            const loci = v.selection;
            if (!structure_1.StructureElement.Loci.isEmpty(loci)) {
                boundaries.push(structure_1.StructureElement.Loci.getBoundary(loci));
            }
        });
        for (let i = 0, il = boundaries.length; i < il; ++i) {
            const { box, sphere } = boundaries[i];
            linear_algebra_1.Vec3.min(min, min, box.min);
            linear_algebra_1.Vec3.max(max, max, box.max);
            boundaryHelper.includePositionRadius(sphere.center, sphere.radius);
        }
        boundaryHelper.finishedIncludeStep();
        for (let i = 0, il = boundaries.length; i < il; ++i) {
            const { sphere } = boundaries[i];
            boundaryHelper.radiusPositionRadius(sphere.center, sphere.radius);
        }
        return { box: { min, max }, sphere: boundaryHelper.getSphere() };
    }
    getPrincipalAxes() {
        const values = (0, util_1.iterableToArray)(this.entries.values());
        return structure_1.StructureElement.Loci.getPrincipalAxesMany(values.map(v => v.selection));
    }
    modify(modifier, loci) {
        let changed = false;
        switch (modifier) {
            case 'add':
                changed = this.add(loci);
                break;
            case 'remove':
                changed = this.remove(loci);
                break;
            case 'intersect':
                changed = this.intersect(loci);
                break;
            case 'set':
                changed = this.set(loci);
                break;
        }
        if (changed) {
            this.state.stats = void 0;
            this.events.changed.next(void 0);
        }
    }
    get applicableStructures() {
        return this.plugin.managers.structure.hierarchy.selection.structures
            .filter(s => !!s.cell.obj)
            .map(s => s.cell.obj.data);
    }
    triggerInteraction(modifier, loci, applyGranularity = true) {
        switch (modifier) {
            case 'add':
                this.plugin.managers.interactivity.lociSelects.select({ loci }, applyGranularity);
                break;
            case 'remove':
                this.plugin.managers.interactivity.lociSelects.deselect({ loci }, applyGranularity);
                break;
            case 'intersect':
                this.plugin.managers.interactivity.lociSelects.selectJoin({ loci }, applyGranularity);
                break;
            case 'set':
                this.plugin.managers.interactivity.lociSelects.selectOnly({ loci }, applyGranularity);
                break;
        }
    }
    fromLoci(modifier, loci, applyGranularity = true) {
        this.triggerInteraction(modifier, loci, applyGranularity);
    }
    fromCompiledQuery(modifier, query, applyGranularity = true) {
        for (const s of this.applicableStructures) {
            const loci = query(new structure_1.QueryContext(s));
            this.triggerInteraction(modifier, structure_1.StructureSelection.toLociWithSourceUnits(loci), applyGranularity);
        }
    }
    fromSelectionQuery(modifier, query, applyGranularity = true) {
        this.plugin.runTask(mol_task_1.Task.create('Structure Selection', async (runtime) => {
            for (const s of this.applicableStructures) {
                const loci = await query.getSelection(this.plugin, runtime, s);
                this.triggerInteraction(modifier, structure_1.StructureSelection.toLociWithSourceUnits(loci), applyGranularity);
            }
        }));
    }
    fromSelections(ref) {
        var _a;
        const cell = mol_state_1.StateObjectRef.resolveAndCheck(this.plugin.state.data, ref);
        if (!cell || !cell.obj)
            return;
        if (!objects_1.PluginStateObject.Molecule.Structure.Selections.is(cell.obj)) {
            console.warn('fromSelections applied to wrong object type.', cell.obj);
            return;
        }
        this.clear();
        for (const s of (_a = cell.obj) === null || _a === void 0 ? void 0 : _a.data) {
            this.fromLoci('set', s.loci);
        }
    }
    getSnapshot() {
        const entries = [];
        this.entries.forEach((entry, ref) => {
            entries.push({
                ref,
                bundle: structure_1.StructureElement.Bundle.fromLoci(entry.selection)
            });
        });
        return { entries };
    }
    setSnapshot(snapshot) {
        var _a, _b;
        this.entries.clear();
        for (const { ref, bundle } of snapshot.entries) {
            const structure = (_b = (_a = this.plugin.state.data.select(mol_state_1.StateSelection.Generators.byRef(ref))[0]) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data;
            if (!structure)
                continue;
            const loci = structure_1.StructureElement.Bundle.toLoci(bundle, structure);
            this.fromLoci('set', loci, false);
        }
    }
    constructor(plugin) {
        super({ entries: new Map(), additionsHistory: [], stats: SelectionStats() });
        this.plugin = plugin;
        this.events = {
            changed: this.ev(),
            additionsHistoryUpdated: this.ev(),
            loci: {
                add: this.ev(),
                remove: this.ev(),
                clear: this.ev()
            }
        };
        // listen to events from substructureParent helper to ensure it is updated
        plugin.helpers.substructureParent.events.removed.subscribe(e => this.onRemove(e.ref, e.obj));
        plugin.helpers.substructureParent.events.updated.subscribe(e => this.onUpdate(e.ref, e.oldObj, e.obj));
    }
}
exports.StructureSelectionManager = StructureSelectionManager;
function SelectionStats() { return { structureCount: 0, elementCount: 0, label: 'Nothing Selected' }; }
;
class SelectionEntry {
    get selection() { return this._selection; }
    set selection(value) {
        this._selection = value;
        this._structure = void 0;
    }
    get structure() {
        if (this._structure)
            return this._structure;
        if (loci_1.Loci.isEmpty(this._selection)) {
            this._structure = void 0;
        }
        else {
            this._structure = structure_1.StructureElement.Loci.toStructure(this._selection);
        }
        return this._structure;
    }
    constructor(selection) {
        this._structure = void 0;
        this._selection = selection;
    }
}
/** remap `selection-entry` to be related to `structure` if possible */
function remapSelectionEntry(e, s) {
    return new SelectionEntry(structure_1.StructureElement.Loci.remap(e.selection, s));
}
/**
 * Assumes `ref` and `ext` belong to the same unit in the same structure
 */
function getElementRange(structure, ref, ext) {
    const min = Math.min(int_1.OrderedSet.min(ref.indices), int_1.OrderedSet.min(ext.indices));
    const max = Math.max(int_1.OrderedSet.max(ref.indices), int_1.OrderedSet.max(ext.indices));
    return structure_1.StructureElement.Loci(structure, [{
            unit: ref.unit,
            indices: int_1.OrderedSet.ofRange(min, max)
        }]);
}
