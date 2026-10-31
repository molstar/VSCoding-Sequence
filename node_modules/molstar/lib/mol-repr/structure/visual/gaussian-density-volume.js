/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { computeStructureGaussianDensityTexture, computeUnitGaussianDensityTexture, GaussianDensityParams } from './util/gaussian';
import { DirectVolume } from '../../../mol-geo/geometry/direct-volume/direct-volume';
import { ComplexDirectVolumeParams, ComplexDirectVolumeVisual } from '../complex-visual';
import { Mat4, Vec3 } from '../../../mol-math/linear-algebra';
import { eachElement, eachSerialElement, ElementIterator, getElementLoci, getSerialElementLoci } from './util/element';
import { Sphere3D } from '../../../mol-math/geometry';
import { UnitsDirectVolumeParams, UnitsDirectVolumeVisual } from '../units-visual';
async function createGaussianDensityVolume(ctx, structure, theme, props, directVolume) {
    const { runtime, webgl } = ctx;
    if (!webgl || !webgl.extensions.blendMinMax) {
        throw new Error('GaussianDensityVolume requires `webgl` and `blendMinMax` extension');
    }
    const oldTexture = directVolume ? directVolume.gridTexture.ref.value : undefined;
    const densityTextureData = await computeStructureGaussianDensityTexture(structure, theme.size, props, webgl, oldTexture).runInContext(runtime);
    const { transform, texture, bbox, gridDim } = densityTextureData;
    const stats = { min: 0, max: 1, mean: 0.04, sigma: 0.01 };
    const unitToCartn = Mat4.mul(Mat4(), transform, Mat4.fromScaling(Mat4(), gridDim));
    const cellDim = Mat4.getScaling(Vec3(), transform);
    const axisOrder = Vec3.create(0, 1, 2);
    const vol = DirectVolume.create(bbox, gridDim, transform, unitToCartn, cellDim, texture, stats, true, axisOrder, directVolume);
    const sphere = Sphere3D.expand(Sphere3D(), structure.boundary.sphere, densityTextureData.maxRadius);
    vol.setBoundingSphere(sphere);
    return vol;
}
export const GaussianDensityVolumeParams = {
    ...ComplexDirectVolumeParams,
    ...GaussianDensityParams,
    ignoreHydrogens: PD.Boolean(false),
    ignoreHydrogensVariant: PD.Select('all', PD.arrayToOptions(['all', 'non-polar'])),
    includeParent: PD.Boolean(false, { isHidden: true }),
};
export function GaussianDensityVolumeVisual(materialId) {
    return ComplexDirectVolumeVisual({
        defaultProps: PD.getDefaultValues(GaussianDensityVolumeParams),
        createGeometry: createGaussianDensityVolume,
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
        },
        dispose: (geometry) => {
            geometry.gridTexture.ref.value.destroy();
        }
    }, materialId);
}
//
async function createUnitsGaussianDensityVolume(ctx, unit, structure, theme, props, directVolume) {
    const { runtime, webgl } = ctx;
    if (!webgl) {
        // gpu gaussian density also needs blendMinMax but there is no fallback here so
        // we allow it here with the results that there is no group id assignment and
        // hence no group-based coloring or picking
        throw new Error('GaussianDensityVolume requires `webgl`');
    }
    const oldTexture = directVolume ? directVolume.gridTexture.ref.value : undefined;
    const densityTextureData = await computeUnitGaussianDensityTexture(structure, unit, theme.size, props, webgl, oldTexture).runInContext(runtime);
    const { transform, texture, bbox, gridDim } = densityTextureData;
    const stats = { min: 0, max: 1, mean: 0.04, sigma: 0.01 };
    const unitToCartn = Mat4.mul(Mat4(), transform, Mat4.fromScaling(Mat4(), gridDim));
    const cellDim = Mat4.getScaling(Vec3(), transform);
    const axisOrder = Vec3.create(0, 1, 2);
    const vol = DirectVolume.create(bbox, gridDim, transform, unitToCartn, cellDim, texture, stats, true, axisOrder, directVolume);
    const sphere = Sphere3D.expand(Sphere3D(), unit.boundary.sphere, densityTextureData.maxRadius);
    vol.setBoundingSphere(sphere);
    return vol;
}
export const UnitsGaussianDensityVolumeParams = {
    ...UnitsDirectVolumeParams,
    ...GaussianDensityParams,
    ignoreHydrogens: PD.Boolean(false),
    ignoreHydrogensVariant: PD.Select('all', PD.arrayToOptions(['all', 'non-polar'])),
    includeParent: PD.Boolean(false, { isHidden: true }),
};
export function UnitsGaussianDensityVolumeVisual(materialId) {
    return UnitsDirectVolumeVisual({
        defaultProps: PD.getDefaultValues(UnitsGaussianDensityVolumeParams),
        createGeometry: createUnitsGaussianDensityVolume,
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
        },
        dispose: (geometry) => {
            geometry.gridTexture.ref.value.destroy();
        }
    }, materialId);
}
