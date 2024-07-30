"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrajectoryHierarchyBuilder = void 0;
const util_1 = require("../../../mol-data/util");
const mol_state_1 = require("../../../mol-state");
const mol_task_1 = require("../../../mol-task");
const debug_1 = require("../../../mol-util/debug");
const object_1 = require("../../../mol-util/object");
const param_definition_1 = require("../../../mol-util/param-definition");
const hierarchy_preset_1 = require("./hierarchy-preset");
const array_1 = require("../../../mol-util/array");
class TrajectoryHierarchyBuilder {
    resolveProvider(ref) {
        var _a;
        return typeof ref === 'string'
            ? (_a = hierarchy_preset_1.PresetTrajectoryHierarchy[ref]) !== null && _a !== void 0 ? _a : (0, util_1.arrayFind)(this._providers, p => p.id === ref)
            : ref;
    }
    hasPreset(t) {
        for (const p of this._providers) {
            if (!p.isApplicable || p.isApplicable(t, this.plugin))
                return true;
        }
        return false;
    }
    get providers() { return this._providers; }
    getPresets(t) {
        if (!t)
            return this.providers;
        const ret = [];
        for (const p of this._providers) {
            if (p.isApplicable && !p.isApplicable(t, this.plugin))
                continue;
            ret.push(p);
        }
        return ret;
    }
    getPresetSelect(t) {
        const options = [];
        for (const p of this._providers) {
            if (t && p.isApplicable && !p.isApplicable(t, this.plugin))
                continue;
            options.push([p.id, p.display.name]);
        }
        return param_definition_1.ParamDefinition.Select('auto', options);
    }
    getPresetsWithOptions(t) {
        const options = [];
        const map = Object.create(null);
        for (const p of this._providers) {
            if (p.isApplicable && !p.isApplicable(t, this.plugin))
                continue;
            options.push([p.id, p.display.name]);
            map[p.id] = p.params ? param_definition_1.ParamDefinition.Group(p.params(t, this.plugin)) : param_definition_1.ParamDefinition.EmptyGroup();
        }
        if (options.length === 0)
            return param_definition_1.ParamDefinition.MappedStatic('', { '': param_definition_1.ParamDefinition.EmptyGroup() });
        return param_definition_1.ParamDefinition.MappedStatic(options[0][0], map, { options });
    }
    registerPreset(provider) {
        if (this.providerMap.has(provider.id)) {
            throw new Error(`Hierarchy provider with id '${provider.id}' already registered.`);
        }
        this._providers.push(provider);
        this.providerMap.set(provider.id, provider);
    }
    unregisterPreset(provider) {
        this.providerMap.delete(provider.id);
        (0, array_1.arrayRemoveInPlace)(this._providers, provider);
    }
    applyPreset(parent, providerRef, params) {
        const provider = this.resolveProvider(providerRef);
        if (!provider)
            return;
        const state = this.plugin.state.data;
        const cell = mol_state_1.StateObjectRef.resolveAndCheck(state, parent);
        if (!cell) {
            if (!debug_1.isProductionMode)
                console.warn(`Applying hierarchy preset provider to bad cell.`);
            return;
        }
        const prms = params || (provider.params
            ? param_definition_1.ParamDefinition.getDefaultValues(provider.params(cell.obj, this.plugin))
            : {});
        const task = mol_task_1.Task.create(`${provider.display.name}`, () => provider.apply(cell, prms, this.plugin));
        return this.plugin.runTask(task);
    }
    constructor(plugin) {
        this.plugin = plugin;
        this._providers = [];
        this.providerMap = new Map();
        this.defaultProvider = hierarchy_preset_1.PresetTrajectoryHierarchy.default;
        (0, object_1.objectForEach)(hierarchy_preset_1.PresetTrajectoryHierarchy, r => this.registerPreset(r));
    }
}
exports.TrajectoryHierarchyBuilder = TrajectoryHierarchyBuilder;
