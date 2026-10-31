"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureFocusManager = void 0;
const component_1 = require("../../component");
const array_1 = require("../../../mol-util/array");
const structure_1 = require("../../../mol-model/structure");
const loci_1 = require("../../../mol-model/loci");
const label_1 = require("../../../mol-theme/label");
const objects_1 = require("../../objects");
const mol_state_1 = require("../../../mol-state");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const geometry_1 = require("../../../mol-math/geometry");
const HISTORY_CAPACITY = 8;
class StructureFocusManager extends component_1.StatefulPluginComponent {
    get current() { return this.state.current; }
    get history() { return this.state.history; }
    tryAddHistory(entry) {
        if (structure_1.StructureElement.Loci.isEmpty(entry.loci))
            return;
        let idx = 0, existingEntry = void 0;
        for (const e of this.state.history) {
            if (structure_1.StructureElement.Loci.areEqual(e.loci, entry.loci)) {
                existingEntry = e;
                break;
            }
            idx++;
        }
        if (existingEntry) {
            // move to top, use new
            (0, array_1.arrayRemoveAtInPlace)(this.state.history, idx);
            this.state.history.unshift(entry);
            this.events.historyUpdated.next(void 0);
            return;
        }
        this.state.history.unshift(entry);
        if (this.state.history.length > HISTORY_CAPACITY)
            this.state.history.pop();
        this.events.historyUpdated.next(void 0);
    }
    set(entry) {
        this.tryAddHistory(entry);
        if (!this.state.current || !structure_1.StructureElement.Loci.areEqual(this.state.current.loci, entry.loci)) {
            this.state.current = entry;
            this.behaviors.current.next(entry);
        }
    }
    setFromLoci(anyLoci) {
        const loci = loci_1.Loci.normalize(anyLoci);
        if (!structure_1.StructureElement.Loci.is(loci) || structure_1.StructureElement.Loci.isEmpty(loci)) {
            this.clear();
            return;
        }
        this.set({ loci, label: (0, label_1.lociLabel)(loci, { reverse: true, hidePrefix: true, htmlStyling: false }) });
    }
    addFromLoci(anyLoci) {
        const union = this.state.current && structure_1.StructureElement.Loci.is(anyLoci) && anyLoci.structure === this.state.current.loci.structure
            ? structure_1.StructureElement.Loci.union(anyLoci, this.state.current.loci)
            : anyLoci;
        this.setFromLoci(union);
    }
    clear() {
        if (this.state.current) {
            this.state.current = undefined;
            this.behaviors.current.next(void 0);
        }
    }
    getSnapshot() {
        if (!this.current)
            return {};
        const node = this.plugin.helpers.substructureParent.get(this.current.loci.structure);
        const ref = node === null || node === void 0 ? void 0 : node.transform.ref;
        if (!ref)
            return {};
        return {
            current: {
                label: this.current.label,
                ref,
                bundle: structure_1.StructureElement.Bundle.fromLoci(this.current.loci),
                category: this.current.category
            }
        };
    }
    setSnapshot(snapshot) {
        var _a, _b;
        if (!snapshot.current) {
            this.clear();
            return;
        }
        const { label, ref, bundle, category } = snapshot.current;
        const structure = (_b = (_a = this.plugin.state.data.select(mol_state_1.StateSelection.Generators.byRef(ref))[0]) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data;
        if (!structure)
            return;
        const loci = structure_1.StructureElement.Bundle.toLoci(bundle, structure);
        this.set({ label, loci, category });
    }
    constructor(plugin) {
        super({ history: [] });
        this.plugin = plugin;
        this.events = {
            historyUpdated: this.ev()
        };
        this.behaviors = {
            current: this.ev.behavior(void 0)
        };
        plugin.state.data.events.object.removed.subscribe(({ obj }) => {
            var _a;
            if (!objects_1.PluginStateObject.Molecule.Structure.is(obj))
                return;
            if (((_a = this.current) === null || _a === void 0 ? void 0 : _a.loci.structure) === obj.data) {
                this.clear();
            }
            const keep = [];
            for (const e of this.history) {
                if (e.loci.structure === obj.data)
                    keep.push(e);
            }
            if (keep.length !== this.history.length) {
                this.history.length = 0;
                this.history.push(...keep);
                this.events.historyUpdated.next(void 0);
            }
        });
        const sphere = (0, geometry_1.Sphere3D)();
        plugin.state.data.events.object.updated.subscribe(({ oldData, obj, action }) => {
            var _a;
            if (!objects_1.PluginStateObject.Molecule.Structure.is(obj))
                return;
            // structure NOT changed, keep everything as is; fixes #123
            if (oldData === obj.data)
                return;
            // structure changed (e.g. coordinates), try to remap and re-focus
            if (action === 'in-place') {
                const current = this.state.current;
                const structure = obj.data;
                if (current && current.loci.structure === oldData) {
                    const loci = structure_1.StructureElement.Loci.remap(current.loci, structure);
                    this.state.current = { ...current, loci };
                    this.behaviors.current.next(this.state.current);
                    loci_1.Loci.getBoundingSphere(loci, sphere);
                    const camera = (_a = this.plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.camera;
                    const d = camera.getTargetDistance(sphere.radius + 4); // default extraRadius
                    if (linear_algebra_1.Vec3.distance(camera.target, sphere.center) > sphere.radius ||
                        d > camera.viewport.height / camera.zoom) {
                        this.plugin.managers.camera.focusSphere(sphere, { durationMs: 0 });
                    }
                }
                // TODO remap history as well
            }
        });
    }
}
exports.StructureFocusManager = StructureFocusManager;
