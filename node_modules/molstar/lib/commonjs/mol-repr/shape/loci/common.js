"use strict";
/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LociLabelTextParams = exports.MeasurementRepresentationCommonTextParams = void 0;
const param_definition_1 = require("../../../mol-util/param-definition");
const names_1 = require("../../../mol-util/color/names");
const text_1 = require("../../../mol-geo/geometry/text/text");
exports.MeasurementRepresentationCommonTextParams = {
    customText: param_definition_1.ParamDefinition.Text('', { label: 'Text', description: 'Override the label with custom value.', isEssential: true }),
    textColor: param_definition_1.ParamDefinition.Color(names_1.ColorNames.black, { isEssential: true }),
    textSize: param_definition_1.ParamDefinition.Numeric(0.5, { min: 0.1, max: 10, step: 0.1 }, { isEssential: true }),
};
exports.LociLabelTextParams = {
    ...text_1.Text.Params,
    ...exports.MeasurementRepresentationCommonTextParams,
    borderWidth: param_definition_1.ParamDefinition.Numeric(0.2, { min: 0, max: 0.5, step: 0.01 })
};
