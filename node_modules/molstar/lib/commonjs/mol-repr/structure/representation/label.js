"use strict";
/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabelRepresentationProvider = exports.LabelParams = void 0;
exports.getLabelParams = getLabelParams;
exports.LabelRepresentation = LabelRepresentation;
const param_definition_1 = require("../../../mol-util/param-definition");
const representation_1 = require("../representation");
const representation_2 = require("../../../mol-repr/representation");
const label_text_1 = require("../visual/label-text");
const marker_action_1 = require("../../../mol-util/marker-action");
const LabelVisuals = {
    'label-text': (ctx, getParams) => (0, representation_1.ComplexRepresentation)('Label text', ctx, getParams, label_text_1.LabelTextVisual),
};
exports.LabelParams = {
    ...label_text_1.LabelTextParams,
    visuals: param_definition_1.ParamDefinition.MultiSelect(['label-text'], param_definition_1.ParamDefinition.objectToOptions(LabelVisuals)),
};
function getLabelParams(ctx, structure) {
    return exports.LabelParams;
}
function LabelRepresentation(ctx, getParams) {
    const repr = representation_2.Representation.createMulti('Label', ctx, getParams, representation_1.StructureRepresentationStateBuilder, LabelVisuals);
    repr.setState({ pickable: false, markerActions: marker_action_1.MarkerAction.None });
    return repr;
}
exports.LabelRepresentationProvider = (0, representation_1.StructureRepresentationProvider)({
    name: 'label',
    label: 'Label',
    description: 'Displays labels.',
    factory: LabelRepresentation,
    getParams: getLabelParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.LabelParams),
    defaultColorTheme: { name: 'uniform' },
    defaultSizeTheme: { name: 'physical' },
    isApplicable: (structure) => structure.elementCount > 0
});
