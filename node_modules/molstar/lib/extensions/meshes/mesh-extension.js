/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
/** Defines new types of State tree transformers for dealing with mesh data. */
import { BaseGeometry, VisualQualityOptions } from '../../mol-geo/geometry/base';
import { Mesh } from '../../mol-geo/geometry/mesh/mesh';
import { Box3D } from '../../mol-math/geometry';
import { Vec3 } from '../../mol-math/linear-algebra';
import { Shape } from '../../mol-model/shape';
import { PluginStateObject } from '../../mol-plugin-state/objects';
import { StateTransforms } from '../../mol-plugin-state/transforms';
import { Download } from '../../mol-plugin-state/transforms/data';
import { ShapeRepresentation3D } from '../../mol-plugin-state/transforms/representation';
import { StateTransformer } from '../../mol-state';
import { Task } from '../../mol-task';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import * as MeshUtils from './mesh-utils';
export const BACKGROUND_OPACITY = 0.2;
export const FOREROUND_OPACITY = 1;
export const VolsegTransform = StateTransformer.builderFactory('volseg');
export var MeshlistData;
(function (MeshlistData) {
    function empty() {
        return {
            segmentId: 0,
            segmentName: 'Empty',
            detail: 0,
            meshIds: [],
            mesh: Mesh.createEmpty(),
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
        const meshShape = Shape.create(data.segmentName, data, mesh, () => color, () => 1, 
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
                Vec3.min(result.min, result.min, box.min);
                Vec3.max(result.max, result.max, box.max);
            }
            else {
                result = Box3D.zero();
                Box3D.copy(result, box);
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
})(MeshlistData || (MeshlistData = {}));
// // // // // // // // // // // // // // // // // // // // // // // //
// Raw Data -> Parsed data
export class MeshlistStateObject extends PluginStateObject.Create({ name: 'Parsed Meshlist', typeClass: 'Object' }) {
}
export const ParseMeshlistTransformer = VolsegTransform({
    name: 'meshlist-from-string',
    from: PluginStateObject.Format.Cif,
    to: MeshlistStateObject,
    params: {
        label: PD.Text(MeshlistStateObject.type.name, { isHidden: true }),
        segmentId: PD.Numeric(1, {}, { isHidden: true }),
        segmentName: PD.Text('Segment'),
        detail: PD.Numeric(1, {}, { isHidden: true }),
        /** Reference to the object which manages this meshlist (e.g. `MeshStreaming.Behavior`) */
        ownerId: PD.Text('', { isHidden: true }),
    }
})({
    apply({ a, params }, globalCtx) {
        return Task.create('Create Parsed Meshlist', async (ctx) => {
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
            geometryUtils: Mesh.Utils,
            getShape: (ctx, data) => MeshlistData.getShape(data, theColor),
        };
    }
    MeshShapeProvider.fromMeshlistData = fromMeshlistData;
})(MeshShapeProvider || (MeshShapeProvider = {}));
const meshShapeProviderParams = {
    ...Mesh.Params,
    quality: PD.Select('custom', VisualQualityOptions, { isEssential: true, description: 'Visual/rendering quality of the representation.' }), // use 'custom' when wanting to apply doubleSided
    doubleSided: PD.Boolean(true, BaseGeometry.CustomQualityParamInfo),
    // set `flatShaded`: true to see the real mesh vertices and triangles
    transparentBackfaces: PD.Select('on', PD.arrayToOptions(['off', 'on', 'opaque']), BaseGeometry.ShadingCategory), // 'on' means: show backfaces with correct opacity, even when opacity < 1 (requires doubleSided) ¯\_(ツ)_/¯
};
export const MeshShapeTransformer = VolsegTransform({
    name: 'shape-from-meshlist',
    display: { name: 'Shape from Meshlist', description: 'Create Shape from Meshlist data' },
    from: MeshlistStateObject,
    to: PluginStateObject.Shape.Provider,
    params: {
        color: PD.Value(undefined), // undefined means random color
    },
})({
    apply({ a, params }) {
        const shapeProvider = MeshShapeProvider.fromMeshlistData(a.data, params.color);
        return new PluginStateObject.Shape.Provider(shapeProvider, { label: PluginStateObject.Shape.Provider.type.name, description: a.description });
    }
});
// // // // // // // // // // // // // // // // // // // // // // // //
/** Download data and create state tree hierarchy down to visual representation. */
export async function createMeshFromUrl(plugin, meshDataUrl, segmentId, detail, collapseTree, color, parent, transparentIfBboxAbove, name, ownerId) {
    const update = parent ? plugin.build().to(parent) : plugin.build().toRoot();
    const rawDataNodeRef = update.apply(Download, { url: meshDataUrl, isBinary: true, label: `Downloaded Data ${segmentId}` }, { state: { isCollapsed: collapseTree } }).ref;
    const parsedDataNode = await update.to(rawDataNodeRef)
        .apply(StateTransforms.Data.ParseCif)
        .apply(ParseMeshlistTransformer, { label: undefined, segmentId: segmentId, segmentName: name !== null && name !== void 0 ? name : `Segment ${segmentId}`, detail: detail, ownerId: ownerId }, {})
        .commit();
    let transparent = false;
    if (transparentIfBboxAbove !== undefined && parsedDataNode.data) {
        const bbox = MeshlistData.bbox(parsedDataNode.data) || Box3D.zero();
        transparent = Box3D.volume(bbox) > transparentIfBboxAbove;
    }
    await plugin.build().to(parsedDataNode)
        .apply(MeshShapeTransformer, { color: color })
        .apply(ShapeRepresentation3D, { alpha: transparent ? BACKGROUND_OPACITY : FOREROUND_OPACITY }, { tags: ['mesh-segment-visual', `segment-${segmentId}`] })
        .commit();
    return rawDataNodeRef;
}
