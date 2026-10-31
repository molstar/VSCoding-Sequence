/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { arrayFind } from '../../../mol-data/util';
import { StateObjectRef } from '../../../mol-state';
import { Task } from '../../../mol-task';
import { isProductionMode } from '../../../mol-util/debug';
import { objectForEach } from '../../../mol-util/object';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { createStructureRepresentationParams } from '../../helpers/structure-representation-params';
import { StructureRepresentation3D } from '../../transforms/representation';
import { PresetStructureRepresentations } from './representation-preset';
import { arrayRemoveInPlace } from '../../../mol-util/array';
import { PluginConfig } from '../../../mol-plugin/config';
export class StructureRepresentationBuilder {
    get dataState() { return this.plugin.state.data; }
    resolveProvider(ref) {
        var _a;
        return typeof ref === 'string'
            ? (_a = PresetStructureRepresentations[ref]) !== null && _a !== void 0 ? _a : arrayFind(this._providers, p => p.id === ref)
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
        return PD.Select('auto', options);
    }
    getPresetsWithOptions(s) {
        const options = [];
        const map = Object.create(null);
        for (const p of this._providers) {
            if (p.isApplicable && !p.isApplicable(s, this.plugin))
                continue;
            options.push([p.id, p.display.name]);
            map[p.id] = p.params ? PD.Group(p.params(s, this.plugin)) : PD.EmptyGroup();
        }
        if (options.length === 0)
            return PD.MappedStatic('', { '': PD.EmptyGroup() });
        return PD.MappedStatic(options[0][0], map, { options });
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
        arrayRemoveInPlace(this._providers, provider);
    }
    applyPreset(parent, providerRef, params) {
        var _a;
        const provider = this.resolveProvider(providerRef);
        if (!provider)
            return;
        const state = this.plugin.state.data;
        const cell = StateObjectRef.resolveAndCheck(state, parent);
        if (!cell) {
            if (!isProductionMode)
                console.warn(`Applying structure repr. provider to bad cell.`);
            return;
        }
        const pd = ((_a = provider.params) === null || _a === void 0 ? void 0 : _a.call(provider, cell.obj, this.plugin)) || {};
        let prms = params || (provider.params
            ? PD.getDefaultValues(pd)
            : {});
        const defaults = this.plugin.config.get(PluginConfig.Structure.DefaultRepresentationPresetParams);
        prms = PD.merge(pd, defaults, prms);
        const task = Task.create(`${provider.display.name}`, () => provider.apply(cell, prms, this.plugin));
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
        const data = (_b = (_a = StateObjectRef.resolveAndCheck(this.dataState, structure)) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data;
        if (!data)
            return;
        const params = createStructureRepresentationParams(this.plugin, data, props);
        return (options === null || options === void 0 ? void 0 : options.tag)
            ? builder.to(structure).applyOrUpdateTagged(options.tag, StructureRepresentation3D, params, { state: options === null || options === void 0 ? void 0 : options.initialState }).selector
            : builder.to(structure).apply(StructureRepresentation3D, params, { state: options === null || options === void 0 ? void 0 : options.initialState }).selector;
    }
    constructor(plugin) {
        this.plugin = plugin;
        this._providers = [];
        this.providerMap = new Map();
        this.defaultProvider = PresetStructureRepresentations.auto;
        objectForEach(PresetStructureRepresentations, r => this.registerPreset(r));
    }
}
