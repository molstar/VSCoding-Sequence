"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfalPyramidsProvider = exports.ConfalPyramidsParams = void 0;
const property_1 = require("../property");
const custom_property_1 = require("../../../mol-model/custom-property");
const custom_model_property_1 = require("../../../mol-model-props/common/custom-model-property");
const param_definition_1 = require("../../../mol-util/param-definition");
exports.ConfalPyramidsParams = { ...property_1.DnatcoParams };
exports.ConfalPyramidsProvider = custom_model_property_1.CustomModelProperty.createProvider({
    label: 'Confal Pyramids',
    descriptor: (0, custom_property_1.CustomPropertyDescriptor)({
        name: 'confal_pyramids',
    }),
    type: 'static',
    defaultParams: exports.ConfalPyramidsParams,
    getParams: (data) => exports.ConfalPyramidsParams,
    isApplicable: (data) => property_1.Dnatco.isApplicable(data),
    obtain: async (ctx, data, props) => {
        const p = { ...param_definition_1.ParamDefinition.getDefaultValues(exports.ConfalPyramidsParams), ...props };
        return property_1.Dnatco.fromCif(ctx, data, p);
    }
});
