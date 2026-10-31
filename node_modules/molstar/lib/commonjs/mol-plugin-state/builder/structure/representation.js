"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureRepresentationBuilder = void 0;
const util_1 = require("../../../mol-data/util");
const mol_state_1 = require("../../../mol-state");
const mol_task_1 = require("../../../mol-task");
const debug_1 = require("../../../mol-util/debug");
const object_1 = require("../../../mol-util/object");
const param_definition_1 = require("../../../mol-util/param-definition");
const structure_representation_params_1 = require("../../helpers/structure-representation-params");
const representation_1 = require("../../transforms/representation");
const representation_preset_1 = require("./representation-preset");
const array_1 = require("../../../mol-util/array");
const config_1 = require("../../../mol-plugin/config");
class StructureRepresentationBuilder {
    get dataState() { return this.plugin.state.data; }
    resolveProvider(ref) {
        var _a;
        return typeof ref === 'string'
            ? (_a = representation_preset_1.PresetStructureRepresentations[ref]) !== null && _a !== void 0 ? _a : (0, util_1.arrayFind)(this._providers, p => p.id === ref)
            : ref;
    }
    hasPreset(s) {
        for (const p of this._providers) {
            if (!p.isApplicable || p.isApplicable(s, this.plugin))
                return true;
        }
        return false;
    }
    get providers() { return this._providers; }
    getPresets(s) {
        if (!s)
            return this.providers;
        const ret = [];
        for (const p of this._providers) {
            if (p.isApplicable && !p.isApplicable(s, this.plugin))
                continue;
            ret.push(p);
        }
        return ret;
    }
    getPresetSelect(s) {
        const options = [];
        for (const p of this._providers) {
            if (s && p.isApplicable && !p.isApplicable(s, this.plugin))
                continue;
            options.push([p.id, p.display.name, p.display.group]);
        }
        return param_definition_1.ParamDefinition.Select('auto', options);
    }
    getPresetsWithOptions(s) {
        const options = [];
        const map = Object.create(null);
        for (const p of this._providers) {
            if (p.isApplicable && !p.isApplicable(s, this.plugin))
                continue;
            options.push([p.id, p.display.name]);
            map[p.id] = p.params ? param_definition_1.ParamDefinition.Group(p.params(s, this.plugin)) : param_definition_1.ParamDefinition.EmptyGroup();
        }
        if (options.length === 0)
            return param_definition_1.ParamDefinition.MappedStatic('', { '': param_definition_1.ParamDefinition.EmptyGroup() });
        return param_definition_1.ParamDefinition.MappedStatic(options[0][0], map, { options });
    }
    registerPreset(provider) {
        if (this.providerMap.has(provider.id)) {
            throw new Error(`Representation provider with id '${provider.id}' already registered.`);
        }
        this._providers.push(provider);
        this.providerMap.set(provider.id, provider);
    }
    unregisterPreset(provider) {
        this.providerMap.delete(provider.id);
        (0, array_1.arrayRemoveInPlace)(this._providers, provider);
    }
    applyPreset(parent, providerRef, params) {
        var _a;
        const provider = this.resolveProvider(providerRef);
        if (!provider)
            return;
        const state = this.plugin.state.data;
        const cell = mol_state_1.StateObjectRef.resolveAndCheck(state, parent);
        if (!cell) {
            if (!debug_1.isProductionMode)
                console.warn(`Applying structure repr. provider to bad cell.`);
            return;
        }
        const pd = ((_a = provider.params) === null || _a === void 0 ? void 0 : _a.call(provider, cell.obj, this.plugin)) || {};
        let prms = params || (provider.params
            ? param_definition_1.ParamDefinition.getDefaultValues(pd)
            : {});
        const defaults = this.plugin.config.get(config_1.PluginConfig.Structure.DefaultRepresentationPresetParams);
        prms = param_definition_1.ParamDefinition.merge(pd, defaults, prms);
        const task = mol_task_1.Task.create(`${provider.display.name}`, () => provider.apply(cell, prms, this.plugin));
        return this.plugin.runTask(task);
    }
    async addRepresentation(structure, props, options) {
        const repr = this.dataState.build();
        const selector = this.buildRepresentation(repr, structure, props, options);
        if (!selector)
            return;
        await repr.commit();
        return selector;
    }
    buildRepresentation(builder, structure, props, options) {
        var _a, _b;
        if (!structure)
            return;
        const data = (_b = (_a = mol_state_1.StateObjectRef.resolveAndCheck(this.dataState, structure)) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data;
        if (!data)
            return;
        const params = (0, structure_representation_params_1.createStructureRepresentationParams)(this.plugin, data, props);
        return (options === null || options === void 0 ? void 0 : options.tag)
            ? builder.to(structure).applyOrUpdateTagged(options.tag, representation_1.StructureRepresentation3D, params, { state: options === null || options === void 0 ? void 0 : options.initialState }).selector
            : builder.to(structure).apply(representation_1.StructureRepresentation3D, params, { state: options === null || options === void 0 ? void 0 : options.initialState }).selector;
    }
    constructor(plugin) {
        this.plugin = plugin;
        this._providers = [];
        this.providerMap = new Map();
        this.defaultProvider = representation_preset_1.PresetStructureRepresentations.auto;
        (0, object_1.objectForEach)(representation_preset_1.PresetStructureRepresentations, r => this.registerPreset(r));
    }
}
exports.StructureRepresentationBuilder = StructureRepresentationBuilder;
