"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NtCTubeProvider = exports.NtCTubeParams = void 0;
const property_1 = require("../property");
const custom_property_1 = require("../../../mol-model/custom-property");
const custom_model_property_1 = require("../../../mol-model-props/common/custom-model-property");
const wrapper_1 = require("../../../mol-model-props/common/wrapper");
const param_definition_1 = require("../../../mol-util/param-definition");
exports.NtCTubeParams = { ...property_1.DnatcoParams };
async function fromCif(ctx, model, props) {
    const info = wrapper_1.PropertyWrapper.createInfo();
    const data = property_1.Dnatco.getCifData(model);
    if (data === undefined)
        return { value: { info, data: undefined } };
    const steps = property_1.Dnatco.getStepsFromCif(model, data.steps, data.stepsSummary);
    return { value: { info, data: { data: steps } } };
}
exports.NtCTubeProvider = custom_model_property_1.CustomModelProperty.createProvider({
    label: 'NtC Tube',
    descriptor: (0, custom_property_1.CustomPropertyDescriptor)({
        name: 'ntc-tube',
    }),
    type: 'static',
    defaultParams: exports.NtCTubeParams,
    getParams: (data) => exports.NtCTubeParams,
    isApplicable: (data) => property_1.Dnatco.isApplicable(data),
    obtain: async (ctx, data, props) => {
        const p = { ...param_definition_1.ParamDefinition.getDefaultValues(exports.NtCTubeParams), ...props };
        return fromCif(ctx, data, p);
    }
});
