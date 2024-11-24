/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { GaussianSurfaceMeshParams, StructureGaussianSurfaceVisual, GaussianSurfaceVisual } from '../visual/gaussian-surface-mesh';
import { UnitsRepresentation } from '../units-representation';
import { GaussianWireframeVisual, GaussianWireframeParams } from '../visual/gaussian-surface-wireframe';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { StructureRepresentationProvider, StructureRepresentationStateBuilder, ComplexRepresentation } from '../representation';
import { Representation } from '../../../mol-repr/representation';
import { BaseGeometry } from '../../../mol-geo/geometry/base';
const GaussianSurfaceVisuals = {
    'gaussian-surface-mesh': (ctx, getParams) => UnitsRepresentation('Gaussian surface mesh', ctx, getParams, GaussianSurfaceVisual),
    'structure-gaussian-surface-mesh': (ctx, getParams) => ComplexRepresentation('Structure-Gaussian surface mesh', ctx, getParams, StructureGaussianSurfaceVisual),
    'gaussian-surface-wireframe': (ctx, getParams) => UnitsRepresentation('Gaussian surface wireframe', ctx, getParams, GaussianWireframeVisual),
};
export const GaussianSurfaceParams = {
    ...GaussianSurfaceMeshParams,
    ...GaussianWireframeParams,
    visuals: PD.MultiSelect(['gaussian-surface-mesh'], PD.objectToOptions(GaussianSurfaceVisuals)),
    bumpFrequency: PD.Numeric(1, { min: 0, max: 10, step: 0.1 }, BaseGeometry.ShadingCategory),
    density: PD.Numeric(0.5, { min: 0, max: 1, step: 0.01 }, BaseGeometry.ShadingCategory),
};
export function getGaussianSurfaceParams(ctx, structure) {
    return GaussianSurfaceParams;
}
export function GaussianSurfaceRepresentation(ctx, getParams) {
    return Representation.createMulti('Gaussian Surface', ctx, getParams, StructureRepresentationStateBuilder, GaussianSurfaceVisuals);
}
export const GaussianSurfaceRepresentationProvider = StructureRepresentationProvider({
    name: 'gaussian-surface',
    label: 'Gaussian Surface',
    description: 'Displays a gaussian molecular surface.',
    factory: GaussianSurfaceRepresentation,
    getParams: getGaussianSurfaceParams,
    defaultValues: PD.getDefaultValues(GaussianSurfaceParams),
    defaultColorTheme: { name: 'chain-id' },
    defaultSizeTheme: { name: 'physical' },
    isApplicable: (structure) => structure.elementCount > 0
});
