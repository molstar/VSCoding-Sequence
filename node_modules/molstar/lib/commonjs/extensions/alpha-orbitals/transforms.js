"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrbitalRepresentation3D = exports.CreateOrbitalDensityVolume = exports.CreateOrbitalVolume = exports.StaticBasisAndOrbitals = exports.BasisAndOrbitals = void 0;
const objects_1 = require("../../mol-plugin-state/objects");
const orbitals_1 = require("./orbitals");
const param_definition_1 = require("../../mol-util/param-definition");
const mol_task_1 = require("../../mol-task");
const custom_property_1 = require("../../mol-model/custom-property");
const names_1 = require("../../mol-util/color/names");
const volume_representation_params_1 = require("../../mol-plugin-state/helpers/volume-representation-params");
const mol_state_1 = require("../../mol-state");
const theme_1 = require("../../mol-theme/theme");
const representation_1 = require("../../mol-plugin-state/transforms/representation");
const data_model_1 = require("./data-model");
const density_1 = require("./density");
class BasisAndOrbitals extends objects_1.PluginStateObject.Create({ name: 'Basis', typeClass: 'Object' }) {
}
exports.BasisAndOrbitals = BasisAndOrbitals;
exports.StaticBasisAndOrbitals = objects_1.PluginStateTransform.BuiltIn({
    name: 'static-basis-and-orbitals',
    display: 'Basis and Orbitals',
    from: objects_1.PluginStateObject.Root,
    to: BasisAndOrbitals,
    params: {
        label: param_definition_1.ParamDefinition.Text('Orbital Data', { isHidden: true }),
        basis: param_definition_1.ParamDefinition.Value(void 0, { isHidden: true }),
        order: param_definition_1.ParamDefinition.Text('gaussian', { isHidden: true }),
        orbitals: param_definition_1.ParamDefinition.Value([], { isHidden: true })
    },
})({
    apply({ params }) {
        return new BasisAndOrbitals({ basis: params.basis, order: params.order, orbitals: params.orbitals }, { label: params.label });
    }
});
const CreateOrbitalVolumeParamBase = {
    cutoffThreshold: param_definition_1.ParamDefinition.Numeric(0.0015, { min: 0, max: 0.1, step: 0.0001 }),
    boxExpand: param_definition_1.ParamDefinition.Numeric(4.5, { min: 0, max: 7, step: 0.1 }),
    gridSpacing: param_definition_1.ParamDefinition.ObjectList({ atomCount: param_definition_1.ParamDefinition.Numeric(0), spacing: param_definition_1.ParamDefinition.Numeric(0.35, { min: 0.1, max: 2, step: 0.01 }) }, e => `Atoms ${e.atomCount}: ${e.spacing}`, {
        defaultValue: [
            { atomCount: 55, spacing: 0.5 },
            { atomCount: 40, spacing: 0.45 },
            { atomCount: 25, spacing: 0.4 },
            { atomCount: 0, spacing: 0.35 },
        ]
    }),
    clampValues: param_definition_1.ParamDefinition.MappedStatic('off', {
        off: param_definition_1.ParamDefinition.EmptyGroup(),
        on: param_definition_1.ParamDefinition.Group({
            sigma: param_definition_1.ParamDefinition.Numeric(8, { min: 1, max: 20 }, { description: 'Clamp values to range [sigma * negIsoValue, sigma * posIsoValue].' })
        })
    })
};
function clampData(matrix, min, max) {
    for (let i = 0, _i = matrix.length; i < _i; i++) {
        const v = matrix[i];
        if (v < min)
            matrix[i] = min;
        else if (v > max)
            matrix[i] = max;
    }
}
function clampGrid(data, v) {
    var _a, _b, _c, _d;
    const grid = data.grid;
    const min = ((_b = (_a = data.isovalues) === null || _a === void 0 ? void 0 : _a.negative) !== null && _b !== void 0 ? _b : data.grid.stats.min) * v;
    const max = ((_d = (_c = data.isovalues) === null || _c === void 0 ? void 0 : _c.positive) !== null && _d !== void 0 ? _d : data.grid.stats.max) * v;
    // clamp values for better direct volume resolution
    // current implementation uses Byte array for values
    // if this is not enough, update mol* to use float
    // textures instead
    if (grid.stats.min < min || grid.stats.max > max) {
        clampData(data.grid.cells.data, min, max);
        if (grid.stats.min < min) {
            grid.stats.min = min;
        }
        if (grid.stats.max > max) {
            grid.stats.max = max;
        }
    }
}
exports.CreateOrbitalVolume = objects_1.PluginStateTransform.BuiltIn({
    name: 'create-orbital-volume',
    display: 'Orbital Volume',
    from: BasisAndOrbitals,
    to: objects_1.PluginStateObject.Volume.Data,
    params: (a) => {
        if (!a) {
            return { index: param_definition_1.ParamDefinition.Numeric(0), ...CreateOrbitalVolumeParamBase };
        }
        return {
            index: param_definition_1.ParamDefinition.Select(0, a.data.orbitals.map((o, i) => [i, `[${i + 1}] ${o.energy.toFixed(4)}`])),
            ...CreateOrbitalVolumeParamBase
        };
    }
})({
    apply({ a, params }, plugin) {
        return mol_task_1.Task.create('Orbital Volume', async (ctx) => {
            var _a, _b, _c, _d, _e;
            const data = await (0, orbitals_1.createSphericalCollocationGrid)({
                basis: a.data.basis,
                cutoffThreshold: params.cutoffThreshold,
                sphericalOrder: a.data.order,
                boxExpand: params.boxExpand,
                gridSpacing: params.gridSpacing.map(e => [e.atomCount, e.spacing])
            }, a.data.orbitals[params.index], (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.webgl).runInContext(ctx);
            const volume = {
                grid: data.grid,
                sourceData: (0, data_model_1.CubeGridFormat)(data),
                customProperties: new custom_property_1.CustomProperties(),
                _propertyData: Object.create(null),
            };
            if (((_b = params.clampValues) === null || _b === void 0 ? void 0 : _b.name) === 'on') {
                clampGrid(data, (_e = (_d = (_c = params.clampValues) === null || _c === void 0 ? void 0 : _c.params) === null || _d === void 0 ? void 0 : _d.sigma) !== null && _e !== void 0 ? _e : 8);
            }
            return new objects_1.PluginStateObject.Volume.Data(volume, { label: 'Orbital Volume' });
        });
    }
});
exports.CreateOrbitalDensityVolume = objects_1.PluginStateTransform.BuiltIn({
    name: 'create-orbital-density-volume',
    display: 'Orbital Density Volume',
    from: BasisAndOrbitals,
    to: objects_1.PluginStateObject.Volume.Data,
    params: CreateOrbitalVolumeParamBase
})({
    apply({ a, params }, plugin) {
        return mol_task_1.Task.create('Orbital Volume', async (ctx) => {
            var _a, _b, _c, _d, _e;
            const data = await (0, density_1.createSphericalCollocationDensityGrid)({
                basis: a.data.basis,
                cutoffThreshold: params.cutoffThreshold,
                sphericalOrder: a.data.order,
                boxExpand: params.boxExpand,
                gridSpacing: params.gridSpacing.map(e => [e.atomCount, e.spacing])
            }, a.data.orbitals, (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.webgl).runInContext(ctx);
            const volume = {
                grid: data.grid,
                sourceData: (0, data_model_1.CubeGridFormat)(data),
                customProperties: new custom_property_1.CustomProperties(),
                _propertyData: Object.create(null),
            };
            if (((_b = params.clampValues) === null || _b === void 0 ? void 0 : _b.name) === 'on') {
                clampGrid(data, (_e = (_d = (_c = params.clampValues) === null || _c === void 0 ? void 0 : _c.params) === null || _d === void 0 ? void 0 : _d.sigma) !== null && _e !== void 0 ? _e : 8);
            }
            return new objects_1.PluginStateObject.Volume.Data(volume, { label: 'Orbital Volume' });
        });
    }
});
exports.CreateOrbitalRepresentation3D = objects_1.PluginStateTransform.BuiltIn({
    name: 'create-orbital-representation-3d',
    display: 'Orbital Representation 3D',
    from: objects_1.PluginStateObject.Volume.Data,
    to: objects_1.PluginStateObject.Volume.Representation3D,
    params: {
        relativeIsovalue: param_definition_1.ParamDefinition.Numeric(1, { min: 0.01, max: 5, step: 0.01 }),
        kind: param_definition_1.ParamDefinition.Select('positive', [['positive', 'Positive'], ['negative', 'Negative']]),
        color: param_definition_1.ParamDefinition.Color(names_1.ColorNames.blue),
        alpha: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 1, step: 0.01 }),
        xrayShaded: param_definition_1.ParamDefinition.Boolean(false),
        pickable: param_definition_1.ParamDefinition.Boolean(true),
        tryUseGpu: param_definition_1.ParamDefinition.Boolean(true)
    }
})({
    canAutoUpdate() {
        return true;
    },
    apply({ a, params: srcParams }, plugin) {
        return mol_task_1.Task.create('Orbitals Representation 3D', async (ctx) => {
            var _a;
            const params = volumeParams(plugin, a, srcParams);
            const propertyCtx = { runtime: ctx, assetManager: plugin.managers.asset, errorContext: plugin.errorContext };
            const provider = plugin.representation.volume.registry.get(params.type.name);
            if (provider.ensureCustomProperties)
                await provider.ensureCustomProperties.attach(propertyCtx, a.data);
            const props = params.type.params || {};
            const repr = provider.factory({ webgl: (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.webgl, ...plugin.representation.volume.themes }, provider.getParams);
            repr.setTheme(theme_1.Theme.create(plugin.representation.volume.themes, { volume: a.data }, params));
            await repr.createOrUpdate(props, a.data).runInContext(ctx);
            repr.setState({ pickable: srcParams.pickable });
            return new objects_1.PluginStateObject.Volume.Representation3D({ repr, sourceData: a.data }, { label: provider.label, description: representation_1.VolumeRepresentation3DHelpers.getDescription(props) });
        });
    },
    update({ a, b, newParams: srcParams }, plugin) {
        return mol_task_1.Task.create('Orbitals Representation 3D', async (ctx) => {
            const newParams = volumeParams(plugin, a, srcParams);
            const props = { ...b.data.repr.props, ...newParams.type.params };
            b.data.repr.setTheme(theme_1.Theme.create(plugin.representation.volume.themes, { volume: a.data }, newParams));
            await b.data.repr.createOrUpdate(props, a.data).runInContext(ctx);
            b.data.sourceData = a.data;
            b.data.repr.setState({ pickable: srcParams.pickable });
            b.description = representation_1.VolumeRepresentation3DHelpers.getDescription(props);
            return mol_state_1.StateTransformer.UpdateResult.Updated;
        });
    }
});
function volumeParams(plugin, volume, params) {
    if (!(0, data_model_1.isCubeGridData)(volume.data.sourceData))
        throw new Error('Invalid data source kind.');
    const { isovalues } = volume.data.sourceData.data;
    if (!isovalues)
        throw new Error('Isovalues are not computed.');
    const value = isovalues[params.kind];
    return (0, volume_representation_params_1.createVolumeRepresentationParams)(plugin, volume.data, {
        type: 'isosurface',
        typeParams: { isoValue: { kind: 'absolute', absoluteValue: (value !== null && value !== void 0 ? value : 1000) * params.relativeIsovalue }, alpha: params.alpha, xrayShaded: params.xrayShaded, tryUseGpu: params.tryUseGpu },
        color: 'uniform',
        colorParams: { value: params.color }
    });
}
