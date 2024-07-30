"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureHierarchyManager = void 0;
const state_1 = require("../../../mol-plugin/behavior/static/state");
const commands_1 = require("../../../mol-plugin/commands");
const mol_state_1 = require("../../../mol-state");
const set_1 = require("../../../mol-util/set");
const component_1 = require("../../component");
const objects_1 = require("../../objects");
const hierarchy_state_1 = require("./hierarchy-state");
class StructureHierarchyManager extends component_1.PluginComponent {
    get dataState() {
        return this.plugin.state.data;
    }
    get currentComponentGroups() {
        if (this._currentComponentGroups)
            return this._currentComponentGroups;
        this._currentComponentGroups = StructureHierarchyManager.getComponentGroups(this.selection.structures);
        return this._currentComponentGroups;
    }
    get seletionSet() {
        if (this._currentSelectionSet)
            return this._currentSelectionSet;
        this._currentSelectionSet = new Set();
        for (const r of this.selection.trajectories)
            this._currentSelectionSet.add(r.cell.transform.ref);
        for (const r of this.selection.models)
            this._currentSelectionSet.add(r.cell.transform.ref);
        for (const r of this.selection.structures)
            this._currentSelectionSet.add(r.cell.transform.ref);
        return this._currentSelectionSet;
    }
    get current() {
        this.sync(false);
        return this.state.hierarchy;
    }
    get selection() {
        this.sync(false);
        return this.state.selection;
    }
    getStructuresWithSelection() {
        const xs = this.plugin.managers.structure.hierarchy.current.structures;
        const ret = [];
        for (const s of xs) {
            if (this.plugin.managers.structure.selection.structureHasSelection(s)) {
                ret.push(s);
            }
        }
        return ret;
    }
    findStructure(structure) {
        if (!structure)
            return undefined;
        const parent = this.plugin.helpers.substructureParent.get(structure);
        if (!parent)
            return undefined;
        const root = this.plugin.state.data.selectQ(q => q.byValue(parent).rootOfType(objects_1.PluginStateObject.Molecule.Structure))[0];
        if (!root)
            return undefined;
        return this.behaviors.selection.value.structures.find(s => s.cell === root);
    }
    syncCurrent(all, added) {
        const current = this.seletionSet;
        const newCurrent = [];
        for (const r of all) {
            const ref = r.cell.transform.ref;
            if (current.has(ref) || added.has(ref))
                newCurrent.push(r);
        }
        if (newCurrent.length === 0)
            return all.length > 0 ? [all[0]] : [];
        return newCurrent;
    }
    sync(notify) {
        if (!notify && this.dataState.inUpdate)
            return;
        if (this.state.syncedTree === this.dataState.tree) {
            if (notify && !this.state.notified) {
                this.state.notified = true;
                this.behaviors.selection.next({ hierarchy: this.state.hierarchy, ...this.state.selection });
            }
            return;
        }
        this.state.syncedTree = this.dataState.tree;
        const update = (0, hierarchy_state_1.buildStructureHierarchy)(this.plugin.state.data, this.current);
        if (!update.changed) {
            return;
        }
        const { hierarchy } = update;
        const trajectories = this.syncCurrent(hierarchy.trajectories, update.added);
        const models = this.syncCurrent(hierarchy.models, update.added);
        const structures = this.syncCurrent(hierarchy.structures, update.added);
        this._currentComponentGroups = void 0;
        this._currentSelectionSet = void 0;
        this.state.hierarchy = hierarchy;
        this.state.selection.trajectories = trajectories;
        this.state.selection.models = models;
        this.state.selection.structures = structures;
        if (notify) {
            this.state.notified = true;
            this.behaviors.selection.next({ hierarchy, trajectories, models, structures });
        }
        else {
            this.state.notified = false;
        }
    }
    updateCurrent(refs, action) {
        const hierarchy = this.current;
        const set = action === 'add'
            ? set_1.SetUtils.union(this.seletionSet, new Set(refs.map(r => r.cell.transform.ref)))
            : set_1.SetUtils.difference(this.seletionSet, new Set(refs.map(r => r.cell.transform.ref)));
        const trajectories = [];
        const models = [];
        const structures = [];
        for (const t of hierarchy.trajectories) {
            if (set.has(t.cell.transform.ref))
                trajectories.push(t);
        }
        for (const m of hierarchy.models) {
            if (set.has(m.cell.transform.ref))
                models.push(m);
        }
        for (const s of hierarchy.structures) {
            if (set.has(s.cell.transform.ref))
                structures.push(s);
        }
        this._currentComponentGroups = void 0;
        this._currentSelectionSet = void 0;
        this.state.selection.trajectories = trajectories;
        this.state.selection.models = models;
        this.state.selection.structures = structures;
        this.behaviors.selection.next({ hierarchy, trajectories, models, structures });
    }
    remove(refs, canUndo) {
        if (refs.length === 0)
            return;
        const deletes = this.plugin.state.data.build();
        for (const r of refs)
            deletes.delete(typeof r === 'string' ? r : r.cell.transform.ref);
        return deletes.commit({ canUndo: canUndo ? 'Remove' : false });
    }
    toggleVisibility(refs, action) {
        if (refs.length === 0)
            return;
        const isHidden = action !== void 0
            ? (action === 'show' ? false : true)
            : !refs[0].cell.state.isHidden;
        for (const c of refs) {
            (0, state_1.setSubtreeVisibility)(this.dataState, c.cell.transform.ref, isHidden);
        }
    }
    applyPreset(trajectories, provider, params) {
        return this.plugin.dataTransaction(async () => {
            for (const t of trajectories) {
                if (t.models.length > 0) {
                    await this.clearTrajectory(t);
                }
                await this.plugin.builders.structure.hierarchy.applyPreset(t.cell, provider, params);
            }
        });
    }
    async updateStructure(s, params) {
        await this.plugin.dataTransaction(async () => {
            const root = mol_state_1.StateTree.getDecoratorRoot(this.dataState.tree, s.cell.transform.ref);
            const children = this.dataState.tree.children.get(root).toArray();
            await this.remove(children, false);
            await this.plugin.state.updateTransform(this.plugin.state.data, s.cell.transform.ref, params, 'Structure Type');
            await this.plugin.builders.structure.representation.applyPreset(s.cell.transform.ref, 'auto');
        }, { canUndo: 'Structure Type' });
        commands_1.PluginCommands.Camera.Reset(this.plugin);
    }
    clearTrajectory(trajectory) {
        const builder = this.dataState.build();
        for (const m of trajectory.models) {
            builder.delete(m.cell);
        }
        return builder.commit();
    }
    constructor(plugin) {
        super();
        this.plugin = plugin;
        this.state = {
            syncedTree: this.dataState.tree,
            notified: false,
            hierarchy: (0, hierarchy_state_1.StructureHierarchy)(),
            selection: {
                trajectories: [],
                models: [],
                structures: []
            }
        };
        this.behaviors = {
            selection: this.ev.behavior({
                hierarchy: this.current,
                trajectories: this.selection.trajectories,
                models: this.selection.models,
                structures: this.selection.structures
            })
        };
        this._currentComponentGroups = void 0;
        this._currentSelectionSet = void 0;
        this.subscribe(plugin.state.data.events.changed, e => {
            if (e.inTransaction || plugin.behaviors.state.isAnimating.value)
                return;
            this.sync(true);
        });
        this.subscribe(plugin.behaviors.state.isAnimating, isAnimating => {
            if (!isAnimating && !plugin.behaviors.state.isUpdating.value)
                this.sync(true);
        });
    }
}
exports.StructureHierarchyManager = StructureHierarchyManager;
(function (StructureHierarchyManager) {
    function getComponentGroups(structures) {
        if (!structures.length)
            return [];
        if (structures.length === 1)
            return structures[0].components.map(c => [c]);
        const groups = [];
        const map = new Map();
        for (const s of structures) {
            for (const c of s.components) {
                const key = c.key;
                if (!key)
                    continue;
                let component = map.get(key);
                if (!component) {
                    component = [];
                    map.set(key, component);
                    groups.push(component);
                }
                component.push(c);
            }
        }
        return groups;
    }
    StructureHierarchyManager.getComponentGroups = getComponentGroups;
    function getSelectedStructuresDescription(plugin) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const { structures } = plugin.managers.structure.hierarchy.selection;
        if (structures.length === 0)
            return '';
        if (structures.length === 1) {
            const s = structures[0];
            const data = (_a = s.cell.obj) === null || _a === void 0 ? void 0 : _a.data;
            if (!data)
                return ((_b = s.cell.obj) === null || _b === void 0 ? void 0 : _b.label) || 'Structure';
            const model = data.models[0] || data.representativeModel || data.masterModel;
            if (!model)
                return ((_c = s.cell.obj) === null || _c === void 0 ? void 0 : _c.label) || 'Structure';
            const entryId = model.entryId;
            if (((_e = (_d = s.model) === null || _d === void 0 ? void 0 : _d.trajectory) === null || _e === void 0 ? void 0 : _e.models) && s.model.trajectory.models.length === 1)
                return entryId;
            if (s.model)
                return `${(_f = s.model.cell.obj) === null || _f === void 0 ? void 0 : _f.label} | ${entryId}`;
            return entryId;
        }
        const p = structures[0];
        const t = (_g = p === null || p === void 0 ? void 0 : p.model) === null || _g === void 0 ? void 0 : _g.trajectory;
        let sameTraj = true;
        for (const s of structures) {
            if (((_h = s === null || s === void 0 ? void 0 : s.model) === null || _h === void 0 ? void 0 : _h.trajectory) !== t) {
                sameTraj = false;
                break;
            }
        }
        return sameTraj && t ? `${(_j = t.cell.obj) === null || _j === void 0 ? void 0 : _j.label} | ${structures.length} structures` : `${structures.length} structures`;
    }
    StructureHierarchyManager.getSelectedStructuresDescription = getSelectedStructuresDescription;
})(StructureHierarchyManager || (exports.StructureHierarchyManager = StructureHierarchyManager = {}));
