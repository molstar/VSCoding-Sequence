"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolumeHierarchyManager = void 0;
const state_1 = require("../../../mol-plugin/behavior/static/state");
const component_1 = require("../../component");
const hierarchy_state_1 = require("./hierarchy-state");
const volume_representation_params_1 = require("../../helpers/volume-representation-params");
const transforms_1 = require("../../transforms");
class VolumeHierarchyManager extends component_1.PluginComponent {
    get dataState() {
        return this.plugin.state.data;
    }
    get current() {
        this.sync(false);
        return this.state.hierarchy;
    }
    get selection() {
        this.sync(false);
        return this.state.selection;
    }
    sync(notify) {
        if (!notify && this.dataState.inUpdate)
            return;
        if (this.state.syncedTree === this.dataState.tree) {
            if (notify && !this.state.notified) {
                this.state.notified = true;
                this.behaviors.selection.next({ hierarchy: this.state.hierarchy, volume: this.state.selection });
            }
            return;
        }
        this.state.syncedTree = this.dataState.tree;
        const update = (0, hierarchy_state_1.buildVolumeHierarchy)(this.plugin.state.data, this.current);
        if (!update.changed) {
            return;
        }
        const { hierarchy } = update;
        this.state.hierarchy = hierarchy;
        if (!this.state.selection) {
            this.state.selection = hierarchy.volumes[0];
        }
        else {
            this.state.selection = hierarchy.refs.has(this.state.selection.cell.transform.ref) ? hierarchy.refs.get(this.state.selection.cell.transform.ref) : hierarchy.volumes[0];
        }
        if (notify) {
            this.state.notified = true;
            this.behaviors.selection.next({ hierarchy, volume: this.state.selection });
        }
        else {
            this.state.notified = false;
        }
    }
    setCurrent(volume) {
        this.state.selection = volume || this.state.hierarchy.volumes[0];
        this.behaviors.selection.next({ hierarchy: this.state.hierarchy, volume: volume || this.state.hierarchy.volumes[0] });
    }
    // TODO: have common util
    remove(refs, canUndo) {
        if (refs.length === 0)
            return;
        const deletes = this.plugin.state.data.build();
        for (const r of refs)
            deletes.delete(typeof r === 'string' ? r : r.cell.transform.ref);
        return deletes.commit({ canUndo: canUndo ? 'Remove' : false });
    }
    // TODO: have common util
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
    addRepresentation(ref, type) {
        var _a;
        const update = this.dataState.build()
            .to(ref.cell)
            .apply(transforms_1.StateTransforms.Representation.VolumeRepresentation3D, (0, volume_representation_params_1.createVolumeRepresentationParams)(this.plugin, (_a = ref.cell.obj) === null || _a === void 0 ? void 0 : _a.data, {
            type: type,
        }));
        return update.commit({ canUndo: 'Add Representation' });
    }
    constructor(plugin) {
        super();
        this.plugin = plugin;
        this.state = {
            syncedTree: this.dataState.tree,
            notified: false,
            hierarchy: (0, hierarchy_state_1.VolumeHierarchy)(),
            selection: void 0
        };
        this.behaviors = {
            selection: this.ev.behavior({
                hierarchy: this.current,
                volume: this.selection
            })
        };
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
exports.VolumeHierarchyManager = VolumeHierarchyManager;
(function (VolumeHierarchyManager) {
    function getRepresentationTypes(plugin, pivot) {
        var _a, _b;
        return ((_a = pivot === null || pivot === void 0 ? void 0 : pivot.cell.obj) === null || _a === void 0 ? void 0 : _a.data)
            ? plugin.representation.volume.registry.getApplicableTypes((_b = pivot.cell.obj) === null || _b === void 0 ? void 0 : _b.data)
            : plugin.representation.volume.registry.types;
    }
    VolumeHierarchyManager.getRepresentationTypes = getRepresentationTypes;
})(VolumeHierarchyManager || (exports.VolumeHierarchyManager = VolumeHierarchyManager = {}));
