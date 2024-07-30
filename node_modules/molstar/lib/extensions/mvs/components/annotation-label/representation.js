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
import { MVSAnnotationLabelTextParams, MVSAnnotationLabelTextVisual } from './visual';
/** Components of "MVS Annotation Label" representation */
const MVSAnnotationLabelVisuals = {
    'label-text': (ctx, getParams) => ComplexRepresentation('Label text', ctx, getParams, MVSAnnotationLabelTextVisual),
};
export const MVSAnnotationLabelParams = {
    ...MVSAnnotationLabelTextParams,
    visuals: PD.MultiSelect(['label-text'], PD.objectToOptions(MVSAnnotationLabelVisuals)),
};
export function MVSAnnotationLabelRepresentation(ctx, getParams) {
    const repr = Representation.createMulti('Label', ctx, getParams, StructureRepresentationStateBuilder, MVSAnnotationLabelVisuals);
    repr.setState({ pickable: false, markerActions: MarkerAction.None });
    return repr;
}
/** A thingy that is needed to register representation type "MVS Annotation Label", allowing showing labels based on "MVS Annotations" custom props */
export const MVSAnnotationLabelRepresentationProvider = StructureRepresentationProvider({
    name: 'mvs-annotation-label',
    label: 'MVS Annotation Label',
    description: 'Displays labels based on annotation custom model property',
    factory: MVSAnnotationLabelRepresentation,
    getParams: () => MVSAnnotationLabelParams,
    defaultValues: PD.getDefaultValues(MVSAnnotationLabelParams),
    defaultColorTheme: { name: 'uniform' }, // this ain't workin
    defaultSizeTheme: { name: 'physical' },
    isApplicable: (structure) => structure.elementCount > 0 && isMVSStructure(structure),
});
