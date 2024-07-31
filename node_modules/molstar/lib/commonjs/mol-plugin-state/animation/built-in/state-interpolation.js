"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimateStateInterpolation = void 0;
const commands_1 = require("../../../mol-plugin/commands");
const mol_state_1 = require("../../../mol-state");
const mol_util_1 = require("../../../mol-util");
const param_definition_1 = require("../../../mol-util/param-definition");
const model_1 = require("../model");
exports.AnimateStateInterpolation = model_1.PluginStateAnimation.create({
    name: 'built-in.animate-state-interpolation',
    display: { name: 'Animate State (experimental)' },
    params: () => ({
        transtionDurationInMs: param_definition_1.ParamDefinition.Numeric(2000, { min: 100, max: 30000, step: 10 })
    }),
    canApply(plugin) {
        return { canApply: plugin.managers.snapshot.state.entries.size > 1 };
    },
    initialState: () => ({}),
    async apply(animState, t, ctx) {
        const snapshots = ctx.plugin.managers.snapshot.state.entries;
        if (snapshots.size < 2)
            return { kind: 'finished' };
        const currentT = (t.current % ctx.params.transtionDurationInMs) / ctx.params.transtionDurationInMs;
        const srcIndex = Math.floor(t.current / ctx.params.transtionDurationInMs) % snapshots.size;
        let tarIndex = Math.ceil(t.current / ctx.params.transtionDurationInMs);
        if (tarIndex === srcIndex)
            tarIndex++;
        tarIndex = tarIndex % snapshots.size;
        const _src = snapshots.get(srcIndex).snapshot, _tar = snapshots.get(tarIndex).snapshot;
        if (!_src.data || !_tar.data)
            return { kind: 'skip' };
        const src = _src.data.tree.transforms, tar = _tar.data.tree.transforms;
        const state = ctx.plugin.state.data;
        const update = state.build();
        for (const s of src) {
            for (const t of tar) {
                // TODO: better than quadratic alg.
                // TODO: support for adding/removing nodes
                if (t.ref !== s.ref)
                    continue;
                if (t.version === s.version)
                    continue;
                const e = mol_state_1.StateTransform.fromJSON(s), f = mol_state_1.StateTransform.fromJSON(t);
                const oldState = state.cells.get(s.ref);
                if (!oldState)
                    continue;
                let newState;
                if (!e.transformer.definition.interpolate) {
                    newState = currentT <= 0.5 ? e.params : f.params;
                }
                else {
                    newState = e.transformer.definition.interpolate(e.params, f.params, currentT, ctx.plugin);
                }
                if (!(0, mol_util_1.shallowEqual)(oldState, newState)) {
                    update.to(s.ref).update(newState);
                }
            }
        }
        await commands_1.PluginCommands.State.Update(ctx.plugin, { state, tree: update, options: { doNotLogTiming: true } });
        return { kind: 'next', state: {} };
    }
});
