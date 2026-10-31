"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Aliaksei Chareshneu <chareshneu.tech@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuiltInVolumeFormats = exports.SegcifProvider = exports.DscifProvider = exports.CubeProvider = exports.DxProvider = exports.Dsn6Provider = exports.Ccp4Provider = exports.VolumeFormatCategory = void 0;
const transforms_1 = require("../transforms");
const provider_1 = require("./provider");
const representation_1 = require("../transforms/representation");
const names_1 = require("../../mol-util/color/names");
const volume_1 = require("../../mol-model/volume");
const volume_representation_params_1 = require("../helpers/volume-representation-params");
const object_1 = require("../../mol-util/object");
const property_1 = require("../../mol-model-formats/volume/property");
const util_1 = require("../../mol-plugin/behavior/dynamic/volume-streaming/util");
const mol_task_1 = require("../../mol-task");
exports.VolumeFormatCategory = 'Volume';
async function tryObtainRecommendedIsoValue(plugin, volume) {
    if (!volume)
        return;
    const { entryId } = volume;
    if (!entryId || !entryId.toLowerCase().startsWith('emd'))
        return;
    return plugin.runTask(mol_task_1.Task.create('Try Set Recommended IsoValue', async (ctx) => {
        try {
            const absIsoLevel = await (0, util_1.getContourLevelEmdb)(plugin, ctx, entryId);
            property_1.RecommendedIsoValue.Provider.set(volume, volume_1.Volume.IsoValue.absolute(absIsoLevel));
        }
        catch (e) {
            console.warn(e);
        }
    }));
}
function tryGetRecomendedIsoValue(volume) {
    const recommendedIsoValue = property_1.RecommendedIsoValue.Provider.get(volume);
    if (!recommendedIsoValue)
        return;
    if (recommendedIsoValue.kind === 'relative')
        return recommendedIsoValue;
    return volume_1.Volume.adjustedIsoValue(volume, recommendedIsoValue.absoluteValue, 'absolute');
}
async function defaultVisuals(plugin, data) {
    const typeParams = {};
    const isoValue = data.volume.data && tryGetRecomendedIsoValue(data.volume.data);
    if (isoValue)
        typeParams.isoValue = isoValue;
    const visual = plugin.build().to(data.volume).apply(transforms_1.StateTransforms.Representation.VolumeRepresentation3D, (0, volume_representation_params_1.createVolumeRepresentationParams)(plugin, data.volume.data, {
        type: 'isosurface',
        typeParams,
    }));
    return [await visual.commit()];
}
exports.Ccp4Provider = (0, provider_1.DataFormatProvider)({
    label: 'CCP4/MRC/MAP',
    description: 'CCP4/MRC/MAP',
    category: exports.VolumeFormatCategory,
    binaryExtensions: ['ccp4', 'mrc', 'map'],
    parse: async (plugin, data, params) => {
        const format = plugin.build()
            .to(data)
            .apply(transforms_1.StateTransforms.Data.ParseCcp4, {}, { state: { isGhost: true } });
        const volume = format.apply(transforms_1.StateTransforms.Volume.VolumeFromCcp4, { entryId: params === null || params === void 0 ? void 0 : params.entryId });
        await format.commit({ revertOnError: true });
        await tryObtainRecommendedIsoValue(plugin, volume.selector.data);
        return { format: format.selector, volume: volume.selector };
    },
    visuals: defaultVisuals
});
exports.Dsn6Provider = (0, provider_1.DataFormatProvider)({
    label: 'DSN6/BRIX',
    description: 'DSN6/BRIX',
    category: exports.VolumeFormatCategory,
    binaryExtensions: ['dsn6', 'brix'],
    parse: async (plugin, data, params) => {
        const format = plugin.build()
            .to(data)
            .apply(transforms_1.StateTransforms.Data.ParseDsn6, {}, { state: { isGhost: true } });
        const volume = format.apply(transforms_1.StateTransforms.Volume.VolumeFromDsn6, { entryId: params === null || params === void 0 ? void 0 : params.entryId });
        await format.commit({ revertOnError: true });
        await tryObtainRecommendedIsoValue(plugin, volume.selector.data);
        return { format: format.selector, volume: volume.selector };
    },
    visuals: defaultVisuals
});
exports.DxProvider = (0, provider_1.DataFormatProvider)({
    label: 'DX',
    description: 'DX',
    category: exports.VolumeFormatCategory,
    stringExtensions: ['dx'],
    binaryExtensions: ['dxbin'],
    parse: async (plugin, data, params) => {
        const format = plugin.build()
            .to(data)
            .apply(transforms_1.StateTransforms.Data.ParseDx, {}, { state: { isGhost: true } });
        const volume = format.apply(transforms_1.StateTransforms.Volume.VolumeFromDx, { entryId: params === null || params === void 0 ? void 0 : params.entryId });
        await volume.commit({ revertOnError: true });
        await tryObtainRecommendedIsoValue(plugin, volume.selector.data);
        return { volume: volume.selector };
    },
    visuals: defaultVisuals
});
exports.CubeProvider = (0, provider_1.DataFormatProvider)({
    label: 'Cube',
    description: 'Cube',
    category: exports.VolumeFormatCategory,
    stringExtensions: ['cub', 'cube'],
    parse: async (plugin, data, params) => {
        const format = plugin.build()
            .to(data)
            .apply(transforms_1.StateTransforms.Data.ParseCube, {}, { state: { isGhost: true } });
        const volume = format.apply(transforms_1.StateTransforms.Volume.VolumeFromCube, { entryId: params === null || params === void 0 ? void 0 : params.entryId });
        const structure = format
            .apply(transforms_1.StateTransforms.Model.TrajectoryFromCube, void 0, { state: { isGhost: true } })
            .apply(transforms_1.StateTransforms.Model.ModelFromTrajectory)
            .apply(transforms_1.StateTransforms.Model.StructureFromModel);
        await format.commit({ revertOnError: true });
        await tryObtainRecommendedIsoValue(plugin, volume.selector.data);
        return { format: format.selector, volume: volume.selector, structure: structure.selector };
    },
    visuals: async (plugin, data) => {
        var _a, _b;
        const surfaces = plugin.build();
        const volumeReprs = [];
        const volumeData = (_b = (_a = data.volume.cell) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data;
        if (volumeData && volume_1.Volume.isOrbitals(volumeData)) {
            const volumePos = surfaces.to(data.volume).apply(transforms_1.StateTransforms.Representation.VolumeRepresentation3D, (0, volume_representation_params_1.createVolumeRepresentationParams)(plugin, volumeData, {
                type: 'isosurface',
                typeParams: { isoValue: volume_1.Volume.IsoValue.relative(1), alpha: 0.4 },
                color: 'uniform',
                colorParams: { value: names_1.ColorNames.blue }
            }));
            const volumeNeg = surfaces.to(data.volume).apply(transforms_1.StateTransforms.Representation.VolumeRepresentation3D, (0, volume_representation_params_1.createVolumeRepresentationParams)(plugin, volumeData, {
                type: 'isosurface',
                typeParams: { isoValue: volume_1.Volume.IsoValue.relative(-1), alpha: 0.4 },
                color: 'uniform',
                colorParams: { value: names_1.ColorNames.red }
            }));
            volumeReprs.push(volumePos.selector, volumeNeg.selector);
        }
        else {
            const volume = surfaces.to(data.volume).apply(transforms_1.StateTransforms.Representation.VolumeRepresentation3D, (0, volume_representation_params_1.createVolumeRepresentationParams)(plugin, volumeData, {
                type: 'isosurface',
                typeParams: { isoValue: volume_1.Volume.IsoValue.relative(2), alpha: 0.4 },
                color: 'uniform',
                colorParams: { value: names_1.ColorNames.grey }
            }));
            volumeReprs.push(volume.selector);
        }
        const structure = await plugin.builders.structure.representation.applyPreset(data.structure, 'auto');
        await surfaces.commit();
        const structureReprs = [];
        (0, object_1.objectForEach)(structure === null || structure === void 0 ? void 0 : structure.representations, (r) => {
            if (r)
                structureReprs.push(r);
        });
        return [...volumeReprs, ...structureReprs];
    }
});
exports.DscifProvider = (0, provider_1.DataFormatProvider)({
    label: 'DensityServer CIF',
    description: 'DensityServer CIF',
    category: exports.VolumeFormatCategory,
    stringExtensions: ['cif'],
    binaryExtensions: ['bcif'],
    isApplicable: (info, data) => {
        return (0, provider_1.guessCifVariant)(info, data) === 'dscif' ? true : false;
    },
    parse: async (plugin, data, params) => {
        var _a;
        const cifCell = await plugin.build().to(data).apply(transforms_1.StateTransforms.Data.ParseCif).commit();
        const b = plugin.build().to(cifCell);
        const blocks = cifCell.obj.data.blocks;
        if (blocks.length === 0)
            throw new Error('no data blocks');
        const volumes = [];
        let i = 0;
        for (const block of blocks) {
            // Skip "server" data block.
            if (block.header.toUpperCase() === 'SERVER')
                continue;
            const entryId = Array.isArray(params === null || params === void 0 ? void 0 : params.entryId) ? params === null || params === void 0 ? void 0 : params.entryId[i] : params === null || params === void 0 ? void 0 : params.entryId;
            if (((_a = block.categories['volume_data_3d_info']) === null || _a === void 0 ? void 0 : _a.rowCount) > 0) {
                volumes.push(b.apply(transforms_1.StateTransforms.Volume.VolumeFromDensityServerCif, { blockHeader: block.header, entryId }).selector);
                i++;
            }
        }
        await b.commit();
        for (const v of volumes)
            await tryObtainRecommendedIsoValue(plugin, v.data);
        return { volumes };
    },
    visuals: async (plugin, data) => {
        const { volumes } = data;
        const tree = plugin.build();
        const visuals = [];
        if (volumes.length > 0) {
            const isoValue = (volumes[0].data && tryGetRecomendedIsoValue(volumes[0].data)) || volume_1.Volume.IsoValue.relative(1.5);
            visuals[0] = tree
                .to(volumes[0])
                .apply(transforms_1.StateTransforms.Representation.VolumeRepresentation3D, representation_1.VolumeRepresentation3DHelpers.getDefaultParamsStatic(plugin, 'isosurface', { isoValue, alpha: 1 }, 'uniform', { value: names_1.ColorNames.teal }))
                .selector;
        }
        if (volumes.length > 1) {
            const posParams = representation_1.VolumeRepresentation3DHelpers.getDefaultParamsStatic(plugin, 'isosurface', { isoValue: volume_1.Volume.IsoValue.relative(3), alpha: 0.3 }, 'uniform', { value: names_1.ColorNames.green });
            const negParams = representation_1.VolumeRepresentation3DHelpers.getDefaultParamsStatic(plugin, 'isosurface', { isoValue: volume_1.Volume.IsoValue.relative(-3), alpha: 0.3 }, 'uniform', { value: names_1.ColorNames.red });
            visuals[visuals.length] = tree.to(volumes[1]).apply(transforms_1.StateTransforms.Representation.VolumeRepresentation3D, posParams).selector;
            visuals[visuals.length] = tree.to(volumes[1]).apply(transforms_1.StateTransforms.Representation.VolumeRepresentation3D, negParams).selector;
        }
        await tree.commit();
        return visuals;
    }
});
exports.SegcifProvider = (0, provider_1.DataFormatProvider)({
    label: 'Segmentation CIF',
    description: 'Segmentation CIF',
    category: exports.VolumeFormatCategory,
    stringExtensions: ['cif'],
    binaryExtensions: ['bcif'],
    isApplicable: (info, data) => {
        return (0, provider_1.guessCifVariant)(info, data) === 'segcif' ? true : false;
    },
    parse: async (plugin, data) => {
        var _a;
        const cifCell = await plugin.build().to(data).apply(transforms_1.StateTransforms.Data.ParseCif).commit();
        const b = plugin.build().to(cifCell);
        const blocks = cifCell.obj.data.blocks;
        if (blocks.length === 0)
            throw new Error('no data blocks');
        const volumes = [];
        for (const block of blocks) {
            // Skip "server" data block.
            if (block.header.toUpperCase() === 'SERVER')
                continue;
            if (((_a = block.categories['volume_data_3d_info']) === null || _a === void 0 ? void 0 : _a.rowCount) > 0) {
                volumes.push(b.apply(transforms_1.StateTransforms.Volume.VolumeFromSegmentationCif, { blockHeader: block.header }).selector);
            }
        }
        await b.commit();
        return { volumes };
    },
    visuals: async (plugin, data) => {
        const { volumes } = data;
        const tree = plugin.build();
        const visuals = [];
        if (volumes.length > 0) {
            const segmentation = volume_1.Volume.Segmentation.get(volumes[0].data);
            if (segmentation) {
                visuals[visuals.length] = tree
                    .to(volumes[0])
                    .apply(transforms_1.StateTransforms.Representation.VolumeRepresentation3D, representation_1.VolumeRepresentation3DHelpers.getDefaultParams(plugin, 'segment', volumes[0].data, { alpha: 1, instanceGranularity: true }, 'volume-segment', {}))
                    .selector;
            }
        }
        await tree.commit();
        return visuals;
    }
});
exports.BuiltInVolumeFormats = [
    ['ccp4', exports.Ccp4Provider],
    ['dsn6', exports.Dsn6Provider],
    ['cube', exports.CubeProvider],
    ['dx', exports.DxProvider],
    ['dscif', exports.DscifProvider],
    ['segcif', exports.SegcifProvider],
];
