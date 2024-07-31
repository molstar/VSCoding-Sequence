"use strict";
/**
 * Copyright (c) 2023-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MVSAnnotationLabelRepresentationProvider = exports.MVSAnnotationLabelParams = void 0;
exports.MVSAnnotationLabelRepresentation = MVSAnnotationLabelRepresentation;
const representation_1 = require("../../../../mol-repr/representation");
const representation_2 = require("../../../../mol-repr/structure/representation");
const marker_action_1 = require("../../../../mol-util/marker-action");
const param_definition_1 = require("../../../../mol-util/param-definition");
const is_mvs_model_prop_1 = require("../is-mvs-model-prop");
const visual_1 = require("./visual");
/** Components of "MVS Annotation Label" representation */
const MVSAnnotationLabelVisuals = {
    'label-text': (ctx, getParams) => (0, representation_2.ComplexRepresentation)('Label text', ctx, getParams, visual_1.MVSAnnotationLabelTextVisual),
};
exports.MVSAnnotationLabelParams = {
    ...visual_1.MVSAnnotationLabelTextParams,
    visuals: param_definition_1.ParamDefinition.MultiSelect(['label-text'], param_definition_1.ParamDefinition.objectToOptions(MVSAnnotationLabelVisuals)),
};
function MVSAnnotationLabelRepresentation(ctx, getParams) {
    const repr = representation_1.Representation.createMulti('Label', ctx, getParams, representation_2.StructureRepresentationStateBuilder, MVSAnnotationLabelVisuals);
    repr.setState({ pickable: false, markerActions: marker_action_1.MarkerAction.None });
    return repr;
}
/** A thingy that is needed to register representation type "MVS Annotation Label", allowing showing labels based on "MVS Annotations" custom props */
exports.MVSAnnotationLabelRepresentationProvider = (0, representation_2.StructureRepresentationProvider)({
    name: 'mvs-annotation-label',
    label: 'MVS Annotation Label',
    description: 'Displays labels based on annotation custom model property',
    factory: MVSAnnotationLabelRepresentation,
    getParams: () => exports.MVSAnnotationLabelParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.MVSAnnotationLabelParams),
    defaultColorTheme: { name: 'uniform' }, // this ain't workin
    defaultSizeTheme: { name: 'physical' },
    isApplicable: (structure) => structure.elementCount > 0 && (0, is_mvs_model_prop_1.isMVSStructure)(structure),
});
