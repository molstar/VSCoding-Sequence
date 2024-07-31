/**
 * Copyright (c) 2023-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { Representation } from '../../../../mol-repr/representation';
import { ComplexRepresentation, StructureRepresentationProvider, StructureRepresentationStateBuilder } from '../../../../mol-repr/structure/representation';
import { MarkerAction } from '../../../../mol-util/marker-action';
import { ParamDefinition as PD } from '../../../../mol-util/param-definition';
import { isMVSStructure } from '../is-mvs-model-prop';
import { CustomLabelTextParams, CustomLabelTextVisual } from './visual';
/** Components of "Custom Label" representation */
const CustomLabelVisuals = {
    'label-text': (ctx, getParams) => ComplexRepresentation('Label text', ctx, getParams, CustomLabelTextVisual),
};
export const CustomLabelParams = {
    ...CustomLabelTextParams,
    visuals: PD.MultiSelect(['label-text'], PD.objectToOptions(CustomLabelVisuals)),
};
export function CustomLabelRepresentation(ctx, getParams) {
    const repr = Representation.createMulti('Label', ctx, getParams, StructureRepresentationStateBuilder, CustomLabelVisuals);
    repr.setState({ pickable: false, markerActions: MarkerAction.None });
    return repr;
}
/** A thingy that is needed to register representation type "Custom Label", allowing user-defined labels at at user-defined positions */
export const CustomLabelRepresentationProvider = StructureRepresentationProvider({
    name: 'mvs-custom-label',
    label: 'MVS Custom Label',
    description: 'Displays labels with custom text',
    factory: CustomLabelRepresentation,
    getParams: () => CustomLabelParams,
    defaultValues: PD.getDefaultValues(CustomLabelParams),
    defaultColorTheme: { name: 'uniform' },
    defaultSizeTheme: { name: 'physical' },
    isApplicable: (structure) => structure.elementCount > 0 && isMVSStructure(structure),
});
