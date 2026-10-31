"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimateUnitsExplode = void 0;
const commands_1 = require("../../../mol-plugin/commands");
const mol_state_1 = require("../../../mol-state");
const param_definition_1 = require("../../../mol-util/param-definition");
const objects_1 = require("../../objects");
const transforms_1 = require("../../transforms");
const model_1 = require("../model");
exports.AnimateUnitsExplode = model_1.PluginStateAnimation.create({
    name: 'built-in.animate-units-explode',
    display: { name: 'Explode Units' },
    params: () => ({
        durationInMs: param_definition_1.ParamDefinition.Numeric(3000, { min: 100, max: 10000, step: 100 })
    }),
    initialState: () => ({ t: 0 }),
    async setup(_, __, plugin) {
        const state = plugin.state.data;
        const reprs = state.select(mol_state_1.StateSelection.Generators.ofType(objects_1.PluginStateObject.Molecule.Structure.Representation3D));
        const update = state.build();
        let changed = false;
        for (const r of reprs) {
            const explodes = state.select(mol_state_1.StateSelection.Generators.ofTransformer(transforms_1.StateTransforms.Representation.ExplodeStructureRepresentation3D, r.transform.ref));
            if (explodes.length > 0)
                continue;
            changed = true;
            update.to(r.transform.ref)
                .apply(transforms_1.StateTransforms.Representation.ExplodeStructureRepresentation3D, { t: 0 }, { tags: 'animate-units-explode' });
        }
        if (!changed)
            return;
        return update.commit({ doNotUpdateCurrent: true });
    },
    teardown(_, __, plugin) {
        const state = plugin.state.data;
        const reprs = state.select(mol_state_1.StateSelection.Generators.ofType(objects_1.PluginStateObject.Molecule.Structure.Representation3DState)
            .withTag('animate-units-explode'));
        if (reprs.length === 0)
            return;
        const update = state.build();
        for (const r of reprs)
            update.delete(r.transform.ref);
        return update.commit();
    },
    async apply(animState, t, ctx) {
        const state = ctx.plugin.state.data;
        const anims = state.select(mol_state_1.StateSelection.Generators.ofTransformer(transforms_1.StateTransforms.Representation.ExplodeStructureRepresentation3D));
        if (anims.length === 0) {
            return { kind: 'finished' };
        }
        const update = state.build();
        const d = (t.current - t.lastApplied) / ctx.params.durationInMs;
        const newTime = (animState.t + d) % 1;
        for (const m of anims) {
            update.to(m).update({ t: newTime });
        }
        await commands_1.PluginCommands.State.Update(ctx.plugin, { state, tree: update, options: { doNotLogTiming: true } });
        return { kind: 'next', state: { t: newTime } };
    }
});
