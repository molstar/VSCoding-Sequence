"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureGaussianSurfaceMeshParams = exports.GaussianSurfaceMeshParams = void 0;
exports.GaussianSurfaceVisual = GaussianSurfaceVisual;
exports.StructureGaussianSurfaceVisual = StructureGaussianSurfaceVisual;
exports.GaussianSurfaceMeshVisual = GaussianSurfaceMeshVisual;
exports.StructureGaussianSurfaceMeshVisual = StructureGaussianSurfaceMeshVisual;
exports.GaussianSurfaceTextureMeshVisual = GaussianSurfaceTextureMeshVisual;
exports.StructureGaussianSurfaceTextureMeshVisual = StructureGaussianSurfaceTextureMeshVisual;
const param_definition_1 = require("../../../mol-util/param-definition");
const units_visual_1 = require("../units-visual");
const gaussian_1 = require("./util/gaussian");
const mesh_1 = require("../../../mol-geo/geometry/mesh/mesh");
const algorithm_1 = require("../../../mol-geo/util/marching-cubes/algorithm");
const element_1 = require("./util/element");
const texture_mesh_1 = require("../../../mol-geo/geometry/texture-mesh/texture-mesh");
const isosurface_1 = require("../../../mol-gl/compute/marching-cubes/isosurface");
const geometry_1 = require("../../../mol-math/geometry");
const complex_visual_1 = require("../complex-visual");
const common_1 = require("./util/common");
const color_smoothing_1 = require("../../../mol-geo/geometry/mesh/color-smoothing");
const color_smoothing_2 = require("../../../mol-geo/geometry/texture-mesh/color-smoothing");
const base_1 = require("../../../mol-geo/geometry/base");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const debug_1 = require("../../../mol-util/debug");
const value_cell_1 = require("../../../mol-util/value-cell");
const SharedParams = {
    ...gaussian_1.GaussianDensityParams,
    ...base_1.ColorSmoothingParams,
    ignoreHydrogens: param_definition_1.ParamDefinition.Boolean(false),
    ignoreHydrogensVariant: param_definition_1.ParamDefinition.Select('all', param_definition_1.ParamDefinition.arrayToOptions(['all', 'non-polar'])),
    tryUseGpu: param_definition_1.ParamDefinition.Boolean(true),
    includeParent: param_definition_1.ParamDefinition.Boolean(false, { isHidden: true }),
};
exports.GaussianSurfaceMeshParams = {
    ...units_visual_1.UnitsMeshParams,
    ...units_visual_1.UnitsTextureMeshParams,
    ...SharedParams,
};
exports.StructureGaussianSurfaceMeshParams = {
    ...complex_visual_1.ComplexMeshParams,
    ...complex_visual_1.ComplexTextureMeshParams,
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
    const { areaCells, maxAreaCells } = (0, common_1.getVolumeSliceInfo)(structure.boundary.box, props.resolution, d * d);
    return areaCells < maxAreaCells;
}
function GaussianSurfaceVisual(materialId, structure, props, webgl) {
    if (props.tryUseGpu && webgl && gpuSupport(webgl) && suitableForGpu(structure, props, webgl)) {
        return GaussianSurfaceTextureMeshVisual(materialId);
    }
    return GaussianSurfaceMeshVisual(materialId);
}
function StructureGaussianSurfaceVisual(materialId, structure, props, webgl) {
    if (props.tryUseGpu && webgl && gpuSupport(webgl) && suitableForGpu(structure, props, webgl)) {
        return StructureGaussianSurfaceTextureMeshVisual(materialId);
    }
    return StructureGaussianSurfaceMeshVisual(materialId);
}
//
async function createGaussianSurfaceMesh(ctx, unit, structure, theme, props, mesh) {
    const { smoothness } = props;
    const { transform, field, idField, radiusFactor, resolution, maxRadius } = await (0, gaussian_1.computeUnitGaussianDensity)(structure, unit, theme.size, props).runInContext(ctx.runtime);
    const params = {
        isoLevel: Math.exp(-smoothness) / radiusFactor,
        scalarField: field,
        idField
    };
    const surface = await (0, algorithm_1.computeMarchingCubesMesh)(params, mesh).runAsChild(ctx.runtime);
    surface.meta.resolution = resolution;
    mesh_1.Mesh.transform(surface, transform);
    if (ctx.webgl && !ctx.webgl.isWebGL2) {
        mesh_1.Mesh.uniformTriangleGroup(surface);
        value_cell_1.ValueCell.updateIfChanged(surface.varyingGroup, false);
    }
    else {
        value_cell_1.ValueCell.updateIfChanged(surface.varyingGroup, true);
    }
    const sphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), unit.boundary.sphere, maxRadius);
    surface.setBoundingSphere(sphere);
    return surface;
}
function GaussianSurfaceMeshVisual(materialId) {
    return (0, units_visual_1.UnitsMeshVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.GaussianSurfaceMeshParams),
        createGeometry: createGaussianSurfaceMesh,
        createLocationIterator: element_1.ElementIterator.fromGroup,
        getLoci: element_1.getElementLoci,
        eachLocation: element_1.eachElement,
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
            const csp = (0, base_1.getColorSmoothingProps)(props.smoothColors, theme.color.preferSmoothing, resolution);
            if (csp) {
                (0, color_smoothing_1.applyMeshColorSmoothing)(values, csp.resolution, csp.stride, webgl, colorTexture);
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
    const { transform, field, idField, radiusFactor, resolution, maxRadius } = await (0, gaussian_1.computeStructureGaussianDensity)(structure, theme.size, props).runInContext(ctx.runtime);
    const params = {
        isoLevel: Math.exp(-smoothness) / radiusFactor,
        scalarField: field,
        idField
    };
    const surface = await (0, algorithm_1.computeMarchingCubesMesh)(params, mesh).runAsChild(ctx.runtime);
    surface.meta.resolution = resolution;
    mesh_1.Mesh.transform(surface, transform);
    if (ctx.webgl && !ctx.webgl.isWebGL2) {
        mesh_1.Mesh.uniformTriangleGroup(surface);
        value_cell_1.ValueCell.updateIfChanged(surface.varyingGroup, false);
    }
    else {
        value_cell_1.ValueCell.updateIfChanged(surface.varyingGroup, true);
    }
    const sphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), structure.boundary.sphere, maxRadius);
    surface.setBoundingSphere(sphere);
    return surface;
}
function StructureGaussianSurfaceMeshVisual(materialId) {
    return (0, complex_visual_1.ComplexMeshVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.StructureGaussianSurfaceMeshParams),
        createGeometry: createStructureGaussianSurfaceMesh,
        createLocationIterator: element_1.ElementIterator.fromStructure,
        getLoci: element_1.getSerialElementLoci,
        eachLocation: element_1.eachSerialElement,
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
            const csp = (0, base_1.getColorSmoothingProps)(props.smoothColors, theme.color.preferSmoothing, resolution);
            if (csp) {
                (0, color_smoothing_1.applyMeshColorSmoothing)(values, csp.resolution, csp.stride, webgl, colorTexture);
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
    if (debug_1.isTimingMode)
        ctx.webgl.timer.mark('createGaussianSurfaceTextureMesh');
    const { namedTextures, resources, extensions: { colorBufferFloat, textureFloat, colorBufferHalfFloat, textureHalfFloat } } = ctx.webgl;
    if (!namedTextures[GaussianSurfaceName]) {
        namedTextures[GaussianSurfaceName] = colorBufferHalfFloat && textureHalfFloat
            ? resources.texture('image-float16', 'rgba', 'fp16', 'linear')
            : colorBufferFloat && textureFloat
                ? resources.texture('image-float32', 'rgba', 'float', 'linear')
                : resources.texture('image-uint8', 'rgba', 'ubyte', 'linear');
    }
    const densityTextureData = await (0, gaussian_1.computeUnitGaussianDensityTexture2d)(structure, unit, theme.size, true, props, ctx.webgl, namedTextures[GaussianSurfaceName]).runInContext(ctx.runtime);
    const isoLevel = Math.exp(-props.smoothness) / densityTextureData.radiusFactor;
    const axisOrder = linear_algebra_1.Vec3.create(0, 1, 2);
    const buffer = textureMesh === null || textureMesh === void 0 ? void 0 : textureMesh.doubleBuffer.get();
    const gv = (0, isosurface_1.extractIsosurface)(ctx.webgl, densityTextureData.texture, densityTextureData.gridDim, densityTextureData.gridTexDim, densityTextureData.gridTexScale, densityTextureData.transform, isoLevel, false, true, axisOrder, true, buffer === null || buffer === void 0 ? void 0 : buffer.vertex, buffer === null || buffer === void 0 ? void 0 : buffer.group, buffer === null || buffer === void 0 ? void 0 : buffer.normal);
    if (debug_1.isTimingMode)
        ctx.webgl.timer.markEnd('createGaussianSurfaceTextureMesh');
    const groupCount = unit.elements.length;
    const boundingSphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), unit.boundary.sphere, densityTextureData.maxRadius);
    const surface = texture_mesh_1.TextureMesh.create(gv.vertexCount, groupCount, gv.vertexTexture, gv.groupTexture, gv.normalTexture, boundingSphere, textureMesh);
    surface.meta.resolution = densityTextureData.resolution;
    surface.meta.webgl = ctx.webgl;
    return surface;
}
function GaussianSurfaceTextureMeshVisual(materialId) {
    return (0, units_visual_1.UnitsTextureMeshVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.GaussianSurfaceMeshParams),
        createGeometry: createGaussianSurfaceTextureMesh,
        createLocationIterator: element_1.ElementIterator.fromGroup,
        getLoci: element_1.getElementLoci,
        eachLocation: element_1.eachElement,
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
            const csp = (0, base_1.getColorSmoothingProps)(props.smoothColors, theme.color.preferSmoothing, resolution);
            if (csp && webgl) {
                (0, color_smoothing_2.applyTextureMeshColorSmoothing)(values, csp.resolution, csp.stride, webgl, colorTexture);
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
    if (debug_1.isTimingMode)
        ctx.webgl.timer.mark('createStructureGaussianSurfaceTextureMesh');
    const { namedTextures, resources, extensions: { colorBufferFloat, textureFloat, colorBufferHalfFloat, textureHalfFloat } } = ctx.webgl;
    if (!namedTextures[GaussianSurfaceName]) {
        namedTextures[GaussianSurfaceName] = colorBufferHalfFloat && textureHalfFloat
            ? resources.texture('image-float16', 'rgba', 'fp16', 'linear')
            : colorBufferFloat && textureFloat
                ? resources.texture('image-float32', 'rgba', 'float', 'linear')
                : resources.texture('image-uint8', 'rgba', 'ubyte', 'linear');
    }
    const densityTextureData = await (0, gaussian_1.computeStructureGaussianDensityTexture2d)(structure, theme.size, true, props, ctx.webgl, namedTextures[GaussianSurfaceName]).runInContext(ctx.runtime);
    const isoLevel = Math.exp(-props.smoothness) / densityTextureData.radiusFactor;
    const axisOrder = linear_algebra_1.Vec3.create(0, 1, 2);
    const buffer = textureMesh === null || textureMesh === void 0 ? void 0 : textureMesh.doubleBuffer.get();
    const gv = (0, isosurface_1.extractIsosurface)(ctx.webgl, densityTextureData.texture, densityTextureData.gridDim, densityTextureData.gridTexDim, densityTextureData.gridTexScale, densityTextureData.transform, isoLevel, false, true, axisOrder, true, buffer === null || buffer === void 0 ? void 0 : buffer.vertex, buffer === null || buffer === void 0 ? void 0 : buffer.group, buffer === null || buffer === void 0 ? void 0 : buffer.normal);
    if (debug_1.isTimingMode)
        ctx.webgl.timer.markEnd('createStructureGaussianSurfaceTextureMesh');
    const groupCount = structure.elementCount;
    const boundingSphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), structure.boundary.sphere, densityTextureData.maxRadius);
    const surface = texture_mesh_1.TextureMesh.create(gv.vertexCount, groupCount, gv.vertexTexture, gv.groupTexture, gv.normalTexture, boundingSphere, textureMesh);
    surface.meta.resolution = densityTextureData.resolution;
    surface.meta.webgl = ctx.webgl;
    return surface;
}
function StructureGaussianSurfaceTextureMeshVisual(materialId) {
    return (0, complex_visual_1.ComplexTextureMeshVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.StructureGaussianSurfaceMeshParams),
        createGeometry: createStructureGaussianSurfaceTextureMesh,
        createLocationIterator: element_1.ElementIterator.fromStructure,
        getLoci: element_1.getSerialElementLoci,
        eachLocation: element_1.eachSerialElement,
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
            const csp = (0, base_1.getColorSmoothingProps)(props.smoothColors, theme.color.preferSmoothing, resolution);
            if (csp && webgl) {
                (0, color_smoothing_2.applyTextureMeshColorSmoothing)(values, csp.resolution, csp.stride, webgl, colorTexture);
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
