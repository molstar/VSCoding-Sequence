/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { arrayFind } from '../../../mol-data/util';
import { StateObjectRef } from '../../../mol-state';
import { Task } from '../../../mol-task';
import { isProductionMode } from '../../../mol-util/debug';
import { objectForEach } from '../../../mol-util/object';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { PresetTrajectoryHierarchy } from './hierarchy-preset';
import { arrayRemoveInPlace } from '../../../mol-util/array';
export class TrajectoryHierarchyBuilder {
    resolveProvider(ref) {
        var _a;
        return typeof ref === 'string'
            ? (_a = PresetTrajectoryHierarchy[ref]) !== null && _a !== void 0 ? _a : arrayFind(this._providers, p => p.id === ref)
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
        return PD.Select('auto', options);
    }
    getPresetsWithOptions(t) {
        const options = [];
        const map = Object.create(null);
        for (const p of this._providers) {
            if (p.isApplicable && !p.isApplicable(t, this.plugin))
                continue;
            options.push([p.id, p.display.name]);
            map[p.id] = p.params ? PD.Group(p.params(t, this.plugin)) : PD.EmptyGroup();
        }
        if (options.length === 0)
            return PD.MappedStatic('', { '': PD.EmptyGroup() });
        return PD.MappedStatic(options[0][0], map, { options });
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
        arrayRemoveInPlace(this._providers, provider);
    }
    applyPreset(parent, providerRef, params) {
        const provider = this.resolveProvider(providerRef);
        if (!provider)
            return;
        const state = this.plugin.state.data;
        const cell = StateObjectRef.resolveAndCheck(state, parent);
        if (!cell) {
            if (!isProductionMode)
                console.warn(`Applying hierarchy preset provider to bad cell.`);
            return;
        }
        const prms = params || (provider.params
            ? PD.getDefaultValues(provider.params(cell.obj, this.plugin))
            : {});
        const task = Task.create(`${provider.display.name}`, () => provider.apply(cell, prms, this.plugin));
        return this.plugin.runTask(task);
    }
    constructor(plugin) {
        this.plugin = plugin;
        this._providers = [];
        this.providerMap = new Map();
        this.defaultProvider = PresetTrajectoryHierarchy.default;
        objectForEach(PresetTrajectoryHierarchy, r => this.registerPreset(r));
    }
}
