"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB_URL = void 0;
exports.runMeshExtensionExamples = runMeshExtensionExamples;
exports.runMeshExample = runMeshExample;
exports.runMeshExample2 = runMeshExample2;
exports.runMultimeshExample = runMultimeshExample;
exports.runMeshStreamingExample = runMeshStreamingExample;
exports.runMolsurfaceExample = runMolsurfaceExample;
exports.runIsosurfaceExample = runIsosurfaceExample;
exports.runCifMeshExample = runCifMeshExample;
const tslib_1 = require("tslib");
/** Testing examples for using mesh-extension.ts. */
const cif_1 = require("../../mol-io/reader/cif");
const volume_1 = require("../../mol-model/volume");
const structure_representation_params_1 = require("../../mol-plugin-state/helpers/structure-representation-params");
const volume_representation_params_1 = require("../../mol-plugin-state/helpers/volume-representation-params");
const transforms_1 = require("../../mol-plugin-state/transforms");
const assets_1 = require("../../mol-util/assets");
const color_1 = require("../../mol-util/color");
const param_definition_1 = require("../../mol-util/param-definition");
const mesh_extension_1 = require("./mesh-extension");
const server_info_1 = require("./mesh-streaming/server-info");
const transformers_1 = require("./mesh-streaming/transformers");
const MeshUtils = tslib_1.__importStar(require("./mesh-utils"));
exports.DB_URL = '/db'; // local
async function runMeshExtensionExamples(plugin, db_url = exports.DB_URL) {
    console.time('TIME MESH EXAMPLES');
    // await runIsosurfaceExample(plugin, db_url);
    // await runMolsurfaceExample(plugin);
    // Focused Ion Beam-Scanning Electron Microscopy of mitochondrial reticulum in murine skeletal muscle: https://www.ebi.ac.uk/empiar/EMPIAR-10070/
    // await runMeshExample(plugin, 'all', db_url);
    // await runMeshExample(plugin, 'fg', db_url);
    // await runMultimeshExample(plugin, 'fg', 'worst', db_url);
    // await runCifMeshExample(plugin);
    // await runMeshExample2(plugin, 'fg');
    await runMeshStreamingExample(plugin);
    console.timeEnd('TIME MESH EXAMPLES');
}
/** Example for downloading multiple separate segments, each containing 1 mesh. */
async function runMeshExample(plugin, segments, db_url = exports.DB_URL) {
    const detail = 2;
    const segmentIds = (segments === 'all') ?
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17] // segment-16 has no detail-2
        : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 17]; // segment-13 and segment-15 are quasi background
    for (const segmentId of segmentIds) {
        await (0, mesh_extension_1.createMeshFromUrl)(plugin, `${db_url}/empiar-10070-mesh-rounded/segment-${segmentId}/detail-${detail}`, segmentId, detail, true, undefined);
    }
}
/** Example for downloading multiple separate segments, each containing 1 mesh. */
async function runMeshExample2(plugin, segments) {
    const detail = 1;
    const segmentIds = (segments === 'one') ? [15]
        : (segments === 'few') ? [1, 4, 7, 10, 16]
            : (segments === 'all') ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17] // segment-16 has no detail-2
                : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 17]; // segment-13 and segment-15 are quasi background
    for (const segmentId of segmentIds) {
        await (0, mesh_extension_1.createMeshFromUrl)(plugin, `http://localhost:9000/v2/empiar/empiar-10070/mesh_bcif/${segmentId}/${detail}`, segmentId, detail, false, undefined);
    }
}
/** Example for downloading a single segment containing multiple meshes. */
async function runMultimeshExample(plugin, segments, detailChoice, db_url = exports.DB_URL) {
    const urlDetail = (detailChoice === 'best') ? '2' : 'worst';
    const numDetail = (detailChoice === 'best') ? 2 : 1000;
    await (0, mesh_extension_1.createMeshFromUrl)(plugin, `${db_url}/empiar-10070-multimesh-rounded/segments-${segments}/detail-${urlDetail}`, 0, numDetail, false, undefined);
}
async function runMeshStreamingExample(plugin, source = 'empiar', entryId = 'empiar-10070', serverUrl, parent) {
    const params = param_definition_1.ParamDefinition.getDefaultValues(server_info_1.MeshServerInfo.Params);
    if (serverUrl)
        params.serverUrl = serverUrl;
    params.source = source;
    params.entryId = entryId;
    await plugin.runTask(plugin.state.data.applyAction(transformers_1.InitMeshStreaming, params, parent === null || parent === void 0 ? void 0 : parent.ref), { useOverlay: false });
}
/** Example for downloading a protein structure and visualizing molecular surface. */
async function runMolsurfaceExample(plugin) {
    const entryId = 'pdb-7etq';
    // Node "https://www.ebi.ac.uk/pdbe/entry-files/download/7etq.bcif" ("transformer": "ms-plugin.download") -> var data
    const data = await plugin.builders.data.download({ url: 'https://www.ebi.ac.uk/pdbe/entry-files/download/7etq.bcif', isBinary: true }, { state: { isGhost: false } });
    console.log('formats:', plugin.dataFormats.list);
    // Node "CIF File" ("transformer": "ms-plugin.parse-cif")
    // Node "7ETQ 1 model" ("transformer": "ms-plugin.trajectory-from-mmcif") -> var trajectory
    const parsed = await plugin.dataFormats.get('mmcif').parse(plugin, data, { entryId });
    const trajectory = parsed.trajectory;
    console.log('parsed', parsed);
    console.log('trajectory', trajectory);
    // Node "Model 1" ("transformer": "ms-plugin.model-from-trajectory") -> var model
    const model = await plugin.build().to(trajectory).apply(transforms_1.StateTransforms.Model.ModelFromTrajectory).commit();
    console.log('model:', model);
    // Node "Model 91 elements" ("transformer": "ms-plugin.structure-from-model") -> var structure
    const structure = await plugin.build().to(model).apply(transforms_1.StateTransforms.Model.StructureFromModel).commit();
    console.log('structure:', structure);
    // Node "Molecular Surface" ("transformer": "ms-plugin.structure-representation-3d") -> var repr
    const reprParams = (0, structure_representation_params_1.createStructureRepresentationParams)(plugin, undefined, { type: 'molecular-surface' });
    const repr = await plugin.build().to(structure).apply(transforms_1.StateTransforms.Representation.StructureRepresentation3D, reprParams).commit();
    console.log('repr:', repr);
}
/** Example for downloading an EMDB density data and visualizing isosurface. */
async function runIsosurfaceExample(plugin, db_url = exports.DB_URL) {
    var _a, _b;
    const entryId = 'emd-1832';
    const isoLevel = 2.73;
    let root = await plugin.build();
    const data = await plugin.builders.data.download({ url: `${db_url}/emd-1832-box`, isBinary: true }, { state: { isGhost: false } });
    const parsed = await plugin.dataFormats.get('dscif').parse(plugin, data, { entryId });
    const volume = (_b = (_a = parsed.volumes) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : parsed.volume;
    const volumeData = volume.cell.obj.data;
    console.log('data:', data);
    console.log('parsed:', parsed);
    console.log('volume:', volume);
    console.log('volumeData:', volumeData);
    root = await plugin.build();
    console.log('root:', root);
    console.log('to:', root.to(volume));
    console.log('toRoot:', root.toRoot());
    let volumeParams;
    volumeParams = (0, volume_representation_params_1.createVolumeRepresentationParams)(plugin, volumeData, {
        type: 'isosurface',
        typeParams: {
            alpha: 0.5,
            isoValue: volume_1.Volume.adjustedIsoValue(volumeData, isoLevel, 'relative'),
            visuals: ['solid'],
            sizeFactor: 1,
        },
        color: 'uniform',
        colorParams: { value: (0, color_1.Color)(0x00aaaa) },
    });
    root.to(volume).apply(transforms_1.StateTransforms.Representation.VolumeRepresentation3D, volumeParams);
    volumeParams = (0, volume_representation_params_1.createVolumeRepresentationParams)(plugin, volumeData, {
        type: 'isosurface',
        typeParams: {
            alpha: 1.0,
            isoValue: volume_1.Volume.adjustedIsoValue(volumeData, isoLevel, 'relative'),
            visuals: ['wireframe'],
            sizeFactor: 1,
        },
        color: 'uniform',
        colorParams: { value: (0, color_1.Color)(0x8800aa) },
    });
    root.to(volume).apply(transforms_1.StateTransforms.Representation.VolumeRepresentation3D, volumeParams);
    await root.commit();
}
async function runCifMeshExample(plugin, api = 'http://localhost:9000/v2', source = 'empiar', entryId = 'empiar-10070', segmentId = 1, detail = 10) {
    const url = `${api}/${source}/${entryId}/mesh_bcif/${segmentId}/${detail}`;
    getMeshFromBcif(plugin, url);
}
async function getMeshFromBcif(plugin, url) {
    const urlAsset = assets_1.Asset.getUrlAsset(plugin.managers.asset, url);
    const asset = await plugin.runTask(plugin.managers.asset.resolve(urlAsset, 'binary'));
    const parsed = await plugin.runTask(cif_1.CIF.parseBinary(asset.data));
    if (parsed.isError) {
        plugin.log.error('VolumeStreaming, parsing CIF: ' + parsed.toString());
        return;
    }
    console.log('blocks:', parsed.result.blocks);
    const mesh = await MeshUtils.meshFromCif(parsed.result);
    console.log(mesh);
}
