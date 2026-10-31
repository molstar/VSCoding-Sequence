"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.G3DFormat = exports.LoadG3D = exports.G3DTrajectory = exports.G3DHeaderFromUrl = exports.G3DHeaderFromFile = exports.G3dHeaderObject = exports.G3dProvider = void 0;
const trajectory_1 = require("../../mol-plugin-state/formats/trajectory");
const objects_1 = require("../../mol-plugin-state/objects");
const behavior_1 = require("../../mol-plugin/behavior");
const base_1 = require("../../mol-script/runtime/query/base");
const mol_state_1 = require("../../mol-state");
const mol_task_1 = require("../../mol-task");
const param_definition_1 = require("../../mol-util/param-definition");
const data_1 = require("./data");
const model_1 = require("./model");
const transforms_1 = require("../../mol-plugin-state/transforms");
const structure_representation_params_1 = require("../../mol-plugin-state/helpers/structure-representation-params");
const string_1 = require("../../mol-util/string");
const object_1 = require("../../mol-util/object");
exports.G3dProvider = {
    label: 'G3D',
    description: 'G3D',
    category: trajectory_1.TrajectoryFormatCategory,
    binaryExtensions: ['g3d'],
    parse: async (plugin, data) => {
        const trajectory = await plugin.state.data.build()
            .to(data)
            .apply(exports.G3DHeaderFromFile, {}, { state: { isGhost: true } })
            .apply(exports.G3DTrajectory)
            .commit();
        return { trajectory };
    },
    visuals: defaultStructure
};
async function defaultStructure(plugin, data) {
    const builder = plugin.builders.structure;
    const model = await builder.createModel(data.trajectory);
    if (!model)
        return;
    const structure = await builder.createStructure(model);
    const info = model_1.G3dInfoDataProperty.get(model.data);
    if (!info)
        return;
    const components = plugin.build().to(structure);
    const repr = (0, structure_representation_params_1.createStructureRepresentationParams)(plugin, void 0, {
        type: 'cartoon',
        color: 'polymer-index',
        size: 'uniform',
        sizeParams: { value: 0.25 }
    });
    for (const h of info.haplotypes) {
        components
            .apply(transforms_1.StateTransforms.Model.StructureSelectionFromExpression, { expression: (0, model_1.g3dHaplotypeQuery)(h), label: (0, string_1.stringToWords)(h) })
            .apply(transforms_1.StateTransforms.Representation.StructureRepresentation3D, repr);
    }
    await components.commit();
}
class G3dHeaderObject extends objects_1.PluginStateObject.Create({ name: 'G3D Header', typeClass: 'Data' }) {
}
exports.G3dHeaderObject = G3dHeaderObject;
exports.G3DHeaderFromFile = objects_1.PluginStateTransform.BuiltIn({
    name: 'g3d-header-from-file',
    display: { name: 'G3D Header', description: 'Parse G3D Header' },
    from: objects_1.PluginStateObject.Data.Binary,
    to: G3dHeaderObject
})({
    apply({ a }, plugin) {
        return mol_task_1.Task.create('Parse G3D', async () => {
            const header = await (0, data_1.getG3dHeader)(plugin, a.data);
            return new G3dHeaderObject({ header, urlOrData: a.data, cache: {} }, { label: header.name, description: header.genome });
        });
    }
});
exports.G3DHeaderFromUrl = objects_1.PluginStateTransform.BuiltIn({
    name: 'g3d-header-from-url',
    display: { name: 'G3D Header', description: 'Parse G3D Header' },
    params: { url: param_definition_1.ParamDefinition.Text('') },
    from: objects_1.PluginStateObject.Root,
    to: G3dHeaderObject
})({
    apply({ params }, plugin) {
        return mol_task_1.Task.create('Parse G3D', async () => {
            const header = await (0, data_1.getG3dHeader)(plugin, params.url);
            return new G3dHeaderObject({ header, urlOrData: params.url, cache: {} }, { label: header.name, description: header.genome });
        });
    }
});
exports.G3DTrajectory = objects_1.PluginStateTransform.BuiltIn({
    name: 'g3d-trajecotry',
    display: { name: 'G3D Trajectory', description: 'Create G3D Trajectory' },
    params: a => {
        if (!a)
            return { resolution: param_definition_1.ParamDefinition.Numeric(200000) };
        const rs = a.data.header.resolutions;
        return {
            resolution: param_definition_1.ParamDefinition.Select(rs[rs.length - 1], rs.map(r => [r, '' + r]))
        };
    },
    from: G3dHeaderObject,
    to: objects_1.PluginStateObject.Molecule.Trajectory
})({
    apply({ a, params }, plugin) {
        return mol_task_1.Task.create('G3D Trajectory', async (ctx) => {
            if (a.data.cache[params.resolution]) {
                return new objects_1.PluginStateObject.Molecule.Trajectory(a.data.cache[params.resolution], { label: a.label, description: a.description });
            }
            const data = await (0, data_1.getG3dDataBlock)(plugin, a.data.header, a.data.urlOrData, params.resolution);
            const traj = await (0, model_1.trajectoryFromG3D)(data).runInContext(ctx);
            a.data.cache[params.resolution] = traj;
            return new objects_1.PluginStateObject.Molecule.Trajectory(traj, { label: a.label, description: a.description });
        });
    }
});
exports.LoadG3D = mol_state_1.StateAction.build({
    display: { name: 'Load Genome 3D (G3D)', description: 'Load G3D file from the specified URL.' },
    from: objects_1.PluginStateObject.Root,
    params: { url: param_definition_1.ParamDefinition.Text('') }
})(({ params, state }, ctx) => mol_task_1.Task.create('Genome3D', taskCtx => {
    return state.transaction(async () => {
        if (params.url.trim().length === 0) {
            throw new Error('Specify URL');
        }
        ctx.behaviors.layout.leftPanelTabName.next('data');
        const trajectory = await state.build().toRoot()
            .apply(exports.G3DHeaderFromUrl, { url: params.url })
            .apply(exports.G3DTrajectory)
            .commit();
        await defaultStructure(ctx, { trajectory });
    }).runInContext(taskCtx);
}));
exports.G3DFormat = behavior_1.PluginBehavior.create({
    name: 'g3d',
    category: 'misc',
    display: {
        name: 'G3D',
        description: 'G3D Format Support'
    },
    ctor: class extends behavior_1.PluginBehavior.Handler {
        register() {
            this.ctx.state.data.actions.add(exports.LoadG3D);
            (0, object_1.objectForEach)(model_1.G3dSymbols, s => base_1.DefaultQueryRuntimeTable.addSymbol(s));
            this.ctx.managers.lociLabels.addProvider(model_1.G3dLabelProvider);
        }
        unregister() {
            this.ctx.state.data.actions.remove(exports.LoadG3D);
            (0, object_1.objectForEach)(model_1.G3dSymbols, s => base_1.DefaultQueryRuntimeTable.removeSymbol(s));
            this.ctx.managers.lociLabels.removeProvider(model_1.G3dLabelProvider);
        }
    }
});
