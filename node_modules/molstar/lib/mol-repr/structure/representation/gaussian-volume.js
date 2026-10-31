/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { GaussianDensityVolumeParams, GaussianDensityVolumeVisual, UnitsGaussianDensityVolumeVisual } from '../visual/gaussian-density-volume';
import { StructureRepresentationProvider, ComplexRepresentation, StructureRepresentationStateBuilder, UnitsRepresentation } from '../representation';
import { Representation } from '../../../mol-repr/representation';
const GaussianVolumeVisuals = {
    'gaussian-volume': (ctx, getParams) => ComplexRepresentation('Gaussian volume', ctx, getParams, GaussianDensityVolumeVisual),
    'units-gaussian-volume': (ctx, getParams) => UnitsRepresentation('Units-Gaussian volume', ctx, getParams, UnitsGaussianDensityVolumeVisual)
};
export const GaussianVolumeParams = {
    ...GaussianDensityVolumeParams,
    jumpLength: PD.Numeric(4, { min: 0, max: 20, step: 0.1 }),
    visuals: PD.MultiSelect(['gaussian-volume'], PD.objectToOptions(GaussianVolumeVisuals)),
};
export function getGaussianVolumeParams(ctx, structure) {
    return GaussianVolumeParams;
}
export function GaussianVolumeRepresentation(ctx, getParams) {
    return Representation.createMulti('Gaussian Volume', ctx, getParams, StructureRepresentationStateBuilder, GaussianVolumeVisuals);
}
export const GaussianVolumeRepresentationProvider = StructureRepresentationProvider({
    name: 'gaussian-volume',
    label: 'Gaussian Volume',
    description: 'Displays a gaussian molecular density using direct volume rendering.',
    factory: GaussianVolumeRepresentation,
    getParams: getGaussianVolumeParams,
    defaultValues: PD.getDefaultValues(GaussianVolumeParams),
    defaultColorTheme: { name: 'chain-id' },
    defaultSizeTheme: { name: 'physical' },
    isApplicable: (structure) => structure.elementCount > 0
});
