"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeshShapeTransformer = exports.ParseMeshlistTransformer = exports.MeshlistStateObject = exports.MeshlistData = exports.VolsegTransform = exports.FOREROUND_OPACITY = exports.BACKGROUND_OPACITY = void 0;
exports.createMeshFromUrl = createMeshFromUrl;
const tslib_1 = require("tslib");
/** Defines new types of State tree transformers for dealing with mesh data. */
const base_1 = require("../../mol-geo/geometry/base");
const mesh_1 = require("../../mol-geo/geometry/mesh/mesh");
const geometry_1 = require("../../mol-math/geometry");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const shape_1 = require("../../mol-model/shape");
const objects_1 = require("../../mol-plugin-state/objects");
const transforms_1 = require("../../mol-plugin-state/transforms");
const data_1 = require("../../mol-plugin-state/transforms/data");
const representation_1 = require("../../mol-plugin-state/transforms/representation");
const mol_state_1 = require("../../mol-state");
const mol_task_1 = require("../../mol-task");
const param_definition_1 = require("../../mol-util/param-definition");
const MeshUtils = tslib_1.__importStar(require("./mesh-utils"));
exports.BACKGROUND_OPACITY = 0.2;
exports.FOREROUND_OPACITY = 1;
exports.VolsegTransform = mol_state_1.StateTransformer.builderFactory('volseg');
var MeshlistData;
(function (MeshlistData) {
    function empty() {
        return {
            segmentId: 0,
            segmentName: 'Empty',
            detail: 0,
            meshIds: [],
            mesh: mesh_1.Mesh.createEmpty(),
        };
    }
    MeshlistData.empty = empty;
    ;
    async function fromCIF(data, segmentId, segmentName, detail) {
        const { mesh, meshIds } = await MeshUtils.meshFromCif(data);
        return {
            segmentId,
            segmentName,
            detail,
            meshIds,
            mesh,
        };
    }
    MeshlistData.fromCIF = fromCIF;
    function stats(meshListData) {
        return `Meshlist "${meshListData.segmentName}" (detail ${meshListData.detail}): ${meshListData.meshIds.length} meshes, ${meshListData.mesh.vertexCount} vertices, ${meshListData.mesh.triangleCount} triangles`;
    }
    MeshlistData.stats = stats;
    function getShape(data, color) {
        const mesh = data.mesh;
        const meshShape = shape_1.Shape.create(data.segmentName, data, mesh, () => color, () => 1, 
        // group => `${data.segmentName} | Segment ${data.segmentId} | Detail ${data.detail} | Mesh ${group}`,
        group => data.segmentName);
        return meshShape;
    }
    MeshlistData.getShape = getShape;
    function combineBBoxes(boxes) {
        let result = null;
        for (const box of boxes) {
            if (!box)
                continue;
            if (result) {
                linear_algebra_1.Vec3.min(result.min, result.min, box.min);
                linear_algebra_1.Vec3.max(result.max, result.max, box.max);
            }
            else {
                result = geometry_1.Box3D.zero();
                geometry_1.Box3D.copy(result, box);
            }
        }
        return result;
    }
    MeshlistData.combineBBoxes = combineBBoxes;
    function bbox(data) {
        return MeshUtils.bbox(data.mesh);
    }
    MeshlistData.bbox = bbox;
    function allVerticesUsed(data) {
        const unusedVertices = new Set();
        for (let i = 0; i < data.mesh.vertexCount; i++) {
            unusedVertices.add(i);
        }
        for (let i = 0; i < 3 * data.mesh.triangleCount; i++) {
            const v = data.mesh.vertexBuffer.ref.value[i];
            unusedVertices.delete(v);
        }
        return unusedVertices.size === 0;
    }
    MeshlistData.allVerticesUsed = allVerticesUsed;
})(MeshlistData || (exports.MeshlistData = MeshlistData = {}));
// // // // // // // // // // // // // // // // // // // // // // // //
// Raw Data -> Parsed data
class MeshlistStateObject extends objects_1.PluginStateObject.Create({ name: 'Parsed Meshlist', typeClass: 'Object' }) {
}
exports.MeshlistStateObject = MeshlistStateObject;
exports.ParseMeshlistTransformer = (0, exports.VolsegTransform)({
    name: 'meshlist-from-string',
    from: objects_1.PluginStateObject.Format.Cif,
    to: MeshlistStateObject,
    params: {
        label: param_definition_1.ParamDefinition.Text(MeshlistStateObject.type.name, { isHidden: true }),
        segmentId: param_definition_1.ParamDefinition.Numeric(1, {}, { isHidden: true }),
        segmentName: param_definition_1.ParamDefinition.Text('Segment'),
        detail: param_definition_1.ParamDefinition.Numeric(1, {}, { isHidden: true }),
        /** Reference to the object which manages this meshlist (e.g. `MeshStreaming.Behavior`) */
        ownerId: param_definition_1.ParamDefinition.Text('', { isHidden: true }),
    }
})({
    apply({ a, params }, globalCtx) {
        return mol_task_1.Task.create('Create Parsed Meshlist', async (ctx) => {
            const meshlistData = await MeshlistData.fromCIF(a.data, params.segmentId, params.segmentName, params.detail);
            meshlistData.ownerId = params.ownerId;
            const es = meshlistData.meshIds.length === 1 ? '' : 'es';
            return new MeshlistStateObject(meshlistData, { label: params.label, description: `${meshlistData.segmentName} (${meshlistData.meshIds.length} mesh${es})` });
        });
    }
});
var MeshShapeProvider;
(function (MeshShapeProvider) {
    function fromMeshlistData(meshlist, color) {
        const theColor = color !== null && color !== void 0 ? color : MeshUtils.ColorGenerator.next().value;
        return {
            label: 'Mesh',
            data: meshlist,
            params: meshShapeProviderParams,
            geometryUtils: mesh_1.Mesh.Utils,
            getShape: (ctx, data) => MeshlistData.getShape(data, theColor),
        };
    }
    MeshShapeProvider.fromMeshlistData = fromMeshlistData;
})(MeshShapeProvider || (MeshShapeProvider = {}));
const meshShapeProviderParams = {
    ...mesh_1.Mesh.Params,
    quality: param_definition_1.ParamDefinition.Select('custom', base_1.VisualQualityOptions, { isEssential: true, description: 'Visual/rendering quality of the representation.' }), // use 'custom' when wanting to apply doubleSided
    doubleSided: param_definition_1.ParamDefinition.Boolean(true, base_1.BaseGeometry.CustomQualityParamInfo),
    // set `flatShaded`: true to see the real mesh vertices and triangles
    transparentBackfaces: param_definition_1.ParamDefinition.Select('on', param_definition_1.ParamDefinition.arrayToOptions(['off', 'on', 'opaque']), base_1.BaseGeometry.ShadingCategory), // 'on' means: show backfaces with correct opacity, even when opacity < 1 (requires doubleSided) ¯\_(ツ)_/¯
};
exports.MeshShapeTransformer = (0, exports.VolsegTransform)({
    name: 'shape-from-meshlist',
    display: { name: 'Shape from Meshlist', description: 'Create Shape from Meshlist data' },
    from: MeshlistStateObject,
    to: objects_1.PluginStateObject.Shape.Provider,
    params: {
        color: param_definition_1.ParamDefinition.Value(undefined), // undefined means random color
    },
})({
    apply({ a, params }) {
        const shapeProvider = MeshShapeProvider.fromMeshlistData(a.data, params.color);
        return new objects_1.PluginStateObject.Shape.Provider(shapeProvider, { label: objects_1.PluginStateObject.Shape.Provider.type.name, description: a.description });
    }
});
// // // // // // // // // // // // // // // // // // // // // // // //
/** Download data and create state tree hierarchy down to visual representation. */
async function createMeshFromUrl(plugin, meshDataUrl, segmentId, detail, collapseTree, color, parent, transparentIfBboxAbove, name, ownerId) {
    const update = parent ? plugin.build().to(parent) : plugin.build().toRoot();
    const rawDataNodeRef = update.apply(data_1.Download, { url: meshDataUrl, isBinary: true, label: `Downloaded Data ${segmentId}` }, { state: { isCollapsed: collapseTree } }).ref;
    const parsedDataNode = await update.to(rawDataNodeRef)
        .apply(transforms_1.StateTransforms.Data.ParseCif)
        .apply(exports.ParseMeshlistTransformer, { label: undefined, segmentId: segmentId, segmentName: name !== null && name !== void 0 ? name : `Segment ${segmentId}`, detail: detail, ownerId: ownerId }, {})
        .commit();
    let transparent = false;
    if (transparentIfBboxAbove !== undefined && parsedDataNode.data) {
        const bbox = MeshlistData.bbox(parsedDataNode.data) || geometry_1.Box3D.zero();
        transparent = geometry_1.Box3D.volume(bbox) > transparentIfBboxAbove;
    }
    await plugin.build().to(parsedDataNode)
        .apply(exports.MeshShapeTransformer, { color: color })
        .apply(representation_1.ShapeRepresentation3D, { alpha: transparent ? exports.BACKGROUND_OPACITY : exports.FOREROUND_OPACITY }, { tags: ['mesh-segment-visual', `segment-${segmentId}`] })
        .commit();
    return rawDataNodeRef;
}
