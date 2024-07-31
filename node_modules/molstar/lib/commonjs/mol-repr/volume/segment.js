"use strict";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SegmentRepresentationProvider = exports.SegmentParams = exports.SegmentMeshParams = exports.VolumeSegmentParams = void 0;
exports.SegmentVisual = SegmentVisual;
exports.eachSegment = eachSegment;
exports.createVolumeSegmentMesh = createVolumeSegmentMesh;
exports.SegmentMeshVisual = SegmentMeshVisual;
exports.SegmentTextureMeshVisual = SegmentTextureMeshVisual;
exports.getSegmentParams = getSegmentParams;
exports.SegmentRepresentation = SegmentRepresentation;
const param_definition_1 = require("../../mol-util/param-definition");
const volume_1 = require("../../mol-model/volume");
const mesh_1 = require("../../mol-geo/geometry/mesh/mesh");
const algorithm_1 = require("../../mol-geo/util/marching-cubes/algorithm");
const representation_1 = require("./representation");
const location_iterator_1 = require("../../mol-geo/util/location-iterator");
const representation_2 = require("../representation");
const loci_1 = require("../../mol-model/loci");
const int_1 = require("../../mol-data/int");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const array_1 = require("../../mol-util/array");
const util_1 = require("./util");
const texture_mesh_1 = require("../../mol-geo/geometry/texture-mesh/texture-mesh");
const base_1 = require("../../mol-geo/geometry/base");
const value_cell_1 = require("../../mol-util/value-cell");
const isosurface_1 = require("../../mol-gl/compute/marching-cubes/isosurface");
const box3d_1 = require("../../mol-math/geometry/primitives/box3d");
exports.VolumeSegmentParams = {
    segments: param_definition_1.ParamDefinition.Converted((v) => v.map(x => `${x}`), (v) => v.map(x => parseInt(x)), param_definition_1.ParamDefinition.MultiSelect(['0'], param_definition_1.ParamDefinition.arrayToOptions(['0']), {
        isEssential: true
    }))
};
function gpuSupport(webgl) {
    return webgl.extensions.colorBufferFloat && webgl.extensions.textureFloat && webgl.extensions.drawBuffers;
}
const Padding = 1;
function suitableForGpu(volume, webgl) {
    // small volumes are about as fast or faster on CPU vs integrated GPU
    if (volume.grid.cells.data.length < Math.pow(10, 3))
        return false;
    // the GPU is much more memory contraint, especially true for integrated GPUs,
    // fallback to CPU for large volumes
    const gridDim = volume.grid.cells.space.dimensions;
    const { powerOfTwoSize } = (0, util_1.getVolumeTexture2dLayout)(gridDim, Padding);
    return powerOfTwoSize <= webgl.maxTextureSize / 2;
}
const _translate = (0, linear_algebra_1.Mat4)();
function getSegmentTransform(grid, segmentBox) {
    const transform = volume_1.Grid.getGridToCartesianTransform(grid);
    const translate = linear_algebra_1.Mat4.fromTranslation(_translate, segmentBox.min);
    return linear_algebra_1.Mat4.mul((0, linear_algebra_1.Mat4)(), transform, translate);
}
function SegmentVisual(materialId, volume, key, props, webgl) {
    if (props.tryUseGpu && webgl && gpuSupport(webgl) && suitableForGpu(volume, webgl)) {
        return SegmentTextureMeshVisual(materialId);
    }
    return SegmentMeshVisual(materialId);
}
function getLoci(volume, props) {
    return volume_1.Volume.Segment.Loci(volume, props.segments);
}
function getSegmentLoci(pickingId, volume, key, props, id) {
    const { objectId, groupId } = pickingId;
    if (id === objectId) {
        const granularity = volume_1.Volume.PickingGranularity.get(volume);
        if (granularity === 'volume') {
            return volume_1.Volume.Loci(volume);
        }
        else if (granularity === 'object') {
            return volume_1.Volume.Segment.Loci(volume, [key]);
        }
        else {
            return volume_1.Volume.Cell.Loci(volume, int_1.Interval.ofSingleton(groupId));
        }
    }
    return loci_1.EmptyLoci;
}
function eachSegment(loci, volume, key, props, apply) {
    const segments = int_1.SortedArray.ofSingleton(key);
    return (0, util_1.eachVolumeLoci)(loci, volume, { segments }, apply);
}
//
function getSegmentCells(set, bbox, cells) {
    const data = cells.data;
    const o = cells.space.dataOffset;
    const dim = box3d_1.Box3D.size((0, linear_algebra_1.Vec3)(), bbox);
    const [xn, yn, zn] = dim;
    const xn1 = xn - 1;
    const yn1 = yn - 1;
    const zn1 = zn - 1;
    const [minx, miny, minz] = bbox.min;
    const [maxx, maxy, maxz] = bbox.max;
    const axisOrder = [...cells.space.axisOrderSlowToFast];
    const segmentSpace = linear_algebra_1.Tensor.Space(dim, axisOrder, Uint8Array);
    const segmentCells = linear_algebra_1.Tensor.create(segmentSpace, segmentSpace.create());
    const segData = segmentCells.data;
    const segSet = segmentSpace.set;
    for (let z = 0; z < zn; ++z) {
        for (let y = 0; y < yn; ++y) {
            for (let x = 0; x < xn; ++x) {
                const v0 = set.includes(data[o(x + minx, y + miny, z + minz)]) ? 255 : 0;
                const xp = set.includes(data[o(Math.min(xn1 + maxx, x + 1 + minx), y + miny, z + minz)]) ? 255 : 0;
                const xn = set.includes(data[o(Math.max(0, x - 1 + minx), y + miny, z + minz)]) ? 255 : 0;
                const yp = set.includes(data[o(x + minx, Math.min(yn1 + maxy, y + 1 + miny), z + minz)]) ? 255 : 0;
                const yn = set.includes(data[o(x + minx, Math.max(0, y - 1 + miny), z + minz)]) ? 255 : 0;
                const zp = set.includes(data[o(x + minx, y + miny, Math.min(zn1 + maxz, z + 1 + minz))]) ? 255 : 0;
                const zn = set.includes(data[o(x + minx, y + miny, Math.max(0, z - 1 + minz))]) ? 255 : 0;
                segSet(segData, x, y, z, Math.round((v0 + v0 + xp + xn + yp + yn + zp + zn) / 8));
            }
        }
    }
    return segmentCells;
}
async function createVolumeSegmentMesh(ctx, volume, key, theme, props, mesh) {
    const segmentation = volume_1.Volume.Segmentation.get(volume);
    if (!segmentation)
        throw new Error('missing volume segmentation');
    ctx.runtime.update({ message: 'Marching cubes...' });
    const bbox = box3d_1.Box3D.clone(segmentation.bounds[key]);
    box3d_1.Box3D.expand(bbox, bbox, linear_algebra_1.Vec3.create(2, 2, 2));
    const set = Array.from(segmentation.segments.get(key).values());
    const cells = getSegmentCells(set, bbox, volume.grid.cells);
    const ids = (0, array_1.fillSerial)(new Int32Array(cells.data.length));
    const surface = await (0, algorithm_1.computeMarchingCubesMesh)({
        isoLevel: 128,
        scalarField: cells,
        idField: linear_algebra_1.Tensor.create(cells.space, linear_algebra_1.Tensor.Data1(ids))
    }, mesh).runAsChild(ctx.runtime);
    const transform = getSegmentTransform(volume.grid, bbox);
    mesh_1.Mesh.transform(surface, transform);
    if (ctx.webgl && !ctx.webgl.isWebGL2) {
        // 2nd arg means not to split triangles based on group id. Splitting triangles
        // is too expensive if each cell has its own group id as is the case here.
        mesh_1.Mesh.uniformTriangleGroup(surface, false);
        value_cell_1.ValueCell.updateIfChanged(surface.varyingGroup, false);
    }
    else {
        value_cell_1.ValueCell.updateIfChanged(surface.varyingGroup, true);
    }
    surface.setBoundingSphere(volume_1.Volume.Segment.getBoundingSphere(volume, [key]));
    return surface;
}
exports.SegmentMeshParams = {
    ...mesh_1.Mesh.Params,
    ...texture_mesh_1.TextureMesh.Params,
    ...exports.VolumeSegmentParams,
    quality: { ...mesh_1.Mesh.Params.quality, isEssential: false },
    tryUseGpu: param_definition_1.ParamDefinition.Boolean(true),
};
function SegmentMeshVisual(materialId) {
    return (0, representation_1.VolumeVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.SegmentMeshParams),
        createGeometry: createVolumeSegmentMesh,
        createLocationIterator: (volume, key) => {
            const l = volume_1.Volume.Segment.Location(volume, key);
            return (0, location_iterator_1.LocationIterator)(volume.grid.cells.data.length, 1, 1, () => l);
        },
        getLoci: getSegmentLoci,
        eachLocation: eachSegment,
        setUpdateState: (state, volume, newProps, currentProps) => {
        },
        geometryUtils: mesh_1.Mesh.Utils,
        mustRecreate: (volumeKey, props, webgl) => {
            return props.tryUseGpu && !!webgl && suitableForGpu(volumeKey.volume, webgl);
        }
    }, materialId);
}
//
const SegmentTextureName = 'segment-texture';
function getSegmentTexture(volume, segment, webgl) {
    const segmentation = volume_1.Volume.Segmentation.get(volume);
    if (!segmentation)
        throw new Error('missing volume segmentation');
    const { resources } = webgl;
    const bbox = box3d_1.Box3D.clone(segmentation.bounds[segment]);
    box3d_1.Box3D.expand(bbox, bbox, linear_algebra_1.Vec3.create(2, 2, 2));
    const transform = getSegmentTransform(volume.grid, bbox);
    const gridDimension = box3d_1.Box3D.size((0, linear_algebra_1.Vec3)(), bbox);
    const { width, height, powerOfTwoSize: texDim } = (0, util_1.getVolumeTexture2dLayout)(gridDimension, Padding);
    const gridTexDim = linear_algebra_1.Vec3.create(width, height, 0);
    const gridTexScale = linear_algebra_1.Vec2.create(width / texDim, height / texDim);
    // console.log({ texDim, width, height, gridDimension });
    if (texDim > webgl.maxTextureSize / 2) {
        throw new Error('volume too large for gpu segment extraction');
    }
    if (!webgl.namedTextures[SegmentTextureName]) {
        webgl.namedTextures[SegmentTextureName] = resources.texture('image-uint8', 'alpha', 'ubyte', 'linear');
    }
    const texture = webgl.namedTextures[SegmentTextureName];
    texture.define(texDim, texDim);
    // load volume into sub-section of texture
    const set = Array.from(segmentation.segments.get(segment).values());
    texture.load((0, util_1.createSegmentTexture2d)(volume, set, bbox, Padding), true);
    gridDimension[0] += Padding;
    gridDimension[1] += Padding;
    return {
        texture,
        transform,
        gridDimension,
        gridTexDim,
        gridTexScale
    };
}
async function createVolumeSegmentTextureMesh(ctx, volume, segment, theme, props, textureMesh) {
    if (!ctx.webgl)
        throw new Error('webgl context required to create volume segment texture-mesh');
    if (volume.grid.cells.data.length <= 1) {
        return texture_mesh_1.TextureMesh.createEmpty(textureMesh);
    }
    const { texture, gridDimension, gridTexDim, gridTexScale, transform } = getSegmentTexture(volume, segment, ctx.webgl);
    const axisOrder = volume.grid.cells.space.axisOrderSlowToFast;
    const buffer = textureMesh === null || textureMesh === void 0 ? void 0 : textureMesh.doubleBuffer.get();
    const gv = (0, isosurface_1.extractIsosurface)(ctx.webgl, texture, gridDimension, gridTexDim, gridTexScale, transform, 0.5, false, false, axisOrder, true, buffer === null || buffer === void 0 ? void 0 : buffer.vertex, buffer === null || buffer === void 0 ? void 0 : buffer.group, buffer === null || buffer === void 0 ? void 0 : buffer.normal);
    const groupCount = volume.grid.cells.data.length;
    const surface = texture_mesh_1.TextureMesh.create(gv.vertexCount, groupCount, gv.vertexTexture, gv.groupTexture, gv.normalTexture, volume_1.Volume.Segment.getBoundingSphere(volume, [segment]), textureMesh);
    return surface;
}
function SegmentTextureMeshVisual(materialId) {
    return (0, representation_1.VolumeVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.SegmentMeshParams),
        createGeometry: createVolumeSegmentTextureMesh,
        createLocationIterator: (volume, segment) => {
            const l = volume_1.Volume.Segment.Location(volume, segment);
            return (0, location_iterator_1.LocationIterator)(volume.grid.cells.data.length, 1, 1, () => l);
        },
        getLoci: getSegmentLoci,
        eachLocation: eachSegment,
        setUpdateState: (state, volume, newProps, currentProps) => {
        },
        geometryUtils: texture_mesh_1.TextureMesh.Utils,
        mustRecreate: (volumeKey, props, webgl) => {
            return !props.tryUseGpu || !webgl || !suitableForGpu(volumeKey.volume, webgl);
        },
        dispose: (geometry) => {
            geometry.vertexTexture.ref.value.destroy();
            geometry.groupTexture.ref.value.destroy();
            geometry.normalTexture.ref.value.destroy();
            geometry.doubleBuffer.destroy();
        }
    }, materialId);
}
//
function getSegments(props) {
    return int_1.SortedArray.ofUnsortedArray(props.segments);
}
const SegmentVisuals = {
    'segment': (ctx, getParams) => (0, representation_1.VolumeRepresentation)('Segment mesh', ctx, getParams, SegmentVisual, getLoci, getSegments),
};
exports.SegmentParams = {
    ...exports.SegmentMeshParams,
    visuals: param_definition_1.ParamDefinition.MultiSelect(['segment'], param_definition_1.ParamDefinition.objectToOptions(SegmentVisuals)),
    bumpFrequency: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 10, step: 0.1 }, base_1.BaseGeometry.ShadingCategory),
};
function getSegmentParams(ctx, volume) {
    const p = param_definition_1.ParamDefinition.clone(exports.SegmentParams);
    const segmentation = volume_1.Volume.Segmentation.get(volume);
    if (segmentation) {
        const segments = Array.from(segmentation.segments.keys());
        p.segments = param_definition_1.ParamDefinition.Converted((v) => v.map(x => `${x}`), (v) => v.map(x => parseInt(x)), param_definition_1.ParamDefinition.MultiSelect(segments.map(x => `${x}`), param_definition_1.ParamDefinition.arrayToOptions(segments.map(x => `${x}`)), {
            isEssential: true
        }));
    }
    return p;
}
function SegmentRepresentation(ctx, getParams) {
    return representation_2.Representation.createMulti('Segment', ctx, getParams, representation_2.Representation.StateBuilder, SegmentVisuals);
}
exports.SegmentRepresentationProvider = (0, representation_1.VolumeRepresentationProvider)({
    name: 'segment',
    label: 'Segment',
    description: 'Displays a triangulated segment of volumetric data.',
    factory: SegmentRepresentation,
    getParams: getSegmentParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.SegmentParams),
    defaultColorTheme: { name: 'volume-segment' },
    defaultSizeTheme: { name: 'uniform' },
    isApplicable: (volume) => !volume_1.Volume.isEmpty(volume) && !!volume_1.Volume.Segmentation.get(volume)
});
