/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { StructureRepresentationProvider, StructureRepresentationStateBuilder, ComplexRepresentation } from '../representation';
import { Representation } from '../../../mol-repr/representation';
import { LabelTextVisual, LabelTextParams } from '../visual/label-text';
import { MarkerAction } from '../../../mol-util/marker-action';
const LabelVisuals = {
    'label-text': (ctx, getParams) => ComplexRepresentation('Label text', ctx, getParams, LabelTextVisual),
};
export const LabelParams = {
    ...LabelTextParams,
    visuals: PD.MultiSelect(['label-text'], PD.objectToOptions(LabelVisuals)),
};
export function getLabelParams(ctx, structure) {
    return LabelParams;
}
export function LabelRepresentation(ctx, getParams) {
    const repr = Representation.createMulti('Label', ctx, getParams, StructureRepresentationStateBuilder, LabelVisuals);
    repr.setState({ pickable: false, markerActions: MarkerAction.None });
    return repr;
}
export const LabelRepresentationProvider = StructureRepresentationProvider({
    name: 'label',
    label: 'Label',
    description: 'Displays labels.',
    factory: LabelRepresentation,
    getParams: getLabelParams,
    defaultValues: PD.getDefaultValues(LabelParams),
    defaultColorTheme: { name: 'uniform' },
    defaultSizeTheme: { name: 'physical' },
    isApplicable: (structure) => structure.elementCount > 0
});
