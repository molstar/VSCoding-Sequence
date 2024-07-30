"use strict";
/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsMVSModelProvider = exports.IsMVSModelParams = void 0;
exports.isMVSModel = isMVSModel;
exports.isMVSStructure = isMVSStructure;
const custom_model_property_1 = require("../../../mol-model-props/common/custom-model-property");
const custom_property_1 = require("../../../mol-model/custom-property");
const param_definition_1 = require("../../../mol-util/param-definition");
exports.IsMVSModelParams = {
    isMvs: param_definition_1.ParamDefinition.Boolean(false, { description: 'Flag this model as managed by MolViewSpec and enable MolViewSpec features' }),
};
/** Provider for custom model property "Is MVS" */
exports.IsMVSModelProvider = custom_model_property_1.CustomModelProperty.createProvider({
    label: 'MVS',
    descriptor: (0, custom_property_1.CustomPropertyDescriptor)({
        name: 'mvs-is-mvs-model',
    }),
    type: 'static',
    defaultParams: exports.IsMVSModelParams,
    getParams: (data) => exports.IsMVSModelParams,
    isApplicable: (data) => true,
    obtain: async (ctx, data, props) => ({ value: {} }),
});
/** Decide if the model is flagged as managed by MolViewSpec */
function isMVSModel(model) {
    var _a;
    return !!((_a = exports.IsMVSModelProvider.props(model)) === null || _a === void 0 ? void 0 : _a.isMvs);
}
/** Decide if the structure is flagged as managed by MolViewSpec */
function isMVSStructure(structure) {
    return structure.models.some(isMVSModel);
}
