"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimateAssemblyUnwind = void 0;
const model_1 = require("../model");
const objects_1 = require("../../objects");
const transforms_1 = require("../../transforms");
const mol_state_1 = require("../../../mol-state");
const commands_1 = require("../../../mol-plugin/commands");
const param_definition_1 = require("../../../mol-util/param-definition");
exports.AnimateAssemblyUnwind = model_1.PluginStateAnimation.create({
    name: 'built-in.animate-assembly-unwind',
    display: { name: 'Unwind Assembly' },
    isExportable: true,
    params: (plugin) => {
        const targets = [['all', 'All']];
        const structures = plugin.state.data.select(mol_state_1.StateSelection.Generators.rootsOfType(objects_1.PluginStateObject.Molecule.Structure));
        for (const s of structures) {
            targets.push([s.transform.ref, s.obj.data.models[0].label]);
        }
        return {
            durationInMs: param_definition_1.ParamDefinition.Numeric(3000, { min: 100, max: 10000, step: 100 }),
            playOnce: param_definition_1.ParamDefinition.Boolean(false),
            target: param_definition_1.ParamDefinition.Select(targets[0][0], targets)
        };
    },
    canApply(plugin) {
        const state = plugin.state.data;
        const root = mol_state_1.StateTransform.RootRef;
        const reprs = state.select(mol_state_1.StateSelection.Generators.ofType(objects_1.PluginStateObject.Molecule.Structure.Representation3D, root));
        return { canApply: reprs.length > 0 };
    },
    getDuration: (params) => {
        return {
            kind: 'fixed',
            durationMs: params.durationInMs
        };
    },
    initialState: () => ({ t: 0 }),
    setup(params, _, plugin) {
        const state = plugin.state.data;
        const root = !params.target || params.target === 'all' ? mol_state_1.StateTransform.RootRef : params.target;
        const reprs = state.select(mol_state_1.StateSelection.Generators.ofType(objects_1.PluginStateObject.Molecule.Structure.Representation3D, root));
        const update = state.build();
        let changed = false;
        for (const r of reprs) {
            const unwinds = state.select(mol_state_1.StateSelection.Generators.ofTransformer(transforms_1.StateTransforms.Representation.UnwindStructureAssemblyRepresentation3D, r.transform.ref));
            if (unwinds.length > 0)
                continue;
            changed = true;
            update.to(r)
                .apply(transforms_1.StateTransforms.Representation.UnwindStructureAssemblyRepresentation3D, { t: 0 }, { tags: 'animate-assembly-unwind' });
        }
        if (!changed)
            return;
        return update.commit({ doNotUpdateCurrent: true });
    },
    teardown(_, __, plugin) {
        const state = plugin.state.data;
        const reprs = state.select(mol_state_1.StateSelection.Generators.ofType(objects_1.PluginStateObject.Molecule.Structure.Representation3DState)
            .withTag('animate-assembly-unwind'));
        if (reprs.length === 0)
            return;
        const update = state.build();
        for (const r of reprs)
            update.delete(r.transform.ref);
        return update.commit();
    },
    async apply(animState, t, ctx) {
        const state = ctx.plugin.state.data;
        const root = !ctx.params.target || ctx.params.target === 'all' ? mol_state_1.StateTransform.RootRef : ctx.params.target;
        const anims = state.select(mol_state_1.StateSelection.Generators.ofTransformer(transforms_1.StateTransforms.Representation.UnwindStructureAssemblyRepresentation3D, root));
        if (anims.length === 0) {
            return { kind: 'finished' };
        }
        const update = state.build();
        const d = (t.current - t.lastApplied) / ctx.params.durationInMs;
        let newTime = (animState.t + d), finished = false;
        if (ctx.params.playOnce && newTime >= 1) {
            finished = true;
            newTime = 1;
        }
        else {
            newTime = newTime % 1;
        }
        for (const m of anims) {
            update.to(m).update({ t: newTime });
        }
        await commands_1.PluginCommands.State.Update(ctx.plugin, { state, tree: update, options: { doNotLogTiming: true } });
        if (finished)
            return { kind: 'finished' };
        return { kind: 'next', state: { t: newTime } };
    }
});
