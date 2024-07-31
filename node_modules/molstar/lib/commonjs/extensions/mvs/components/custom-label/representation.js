"use strict";
/**
 * Copyright (c) 2023-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomLabelRepresentationProvider = exports.CustomLabelParams = void 0;
exports.CustomLabelRepresentation = CustomLabelRepresentation;
const representation_1 = require("../../../../mol-repr/representation");
const representation_2 = require("../../../../mol-repr/structure/representation");
const marker_action_1 = require("../../../../mol-util/marker-action");
const param_definition_1 = require("../../../../mol-util/param-definition");
const is_mvs_model_prop_1 = require("../is-mvs-model-prop");
const visual_1 = require("./visual");
/** Components of "Custom Label" representation */
const CustomLabelVisuals = {
    'label-text': (ctx, getParams) => (0, representation_2.ComplexRepresentation)('Label text', ctx, getParams, visual_1.CustomLabelTextVisual),
};
exports.CustomLabelParams = {
    ...visual_1.CustomLabelTextParams,
    visuals: param_definition_1.ParamDefinition.MultiSelect(['label-text'], param_definition_1.ParamDefinition.objectToOptions(CustomLabelVisuals)),
};
function CustomLabelRepresentation(ctx, getParams) {
    const repr = representation_1.Representation.createMulti('Label', ctx, getParams, representation_2.StructureRepresentationStateBuilder, CustomLabelVisuals);
    repr.setState({ pickable: false, markerActions: marker_action_1.MarkerAction.None });
    return repr;
}
/** A thingy that is needed to register representation type "Custom Label", allowing user-defined labels at at user-defined positions */
exports.CustomLabelRepresentationProvider = (0, representation_2.StructureRepresentationProvider)({
    name: 'mvs-custom-label',
    label: 'MVS Custom Label',
    description: 'Displays labels with custom text',
    factory: CustomLabelRepresentation,
    getParams: () => exports.CustomLabelParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.CustomLabelParams),
    defaultColorTheme: { name: 'uniform' },
    defaultSizeTheme: { name: 'physical' },
    isApplicable: (structure) => structure.elementCount > 0 && (0, is_mvs_model_prop_1.isMVSStructure)(structure),
});
