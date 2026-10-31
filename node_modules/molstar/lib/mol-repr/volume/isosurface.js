/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Grid, Volume } from '../../mol-model/volume';
import { Mesh } from '../../mol-geo/geometry/mesh/mesh';
import { computeMarchingCubesMesh, computeMarchingCubesLines } from '../../mol-geo/util/marching-cubes/algorithm';
import { VolumeVisual, VolumeRepresentation, VolumeRepresentationProvider } from './representation';
import { LocationIterator } from '../../mol-geo/util/location-iterator';
import { NullLocation } from '../../mol-model/location';
import { Lines } from '../../mol-geo/geometry/lines/lines';
import { Representation } from '../representation';
import { EmptyLoci } from '../../mol-model/loci';
import { Interval } from '../../mol-data/int';
import { Tensor, Vec2, Vec3 } from '../../mol-math/linear-algebra';
import { fillSerial } from '../../mol-util/array';
import { createVolumeTexture2d, eachVolumeLoci, getVolumeTexture2dLayout } from './util';
import { TextureMesh } from '../../mol-geo/geometry/texture-mesh/texture-mesh';
import { extractIsosurface } from '../../mol-gl/compute/marching-cubes/isosurface';
import { CustomPropertyDescriptor } from '../../mol-model/custom-property';
import { BaseGeometry } from '../../mol-geo/geometry/base';
import { ValueCell } from '../../mol-util/value-cell';
export const VolumeIsosurfaceParams = {
    isoValue: Volume.IsoValueParam
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
    const { powerOfTwoSize } = getVolumeTexture2dLayout(gridDim, Padding);
    return powerOfTwoSize <= webgl.maxTextureSize / 2;
}
export function IsosurfaceVisual(materialId, volume, key, props, webgl) {
    if (props.tryUseGpu && webgl && gpuSupport(webgl) && suitableForGpu(volume, webgl)) {
        return IsosurfaceTextureMeshVisual(materialId);
    }
    return IsosurfaceMeshVisual(materialId);
}
function getLoci(volume, props) {
    return Volume.Isosurface.Loci(volume, props.isoValue);
}
function getIsosurfaceLoci(pickingId, volume, key, props, id) {
    const { objectId, groupId } = pickingId;
    if (id === objectId) {
        const granularity = Volume.PickingGranularity.get(volume);
        if (granularity === 'volume') {
            return Volume.Loci(volume);
        }
        else if (granularity === 'object') {
            return Volume.Isosurface.Loci(volume, props.isoValue);
        }
        else {
            return Volume.Cell.Loci(volume, Interval.ofSingleton(groupId));
        }
    }
    return EmptyLoci;
}
export function eachIsosurface(loci, volume, key, props, apply) {
    return eachVolumeLoci(loci, volume, { isoValue: props.isoValue }, apply);
}
//
export async function createVolumeIsosurfaceMesh(ctx, volume, key, theme, props, mesh) {
    ctx.runtime.update({ message: 'Marching cubes...' });
    const ids = fillSerial(new Int32Array(volume.grid.cells.data.length));
    const surface = await computeMarchingCubesMesh({
        isoLevel: Volume.IsoValue.toAbsolute(props.isoValue, volume.grid.stats).absoluteValue,
        scalarField: volume.grid.cells,
        idField: Tensor.create(volume.grid.cells.space, Tensor.Data1(ids))
    }, mesh).runAsChild(ctx.runtime);
    const transform = Grid.getGridToCartesianTransform(volume.grid);
    Mesh.transform(surface, transform);
    if (ctx.webgl && !ctx.webgl.isWebGL2) {
        // 2nd arg means not to split triangles based on group id. Splitting triangles
        // is too expensive if each cell has its own group id as is the case here.
        Mesh.uniformTriangleGroup(surface, false);
        ValueCell.updateIfChanged(surface.varyingGroup, false);
    }
    else {
        ValueCell.updateIfChanged(surface.varyingGroup, true);
    }
    surface.setBoundingSphere(Volume.Isosurface.getBoundingSphere(volume, props.isoValue));
    return surface;
}
export const IsosurfaceMeshParams = {
    ...Mesh.Params,
    ...TextureMesh.Params,
    ...VolumeIsosurfaceParams,
    quality: { ...Mesh.Params.quality, isEssential: false },
    tryUseGpu: PD.Boolean(true),
};
export function IsosurfaceMeshVisual(materialId) {
    return VolumeVisual({
        defaultProps: PD.getDefaultValues(IsosurfaceMeshParams),
        createGeometry: createVolumeIsosurfaceMesh,
        createLocationIterator: (volume) => LocationIterator(volume.grid.cells.data.length, 1, 1, () => NullLocation),
        getLoci: getIsosurfaceLoci,
        eachLocation: eachIsosurface,
        setUpdateState: (state, volume, newProps, currentProps) => {
            if (!Volume.IsoValue.areSame(newProps.isoValue, currentProps.isoValue, volume.grid.stats))
                state.createGeometry = true;
        },
        geometryUtils: Mesh.Utils,
        mustRecreate: (volumekey, props, webgl) => {
            return props.tryUseGpu && !!webgl && suitableForGpu(volumekey.volume, webgl);
        }
    }, materialId);
}
//
var VolumeIsosurfaceTexture;
(function (VolumeIsosurfaceTexture) {
    const name = 'volume-isosurface-texture';
    VolumeIsosurfaceTexture.descriptor = CustomPropertyDescriptor({ name });
    function get(volume, webgl) {
        const { resources } = webgl;
        const transform = Grid.getGridToCartesianTransform(volume.grid);
        const gridDimension = Vec3.clone(volume.grid.cells.space.dimensions);
        const { width, height, powerOfTwoSize: texDim } = getVolumeTexture2dLayout(gridDimension, Padding);
        const gridTexDim = Vec3.create(width, height, 0);
        const gridTexScale = Vec2.create(width / texDim, height / texDim);
        // console.log({ texDim, width, height, gridDimension });
        if (texDim > webgl.maxTextureSize / 2) {
            throw new Error('volume too large for gpu isosurface extraction');
        }
        if (!volume._propertyData[name]) {
            volume._propertyData[name] = resources.texture('image-uint8', 'alpha', 'ubyte', 'linear');
            const texture = volume._propertyData[name];
            texture.define(texDim, texDim);
            // load volume into sub-section of texture
            texture.load(createVolumeTexture2d(volume, 'data', Padding), true);
            volume.customProperties.add(VolumeIsosurfaceTexture.descriptor);
            volume.customProperties.assets(VolumeIsosurfaceTexture.descriptor, [{ dispose: () => texture.destroy() }]);
        }
        gridDimension[0] += Padding;
        gridDimension[1] += Padding;
        return {
            texture: volume._propertyData[name],
            transform,
            gridDimension,
            gridTexDim,
            gridTexScale
        };
    }
    VolumeIsosurfaceTexture.get = get;
})(VolumeIsosurfaceTexture || (VolumeIsosurfaceTexture = {}));
async function createVolumeIsosurfaceTextureMesh(ctx, volume, key, theme, props, textureMesh) {
    if (!ctx.webgl)
        throw new Error('webgl context required to create volume isosurface texture-mesh');
    if (volume.grid.cells.data.length <= 1) {
        return TextureMesh.createEmpty(textureMesh);
    }
    const { max, min } = volume.grid.stats;
    const diff = max - min;
    const value = Volume.IsoValue.toAbsolute(props.isoValue, volume.grid.stats).absoluteValue;
    const isoLevel = ((value - min) / diff);
    const { texture, gridDimension, gridTexDim, gridTexScale, transform } = VolumeIsosurfaceTexture.get(volume, ctx.webgl);
    const axisOrder = volume.grid.cells.space.axisOrderSlowToFast;
    const buffer = textureMesh === null || textureMesh === void 0 ? void 0 : textureMesh.doubleBuffer.get();
    const gv = extractIsosurface(ctx.webgl, texture, gridDimension, gridTexDim, gridTexScale, transform, isoLevel, value < 0, false, axisOrder, true, buffer === null || buffer === void 0 ? void 0 : buffer.vertex, buffer === null || buffer === void 0 ? void 0 : buffer.group, buffer === null || buffer === void 0 ? void 0 : buffer.normal);
    const groupCount = volume.grid.cells.data.length;
    const boundingSphere = Volume.getBoundingSphere(volume); // getting isosurface bounding-sphere is too expensive here
    const surface = TextureMesh.create(gv.vertexCount, groupCount, gv.vertexTexture, gv.groupTexture, gv.normalTexture, boundingSphere, textureMesh);
    surface.meta.webgl = ctx.webgl;
    return surface;
}
export function IsosurfaceTextureMeshVisual(materialId) {
    return VolumeVisual({
        defaultProps: PD.getDefaultValues(IsosurfaceMeshParams),
        createGeometry: createVolumeIsosurfaceTextureMesh,
        createLocationIterator: (volume) => LocationIterator(volume.grid.cells.data.length, 1, 1, () => NullLocation),
        getLoci: getIsosurfaceLoci,
        eachLocation: eachIsosurface,
        setUpdateState: (state, volume, newProps, currentProps) => {
            if (!Volume.IsoValue.areSame(newProps.isoValue, currentProps.isoValue, volume.grid.stats))
                state.createGeometry = true;
        },
        geometryUtils: TextureMesh.Utils,
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
export async function createVolumeIsosurfaceWireframe(ctx, volume, key, theme, props, lines) {
    ctx.runtime.update({ message: 'Marching cubes...' });
    const ids = fillSerial(new Int32Array(volume.grid.cells.data.length));
    const wireframe = await computeMarchingCubesLines({
        isoLevel: Volume.IsoValue.toAbsolute(props.isoValue, volume.grid.stats).absoluteValue,
        scalarField: volume.grid.cells,
        idField: Tensor.create(volume.grid.cells.space, Tensor.Data1(ids))
    }, lines).runAsChild(ctx.runtime);
    const transform = Grid.getGridToCartesianTransform(volume.grid);
    Lines.transform(wireframe, transform);
    wireframe.setBoundingSphere(Volume.Isosurface.getBoundingSphere(volume, props.isoValue));
    return wireframe;
}
export const IsosurfaceWireframeParams = {
    ...Lines.Params,
    ...VolumeIsosurfaceParams,
    quality: { ...Lines.Params.quality, isEssential: false },
    sizeFactor: PD.Numeric(3, { min: 0, max: 10, step: 0.1 }),
};
export function IsosurfaceWireframeVisual(materialId) {
    return VolumeVisual({
        defaultProps: PD.getDefaultValues(IsosurfaceWireframeParams),
        createGeometry: createVolumeIsosurfaceWireframe,
        createLocationIterator: (volume) => LocationIterator(volume.grid.cells.data.length, 1, 1, () => NullLocation),
        getLoci: getIsosurfaceLoci,
        eachLocation: eachIsosurface,
        setUpdateState: (state, volume, newProps, currentProps) => {
            if (!Volume.IsoValue.areSame(newProps.isoValue, currentProps.isoValue, volume.grid.stats))
                state.createGeometry = true;
        },
        geometryUtils: Lines.Utils
    }, materialId);
}
//
const IsosurfaceVisuals = {
    'solid': (ctx, getParams) => VolumeRepresentation('Isosurface mesh', ctx, getParams, IsosurfaceVisual, getLoci),
    'wireframe': (ctx, getParams) => VolumeRepresentation('Isosurface wireframe', ctx, getParams, IsosurfaceWireframeVisual, getLoci),
};
export const IsosurfaceParams = {
    ...IsosurfaceMeshParams,
    ...IsosurfaceWireframeParams,
    visuals: PD.MultiSelect(['solid'], PD.objectToOptions(IsosurfaceVisuals)),
    bumpFrequency: PD.Numeric(1, { min: 0, max: 10, step: 0.1 }, BaseGeometry.ShadingCategory),
};
export function getIsosurfaceParams(ctx, volume) {
    const p = PD.clone(IsosurfaceParams);
    p.isoValue = Volume.createIsoValueParam(Volume.IsoValue.relative(2), volume.grid.stats);
    return p;
}
export function IsosurfaceRepresentation(ctx, getParams) {
    return Representation.createMulti('Isosurface', ctx, getParams, Representation.StateBuilder, IsosurfaceVisuals);
}
export const IsosurfaceRepresentationProvider = VolumeRepresentationProvider({
    name: 'isosurface',
    label: 'Isosurface',
    description: 'Displays a triangulated isosurface of volumetric data.',
    factory: IsosurfaceRepresentation,
    getParams: getIsosurfaceParams,
    defaultValues: PD.getDefaultValues(IsosurfaceParams),
    defaultColorTheme: { name: 'uniform' },
    defaultSizeTheme: { name: 'uniform' },
    isApplicable: (volume) => !Volume.isEmpty(volume) && !Volume.Segmentation.get(volume)
});
