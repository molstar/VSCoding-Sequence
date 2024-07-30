/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { UnitsMeshParams, UnitsTextureMeshParams, UnitsMeshVisual, UnitsTextureMeshVisual } from '../units-visual';
import { GaussianDensityParams, computeUnitGaussianDensity, computeUnitGaussianDensityTexture2d, computeStructureGaussianDensity, computeStructureGaussianDensityTexture2d } from './util/gaussian';
import { Mesh } from '../../../mol-geo/geometry/mesh/mesh';
import { computeMarchingCubesMesh } from '../../../mol-geo/util/marching-cubes/algorithm';
import { ElementIterator, getElementLoci, eachElement, getSerialElementLoci, eachSerialElement } from './util/element';
import { TextureMesh } from '../../../mol-geo/geometry/texture-mesh/texture-mesh';
import { extractIsosurface } from '../../../mol-gl/compute/marching-cubes/isosurface';
import { Sphere3D } from '../../../mol-math/geometry';
import { ComplexMeshParams, ComplexMeshVisual, ComplexTextureMeshVisual, ComplexTextureMeshParams } from '../complex-visual';
import { getVolumeSliceInfo } from './util/common';
import { applyMeshColorSmoothing } from '../../../mol-geo/geometry/mesh/color-smoothing';
import { applyTextureMeshColorSmoothing } from '../../../mol-geo/geometry/texture-mesh/color-smoothing';
import { ColorSmoothingParams, getColorSmoothingProps } from '../../../mol-geo/geometry/base';
import { Vec3 } from '../../../mol-math/linear-algebra';
import { isTimingMode } from '../../../mol-util/debug';
import { ValueCell } from '../../../mol-util/value-cell';
const SharedParams = {
    ...GaussianDensityParams,
    ...ColorSmoothingParams,
    ignoreHydrogens: PD.Boolean(false),
    ignoreHydrogensVariant: PD.Select('all', PD.arrayToOptions(['all', 'non-polar'])),
    tryUseGpu: PD.Boolean(true),
    includeParent: PD.Boolean(false, { isHidden: true }),
};
export const GaussianSurfaceMeshParams = {
    ...UnitsMeshParams,
    ...UnitsTextureMeshParams,
    ...SharedParams,
};
export const StructureGaussianSurfaceMeshParams = {
    ...ComplexMeshParams,
    ...ComplexTextureMeshParams,
    ...SharedParams,
};
function gpuSupport(webgl) {
    return webgl.extensions.colorBufferFloat && webgl.extensions.textureFloat && webgl.extensions.textureFloatLinear && webgl.extensions.blendMinMax && webgl.extensions.drawBuffers;
}
function suitableForGpu(structure, props, webgl) {
    // lower resolutions are about as fast on CPU vs integrated GPU,
    // very low resolutions have artifacts when calculated on GPU
    if (props.resolution > 1)
        return false;
    // the GPU is much more memory contraint, especially true for integrated GPUs,
    // being conservative here still allows for small and medium sized assemblies
    const d = webgl.maxTextureSize / 3;
    const { areaCells, maxAreaCells } = getVolumeSliceInfo(structure.boundary.box, props.resolution, d * d);
    return areaCells < maxAreaCells;
}
export function GaussianSurfaceVisual(materialId, structure, props, webgl) {
    if (props.tryUseGpu && webgl && gpuSupport(webgl) && suitableForGpu(structure, props, webgl)) {
        return GaussianSurfaceTextureMeshVisual(materialId);
    }
    return GaussianSurfaceMeshVisual(materialId);
}
export function StructureGaussianSurfaceVisual(materialId, structure, props, webgl) {
    if (props.tryUseGpu && webgl && gpuSupport(webgl) && suitableForGpu(structure, props, webgl)) {
        return StructureGaussianSurfaceTextureMeshVisual(materialId);
    }
    return StructureGaussianSurfaceMeshVisual(materialId);
}
//
async function createGaussianSurfaceMesh(ctx, unit, structure, theme, props, mesh) {
    const { smoothness } = props;
    const { transform, field, idField, radiusFactor, resolution, maxRadius } = await computeUnitGaussianDensity(structure, unit, theme.size, props).runInContext(ctx.runtime);
    const params = {
        isoLevel: Math.exp(-smoothness) / radiusFactor,
        scalarField: field,
        idField
    };
    const surface = await computeMarchingCubesMesh(params, mesh).runAsChild(ctx.runtime);
    surface.meta.resolution = resolution;
    Mesh.transform(surface, transform);
    if (ctx.webgl && !ctx.webgl.isWebGL2) {
        Mesh.uniformTriangleGroup(surface);
        ValueCell.updateIfChanged(surface.varyingGroup, false);
    }
    else {
        ValueCell.updateIfChanged(surface.varyingGroup, true);
    }
    const sphere = Sphere3D.expand(Sphere3D(), unit.boundary.sphere, maxRadius);
    surface.setBoundingSphere(sphere);
    return surface;
}
export function GaussianSurfaceMeshVisual(materialId) {
    return UnitsMeshVisual({
        defaultProps: PD.getDefaultValues(GaussianSurfaceMeshParams),
        createGeometry: createGaussianSurfaceMesh,
        createLocationIterator: ElementIterator.fromGroup,
        getLoci: getElementLoci,
        eachLocation: eachElement,
        setUpdateState: (state, newProps, currentProps) => {
            if (newProps.resolution !== currentProps.resolution)
                state.createGeometry = true;
            if (newProps.radiusOffset !== currentProps.radiusOffset)
                state.createGeometry = true;
            if (newProps.smoothness !== currentProps.smoothness)
                state.createGeometry = true;
            if (newProps.ignoreHydrogens !== currentProps.ignoreHydrogens)
                state.createGeometry = true;
            if (newProps.ignoreHydrogensVariant !== currentProps.ignoreHydrogensVariant)
                state.createGeometry = true;
            if (newProps.traceOnly !== currentProps.traceOnly)
                state.createGeometry = true;
            if (newProps.includeParent !== currentProps.includeParent)
                state.createGeometry = true;
            if (newProps.smoothColors.name !== currentProps.smoothColors.name) {
                state.updateColor = true;
            }
            else if (newProps.smoothColors.name === 'on' && currentProps.smoothColors.name === 'on') {
                if (newProps.smoothColors.params.resolutionFactor !== currentProps.smoothColors.params.resolutionFactor)
                    state.updateColor = true;
                if (newProps.smoothColors.params.sampleStride !== currentProps.smoothColors.params.sampleStride)
                    state.updateColor = true;
            }
        },
        mustRecreate: (structureGroup, props, webgl) => {
            return props.tryUseGpu && !!webgl && suitableForGpu(structureGroup.structure, props, webgl);
        },
        processValues: (values, geometry, props, theme, webgl) => {
            const { resolution, colorTexture } = geometry.meta;
            const csp = getColorSmoothingProps(props.smoothColors, theme.color.preferSmoothing, resolution);
            if (csp) {
                applyMeshColorSmoothing(values, csp.resolution, csp.stride, webgl, colorTexture);
                geometry.meta.colorTexture = values.tColorGrid.ref.value;
            }
        },
        dispose: (geometry) => {
            var _a;
            (_a = geometry.meta.colorTexture) === null || _a === void 0 ? void 0 : _a.destroy();
        }
    }, materialId);
}
//
async function createStructureGaussianSurfaceMesh(ctx, structure, theme, props, mesh) {
    const { smoothness } = props;
    const { transform, field, idField, radiusFactor, resolution, maxRadius } = await computeStructureGaussianDensity(structure, theme.size, props).runInContext(ctx.runtime);
    const params = {
        isoLevel: Math.exp(-smoothness) / radiusFactor,
        scalarField: field,
        idField
    };
    const surface = await computeMarchingCubesMesh(params, mesh).runAsChild(ctx.runtime);
    surface.meta.resolution = resolution;
    Mesh.transform(surface, transform);
    if (ctx.webgl && !ctx.webgl.isWebGL2) {
        Mesh.uniformTriangleGroup(surface);
        ValueCell.updateIfChanged(surface.varyingGroup, false);
    }
    else {
        ValueCell.updateIfChanged(surface.varyingGroup, true);
    }
    const sphere = Sphere3D.expand(Sphere3D(), structure.boundary.sphere, maxRadius);
    surface.setBoundingSphere(sphere);
    return surface;
}
export function StructureGaussianSurfaceMeshVisual(materialId) {
    return ComplexMeshVisual({
        defaultProps: PD.getDefaultValues(StructureGaussianSurfaceMeshParams),
        createGeometry: createStructureGaussianSurfaceMesh,
        createLocationIterator: ElementIterator.fromStructure,
        getLoci: getSerialElementLoci,
        eachLocation: eachSerialElement,
        setUpdateState: (state, newProps, currentProps) => {
            if (newProps.resolution !== currentProps.resolution)
                state.createGeometry = true;
            if (newProps.radiusOffset !== currentProps.radiusOffset)
                state.createGeometry = true;
            if (newProps.smoothness !== currentProps.smoothness)
                state.createGeometry = true;
            if (newProps.ignoreHydrogens !== currentProps.ignoreHydrogens)
                state.createGeometry = true;
            if (newProps.ignoreHydrogensVariant !== currentProps.ignoreHydrogensVariant)
                state.createGeometry = true;
            if (newProps.traceOnly !== currentProps.traceOnly)
                state.createGeometry = true;
            if (newProps.smoothColors.name !== currentProps.smoothColors.name) {
                state.updateColor = true;
            }
            else if (newProps.smoothColors.name === 'on' && currentProps.smoothColors.name === 'on') {
                if (newProps.smoothColors.params.resolutionFactor !== currentProps.smoothColors.params.resolutionFactor)
                    state.updateColor = true;
                if (newProps.smoothColors.params.sampleStride !== currentProps.smoothColors.params.sampleStride)
                    state.updateColor = true;
            }
        },
        mustRecreate: (structure, props, webgl) => {
            return props.tryUseGpu && !!webgl && suitableForGpu(structure, props, webgl);
        },
        processValues: (values, geometry, props, theme, webgl) => {
            const { resolution, colorTexture } = geometry.meta;
            const csp = getColorSmoothingProps(props.smoothColors, theme.color.preferSmoothing, resolution);
            if (csp) {
                applyMeshColorSmoothing(values, csp.resolution, csp.stride, webgl, colorTexture);
                geometry.meta.colorTexture = values.tColorGrid.ref.value;
            }
        },
        dispose: (geometry) => {
            var _a;
            (_a = geometry.meta.colorTexture) === null || _a === void 0 ? void 0 : _a.destroy();
        }
    }, materialId);
}
//
const GaussianSurfaceName = 'gaussian-surface';
async function createGaussianSurfaceTextureMesh(ctx, unit, structure, theme, props, textureMesh) {
    if (!ctx.webgl)
        throw new Error('webgl context required to create gaussian surface texture-mesh');
    if (isTimingMode)
        ctx.webgl.timer.mark('createGaussianSurfaceTextureMesh');
    const { namedTextures, resources, extensions: { colorBufferFloat, textureFloat, colorBufferHalfFloat, textureHalfFloat } } = ctx.webgl;
    if (!namedTextures[GaussianSurfaceName]) {
        namedTextures[GaussianSurfaceName] = colorBufferHalfFloat && textureHalfFloat
            ? resources.texture('image-float16', 'rgba', 'fp16', 'linear')
            : colorBufferFloat && textureFloat
                ? resources.texture('image-float32', 'rgba', 'float', 'linear')
                : resources.texture('image-uint8', 'rgba', 'ubyte', 'linear');
    }
    const densityTextureData = await computeUnitGaussianDensityTexture2d(structure, unit, theme.size, true, props, ctx.webgl, namedTextures[GaussianSurfaceName]).runInContext(ctx.runtime);
    const isoLevel = Math.exp(-props.smoothness) / densityTextureData.radiusFactor;
    const axisOrder = Vec3.create(0, 1, 2);
    const buffer = textureMesh === null || textureMesh === void 0 ? void 0 : textureMesh.doubleBuffer.get();
    const gv = extractIsosurface(ctx.webgl, densityTextureData.texture, densityTextureData.gridDim, densityTextureData.gridTexDim, densityTextureData.gridTexScale, densityTextureData.transform, isoLevel, false, true, axisOrder, true, buffer === null || buffer === void 0 ? void 0 : buffer.vertex, buffer === null || buffer === void 0 ? void 0 : buffer.group, buffer === null || buffer === void 0 ? void 0 : buffer.normal);
    if (isTimingMode)
        ctx.webgl.timer.markEnd('createGaussianSurfaceTextureMesh');
    const groupCount = unit.elements.length;
    const boundingSphere = Sphere3D.expand(Sphere3D(), unit.boundary.sphere, densityTextureData.maxRadius);
    const surface = TextureMesh.create(gv.vertexCount, groupCount, gv.vertexTexture, gv.groupTexture, gv.normalTexture, boundingSphere, textureMesh);
    surface.meta.resolution = densityTextureData.resolution;
    surface.meta.webgl = ctx.webgl;
    return surface;
}
export function GaussianSurfaceTextureMeshVisual(materialId) {
    return UnitsTextureMeshVisual({
        defaultProps: PD.getDefaultValues(GaussianSurfaceMeshParams),
        createGeometry: createGaussianSurfaceTextureMesh,
        createLocationIterator: ElementIterator.fromGroup,
        getLoci: getElementLoci,
        eachLocation: eachElement,
        setUpdateState: (state, newProps, currentProps) => {
            if (newProps.resolution !== currentProps.resolution)
                state.createGeometry = true;
            if (newProps.radiusOffset !== currentProps.radiusOffset)
                state.createGeometry = true;
            if (newProps.smoothness !== currentProps.smoothness)
                state.createGeometry = true;
            if (newProps.ignoreHydrogens !== currentProps.ignoreHydrogens)
                state.createGeometry = true;
            if (newProps.ignoreHydrogensVariant !== currentProps.ignoreHydrogensVariant)
                state.createGeometry = true;
            if (newProps.traceOnly !== currentProps.traceOnly)
                state.createGeometry = true;
            if (newProps.includeParent !== currentProps.includeParent)
                state.createGeometry = true;
            if (newProps.smoothColors.name !== currentProps.smoothColors.name) {
                state.updateColor = true;
            }
            else if (newProps.smoothColors.name === 'on' && currentProps.smoothColors.name === 'on') {
                if (newProps.smoothColors.params.resolutionFactor !== currentProps.smoothColors.params.resolutionFactor)
                    state.updateColor = true;
                if (newProps.smoothColors.params.sampleStride !== currentProps.smoothColors.params.sampleStride)
                    state.updateColor = true;
            }
        },
        mustRecreate: (structureGroup, props, webgl) => {
            return !props.tryUseGpu || !webgl || !suitableForGpu(structureGroup.structure, props, webgl);
        },
        processValues: (values, geometry, props, theme, webgl) => {
            const { resolution, colorTexture } = geometry.meta;
            const csp = getColorSmoothingProps(props.smoothColors, theme.color.preferSmoothing, resolution);
            if (csp && webgl) {
                applyTextureMeshColorSmoothing(values, csp.resolution, csp.stride, webgl, colorTexture);
                geometry.meta.colorTexture = values.tColorGrid.ref.value;
            }
        },
        dispose: (geometry) => {
            var _a;
            geometry.vertexTexture.ref.value.destroy();
            geometry.groupTexture.ref.value.destroy();
            geometry.normalTexture.ref.value.destroy();
            geometry.doubleBuffer.destroy();
            (_a = geometry.meta.colorTexture) === null || _a === void 0 ? void 0 : _a.destroy();
        }
    }, materialId);
}
//
async function createStructureGaussianSurfaceTextureMesh(ctx, structure, theme, props, textureMesh) {
    if (!ctx.webgl)
        throw new Error('webgl context required to create structure gaussian surface texture-mesh');
    if (isTimingMode)
        ctx.webgl.timer.mark('createStructureGaussianSurfaceTextureMesh');
    const { namedTextures, resources, extensions: { colorBufferFloat, textureFloat, colorBufferHalfFloat, textureHalfFloat } } = ctx.webgl;
    if (!namedTextures[GaussianSurfaceName]) {
        namedTextures[GaussianSurfaceName] = colorBufferHalfFloat && textureHalfFloat
            ? resources.texture('image-float16', 'rgba', 'fp16', 'linear')
            : colorBufferFloat && textureFloat
                ? resources.texture('image-float32', 'rgba', 'float', 'linear')
                : resources.texture('image-uint8', 'rgba', 'ubyte', 'linear');
    }
    const densityTextureData = await computeStructureGaussianDensityTexture2d(structure, theme.size, true, props, ctx.webgl, namedTextures[GaussianSurfaceName]).runInContext(ctx.runtime);
    const isoLevel = Math.exp(-props.smoothness) / densityTextureData.radiusFactor;
    const axisOrder = Vec3.create(0, 1, 2);
    const buffer = textureMesh === null || textureMesh === void 0 ? void 0 : textureMesh.doubleBuffer.get();
    const gv = extractIsosurface(ctx.webgl, densityTextureData.texture, densityTextureData.gridDim, densityTextureData.gridTexDim, densityTextureData.gridTexScale, densityTextureData.transform, isoLevel, false, true, axisOrder, true, buffer === null || buffer === void 0 ? void 0 : buffer.vertex, buffer === null || buffer === void 0 ? void 0 : buffer.group, buffer === null || buffer === void 0 ? void 0 : buffer.normal);
    if (isTimingMode)
        ctx.webgl.timer.markEnd('createStructureGaussianSurfaceTextureMesh');
    const groupCount = structure.elementCount;
    const boundingSphere = Sphere3D.expand(Sphere3D(), structure.boundary.sphere, densityTextureData.maxRadius);
    const surface = TextureMesh.create(gv.vertexCount, groupCount, gv.vertexTexture, gv.groupTexture, gv.normalTexture, boundingSphere, textureMesh);
    surface.meta.resolution = densityTextureData.resolution;
    surface.meta.webgl = ctx.webgl;
    return surface;
}
export function StructureGaussianSurfaceTextureMeshVisual(materialId) {
    return ComplexTextureMeshVisual({
        defaultProps: PD.getDefaultValues(StructureGaussianSurfaceMeshParams),
        createGeometry: createStructureGaussianSurfaceTextureMesh,
        createLocationIterator: ElementIterator.fromStructure,
        getLoci: getSerialElementLoci,
        eachLocation: eachSerialElement,
        setUpdateState: (state, newProps, currentProps) => {
            if (newProps.resolution !== currentProps.resolution)
                state.createGeometry = true;
            if (newProps.radiusOffset !== currentProps.radiusOffset)
                state.createGeometry = true;
            if (newProps.smoothness !== currentProps.smoothness)
                state.createGeometry = true;
            if (newProps.ignoreHydrogens !== currentProps.ignoreHydrogens)
                state.createGeometry = true;
            if (newProps.ignoreHydrogensVariant !== currentProps.ignoreHydrogensVariant)
                state.createGeometry = true;
            if (newProps.traceOnly !== currentProps.traceOnly)
                state.createGeometry = true;
            if (newProps.includeParent !== currentProps.includeParent)
                state.createGeometry = true;
            if (newProps.smoothColors.name !== currentProps.smoothColors.name) {
                state.updateColor = true;
            }
            else if (newProps.smoothColors.name === 'on' && currentProps.smoothColors.name === 'on') {
                if (newProps.smoothColors.params.resolutionFactor !== currentProps.smoothColors.params.resolutionFactor)
                    state.updateColor = true;
                if (newProps.smoothColors.params.sampleStride !== currentProps.smoothColors.params.sampleStride)
                    state.updateColor = true;
            }
        },
        mustRecreate: (structure, props, webgl) => {
            return !props.tryUseGpu || !webgl || !suitableForGpu(structure, props, webgl);
        },
        processValues: (values, geometry, props, theme, webgl) => {
            const { resolution, colorTexture } = geometry.meta;
            const csp = getColorSmoothingProps(props.smoothColors, theme.color.preferSmoothing, resolution);
            if (csp && webgl) {
                applyTextureMeshColorSmoothing(values, csp.resolution, csp.stride, webgl, colorTexture);
                geometry.meta.colorTexture = values.tColorGrid.ref.value;
            }
        },
        dispose: (geometry) => {
            var _a;
            geometry.vertexTexture.ref.value.destroy();
            geometry.groupTexture.ref.value.destroy();
            geometry.normalTexture.ref.value.destroy();
            geometry.doubleBuffer.destroy();
            (_a = geometry.meta.colorTexture) === null || _a === void 0 ? void 0 : _a.destroy();
        }
    }, materialId);
}
