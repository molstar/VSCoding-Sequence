/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ElementPointVisual, ElementPointParams } from '../visual/element-point';
import { UnitsRepresentation } from '../units-representation';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { StructureRepresentationProvider, StructureRepresentationStateBuilder } from '../representation';
import { Representation } from '../../../mol-repr/representation';
const PointVisuals = {
    'element-point': (ctx, getParams) => UnitsRepresentation('Points', ctx, getParams, ElementPointVisual),
};
export const PointParams = {
    ...ElementPointParams,
};
export function getPointParams(ctx, structure) {
    return PointParams;
}
export function PointRepresentation(ctx, getParams) {
    return Representation.createMulti('Point', ctx, getParams, StructureRepresentationStateBuilder, PointVisuals);
}
export const PointRepresentationProvider = StructureRepresentationProvider({
    name: 'point',
    label: 'Point',
    description: 'Displays elements (atoms, coarse spheres) as points.',
    factory: PointRepresentation,
    getParams: getPointParams,
    defaultValues: PD.getDefaultValues(PointParams),
    defaultColorTheme: { name: 'element-symbol' },
    defaultSizeTheme: { name: 'uniform' },
    isApplicable: (structure) => structure.elementCount > 0
});
