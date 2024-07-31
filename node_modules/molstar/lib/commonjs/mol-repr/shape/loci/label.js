"use strict";
/**
 * Copyright (c) 2019-24 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabelParams = void 0;
exports.LabelRepresentation = LabelRepresentation;
const loci_1 = require("../../../mol-model/loci");
const text_1 = require("../../../mol-geo/geometry/text/text");
const param_definition_1 = require("../../../mol-util/param-definition");
const representation_1 = require("../representation");
const representation_2 = require("../../representation");
const shape_1 = require("../../../mol-model/shape");
const text_builder_1 = require("../../../mol-geo/geometry/text/text-builder");
const geometry_1 = require("../../../mol-math/geometry");
const label_1 = require("../../../mol-theme/label");
const common_1 = require("./common");
const TextParams = {
    ...common_1.LociLabelTextParams,
};
const LabelVisuals = {
    'text': (ctx, getParams) => (0, representation_1.ShapeRepresentation)(getTextShape, text_1.Text.Utils),
};
exports.LabelParams = {
    ...TextParams,
    scaleByRadius: param_definition_1.ParamDefinition.Boolean(true),
    visuals: param_definition_1.ParamDefinition.MultiSelect(['text'], param_definition_1.ParamDefinition.objectToOptions(LabelVisuals)),
    snapshotKey: param_definition_1.ParamDefinition.Text('', { isEssential: true, disableInteractiveUpdates: true, description: 'Activate the snapshot with the provided key when clicking on the label' }),
    tooltip: param_definition_1.ParamDefinition.Text('', { isEssential: true, multiline: true, disableInteractiveUpdates: true, placeholder: 'Tooltip', description: 'Tooltip text to be displayed when hovering over the label' }),
};
//
const tmpSphere = (0, geometry_1.Sphere3D)();
function label(info, condensed = false) {
    return info.label || (0, label_1.lociLabel)(info.loci, { hidePrefix: true, htmlStyling: false, condensed });
}
function getLabelName(data) {
    return data.infos.length === 1 ? label(data.infos[0]) : `${data.infos.length} Labels`;
}
//
function buildText(data, props, text) {
    const builder = text_builder_1.TextBuilder.create(props, 128, 64, text);
    const customLabel = props.customText.trim();
    for (let i = 0, il = data.infos.length; i < il; ++i) {
        const info = data.infos[i];
        const sphere = loci_1.Loci.getBoundingSphere(info.loci, tmpSphere);
        if (!sphere)
            continue;
        const { center, radius } = sphere;
        const text = customLabel || label(info, true);
        builder.add(text, center[0], center[1], center[2], props.scaleByRadius ? radius / 0.9 : 0, props.scaleByRadius ? Math.max(1, radius) : 1, i);
    }
    return builder.getText();
}
function getTextShape(ctx, data, props, shape) {
    var _a, _b;
    const text = buildText(data, props, shape && shape.geometry);
    const name = getLabelName(data);
    const tooltip = (_b = (_a = props.tooltip) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : '';
    const customLabel = props.customText.trim();
    let getLabel;
    if (tooltip) {
        getLabel = (_) => tooltip;
    }
    else if (customLabel) {
        getLabel = (_) => customLabel;
    }
    else {
        getLabel = (groupId) => label(data.infos[groupId]);
    }
    return shape_1.Shape.create(name, data, text, () => props.textColor, () => props.textSize, getLabel);
}
function LabelRepresentation(ctx, getParams) {
    return representation_2.Representation.createMulti('Label', ctx, getParams, representation_2.Representation.StateBuilder, LabelVisuals);
}
