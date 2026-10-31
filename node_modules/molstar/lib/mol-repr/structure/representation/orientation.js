/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { UnitsRepresentation } from '../units-representation';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { StructureRepresentationProvider, StructureRepresentationStateBuilder } from '../representation';
import { Representation } from '../../../mol-repr/representation';
import { OrientationEllipsoidMeshParams, OrientationEllipsoidMeshVisual } from '../visual/orientation-ellipsoid-mesh';
import { BaseGeometry } from '../../../mol-geo/geometry/base';
const OrientationVisuals = {
    'orientation-ellipsoid-mesh': (ctx, getParams) => UnitsRepresentation('Orientation ellipsoid mesh', ctx, getParams, OrientationEllipsoidMeshVisual),
};
export const OrientationParams = {
    ...OrientationEllipsoidMeshParams,
    visuals: PD.MultiSelect(['orientation-ellipsoid-mesh'], PD.objectToOptions(OrientationVisuals)),
    bumpFrequency: PD.Numeric(1, { min: 0, max: 10, step: 0.1 }, BaseGeometry.ShadingCategory),
};
export function getOrientationParams(ctx, structure) {
    return OrientationParams;
}
export function OrientationRepresentation(ctx, getParams) {
    return Representation.createMulti('Orientation', ctx, getParams, StructureRepresentationStateBuilder, OrientationVisuals);
}
export const OrientationRepresentationProvider = StructureRepresentationProvider({
    name: 'orientation',
    label: 'Orientation',
    description: 'Displays orientation ellipsoids for polymer chains.',
    factory: OrientationRepresentation,
    getParams: getOrientationParams,
    defaultValues: PD.getDefaultValues(OrientationParams),
    defaultColorTheme: { name: 'chain-id' },
    defaultSizeTheme: { name: 'uniform' },
    isApplicable: (structure) => structure.elementCount > 0
});
