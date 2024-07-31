/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { PluginStateObject, PluginStateTransform } from '../../mol-plugin-state/objects';
import { createSphericalCollocationGrid } from './orbitals';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Task } from '../../mol-task';
import { CustomProperties } from '../../mol-model/custom-property';
import { ColorNames } from '../../mol-util/color/names';
import { createVolumeRepresentationParams } from '../../mol-plugin-state/helpers/volume-representation-params';
import { StateTransformer } from '../../mol-state';
import { Theme } from '../../mol-theme/theme';
import { VolumeRepresentation3DHelpers } from '../../mol-plugin-state/transforms/representation';
import { CubeGridFormat, isCubeGridData } from './data-model';
import { createSphericalCollocationDensityGrid } from './density';
export class BasisAndOrbitals extends PluginStateObject.Create({ name: 'Basis', typeClass: 'Object' }) {
}
export const StaticBasisAndOrbitals = PluginStateTransform.BuiltIn({
    name: 'static-basis-and-orbitals',
    display: 'Basis and Orbitals',
    from: PluginStateObject.Root,
    to: BasisAndOrbitals,
    params: {
        label: PD.Text('Orbital Data', { isHidden: true }),
        basis: PD.Value(void 0, { isHidden: true }),
        order: PD.Text('gaussian', { isHidden: true }),
        orbitals: PD.Value([], { isHidden: true })
    },
})({
    apply({ params }) {
        return new BasisAndOrbitals({ basis: params.basis, order: params.order, orbitals: params.orbitals }, { label: params.label });
    }
});
const CreateOrbitalVolumeParamBase = {
    cutoffThreshold: PD.Numeric(0.0015, { min: 0, max: 0.1, step: 0.0001 }),
    boxExpand: PD.Numeric(4.5, { min: 0, max: 7, step: 0.1 }),
    gridSpacing: PD.ObjectList({ atomCount: PD.Numeric(0), spacing: PD.Numeric(0.35, { min: 0.1, max: 2, step: 0.01 }) }, e => `Atoms ${e.atomCount}: ${e.spacing}`, {
        defaultValue: [
            { atomCount: 55, spacing: 0.5 },
            { atomCount: 40, spacing: 0.45 },
            { atomCount: 25, spacing: 0.4 },
            { atomCount: 0, spacing: 0.35 },
        ]
    }),
    clampValues: PD.MappedStatic('off', {
        off: PD.EmptyGroup(),
        on: PD.Group({
            sigma: PD.Numeric(8, { min: 1, max: 20 }, { description: 'Clamp values to range [sigma * negIsoValue, sigma * posIsoValue].' })
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
export const CreateOrbitalVolume = PluginStateTransform.BuiltIn({
    name: 'create-orbital-volume',
    display: 'Orbital Volume',
    from: BasisAndOrbitals,
    to: PluginStateObject.Volume.Data,
    params: (a) => {
        if (!a) {
            return { index: PD.Numeric(0), ...CreateOrbitalVolumeParamBase };
        }
        return {
            index: PD.Select(0, a.data.orbitals.map((o, i) => [i, `[${i + 1}] ${o.energy.toFixed(4)}`])),
            ...CreateOrbitalVolumeParamBase
        };
    }
})({
    apply({ a, params }, plugin) {
        return Task.create('Orbital Volume', async (ctx) => {
            var _a, _b, _c, _d, _e;
            const data = await createSphericalCollocationGrid({
                basis: a.data.basis,
                cutoffThreshold: params.cutoffThreshold,
                sphericalOrder: a.data.order,
                boxExpand: params.boxExpand,
                gridSpacing: params.gridSpacing.map(e => [e.atomCount, e.spacing])
            }, a.data.orbitals[params.index], (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.webgl).runInContext(ctx);
            const volume = {
                grid: data.grid,
                sourceData: CubeGridFormat(data),
                customProperties: new CustomProperties(),
                _propertyData: Object.create(null),
            };
            if (((_b = params.clampValues) === null || _b === void 0 ? void 0 : _b.name) === 'on') {
                clampGrid(data, (_e = (_d = (_c = params.clampValues) === null || _c === void 0 ? void 0 : _c.params) === null || _d === void 0 ? void 0 : _d.sigma) !== null && _e !== void 0 ? _e : 8);
            }
            return new PluginStateObject.Volume.Data(volume, { label: 'Orbital Volume' });
        });
    }
});
export const CreateOrbitalDensityVolume = PluginStateTransform.BuiltIn({
    name: 'create-orbital-density-volume',
    display: 'Orbital Density Volume',
    from: BasisAndOrbitals,
    to: PluginStateObject.Volume.Data,
    params: CreateOrbitalVolumeParamBase
})({
    apply({ a, params }, plugin) {
        return Task.create('Orbital Volume', async (ctx) => {
            var _a, _b, _c, _d, _e;
            const data = await createSphericalCollocationDensityGrid({
                basis: a.data.basis,
                cutoffThreshold: params.cutoffThreshold,
                sphericalOrder: a.data.order,
                boxExpand: params.boxExpand,
                gridSpacing: params.gridSpacing.map(e => [e.atomCount, e.spacing])
            }, a.data.orbitals, (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.webgl).runInContext(ctx);
            const volume = {
                grid: data.grid,
                sourceData: CubeGridFormat(data),
                customProperties: new CustomProperties(),
                _propertyData: Object.create(null),
            };
            if (((_b = params.clampValues) === null || _b === void 0 ? void 0 : _b.name) === 'on') {
                clampGrid(data, (_e = (_d = (_c = params.clampValues) === null || _c === void 0 ? void 0 : _c.params) === null || _d === void 0 ? void 0 : _d.sigma) !== null && _e !== void 0 ? _e : 8);
            }
            return new PluginStateObject.Volume.Data(volume, { label: 'Orbital Volume' });
        });
    }
});
export const CreateOrbitalRepresentation3D = PluginStateTransform.BuiltIn({
    name: 'create-orbital-representation-3d',
    display: 'Orbital Representation 3D',
    from: PluginStateObject.Volume.Data,
    to: PluginStateObject.Volume.Representation3D,
    params: {
        relativeIsovalue: PD.Numeric(1, { min: 0.01, max: 5, step: 0.01 }),
        kind: PD.Select('positive', [['positive', 'Positive'], ['negative', 'Negative']]),
        color: PD.Color(ColorNames.blue),
        alpha: PD.Numeric(1, { min: 0, max: 1, step: 0.01 }),
        xrayShaded: PD.Boolean(false),
        pickable: PD.Boolean(true),
        tryUseGpu: PD.Boolean(true)
    }
})({
    canAutoUpdate() {
        return true;
    },
    apply({ a, params: srcParams }, plugin) {
        return Task.create('Orbitals Representation 3D', async (ctx) => {
            var _a;
            const params = volumeParams(plugin, a, srcParams);
            const propertyCtx = { runtime: ctx, assetManager: plugin.managers.asset };
            const provider = plugin.representation.volume.registry.get(params.type.name);
            if (provider.ensureCustomProperties)
                await provider.ensureCustomProperties.attach(propertyCtx, a.data);
            const props = params.type.params || {};
            const repr = provider.factory({ webgl: (_a = plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.webgl, ...plugin.representation.volume.themes }, provider.getParams);
            repr.setTheme(Theme.create(plugin.representation.volume.themes, { volume: a.data }, params));
            await repr.createOrUpdate(props, a.data).runInContext(ctx);
            repr.setState({ pickable: srcParams.pickable });
            return new PluginStateObject.Volume.Representation3D({ repr, sourceData: a.data }, { label: provider.label, description: VolumeRepresentation3DHelpers.getDescription(props) });
        });
    },
    update({ a, b, newParams: srcParams }, plugin) {
        return Task.create('Orbitals Representation 3D', async (ctx) => {
            const newParams = volumeParams(plugin, a, srcParams);
            const props = { ...b.data.repr.props, ...newParams.type.params };
            b.data.repr.setTheme(Theme.create(plugin.representation.volume.themes, { volume: a.data }, newParams));
            await b.data.repr.createOrUpdate(props, a.data).runInContext(ctx);
            b.data.sourceData = a.data;
            b.data.repr.setState({ pickable: srcParams.pickable });
            b.description = VolumeRepresentation3DHelpers.getDescription(props);
            return StateTransformer.UpdateResult.Updated;
        });
    }
});
function volumeParams(plugin, volume, params) {
    if (!isCubeGridData(volume.data.sourceData))
        throw new Error('Invalid data source kind.');
    const { isovalues } = volume.data.sourceData.data;
    if (!isovalues)
        throw new Error('Isovalues are not computed.');
    const value = isovalues[params.kind];
    return createVolumeRepresentationParams(plugin, volume.data, {
        type: 'isosurface',
        typeParams: { isoValue: { kind: 'absolute', absoluteValue: (value !== null && value !== void 0 ? value : 1000) * params.relativeIsovalue }, alpha: params.alpha, xrayShaded: params.xrayShaded, tryUseGpu: params.tryUseGpu },
        color: 'uniform',
        colorParams: { value: params.color }
    });
}
