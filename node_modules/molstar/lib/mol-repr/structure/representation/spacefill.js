/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ElementSphereVisual, ElementSphereParams, StructureElementSphereVisual } from '../visual/element-sphere';
import { UnitsRepresentation } from '../units-representation';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { ComplexRepresentation, StructureRepresentationProvider, StructureRepresentationStateBuilder } from '../representation';
import { Representation } from '../../../mol-repr/representation';
import { BaseGeometry } from '../../../mol-geo/geometry/base';
const SpacefillVisuals = {
    'element-sphere': (ctx, getParams) => UnitsRepresentation('Sphere mesh/impostor', ctx, getParams, ElementSphereVisual),
    'structure-element-sphere': (ctx, getParams) => ComplexRepresentation('Structure sphere mesh/impostor', ctx, getParams, StructureElementSphereVisual),
};
export const SpacefillParams = {
    ...ElementSphereParams,
    bumpFrequency: PD.Numeric(1, { min: 0, max: 10, step: 0.1 }, BaseGeometry.ShadingCategory),
    visuals: PD.MultiSelect(['element-sphere'], PD.objectToOptions(SpacefillVisuals)),
};
let CoarseGrainedSpacefillParams;
export function getSpacefillParams(ctx, structure) {
    if (structure.isCoarseGrained) {
        if (!CoarseGrainedSpacefillParams) {
            CoarseGrainedSpacefillParams = PD.clone(SpacefillParams);
            CoarseGrainedSpacefillParams.sizeFactor.defaultValue = 2;
        }
        return CoarseGrainedSpacefillParams;
    }
    return SpacefillParams;
}
export function SpacefillRepresentation(ctx, getParams) {
    return Representation.createMulti('Spacefill', ctx, getParams, StructureRepresentationStateBuilder, SpacefillVisuals);
}
export const SpacefillRepresentationProvider = StructureRepresentationProvider({
    name: 'spacefill',
    label: 'Spacefill',
    description: 'Displays atomic/coarse elements as spheres.',
    factory: SpacefillRepresentation,
    getParams: getSpacefillParams,
    defaultValues: PD.getDefaultValues(SpacefillParams),
    defaultColorTheme: { name: 'element-symbol' },
    defaultSizeTheme: { name: 'physical' },
    isApplicable: (structure) => structure.elementCount > 0
});
