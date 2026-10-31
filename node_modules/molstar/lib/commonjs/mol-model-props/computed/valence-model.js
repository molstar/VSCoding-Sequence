"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValenceModelProvider = exports.ValenceModelParams = void 0;
const param_definition_1 = require("../../mol-util/param-definition");
const valence_model_1 = require("./chemistry/valence-model");
const custom_structure_property_1 = require("../common/custom-structure-property");
const custom_property_1 = require("../../mol-model/custom-property");
exports.ValenceModelParams = {
    ...valence_model_1.ValenceModelParams
};
exports.ValenceModelProvider = custom_structure_property_1.CustomStructureProperty.createProvider({
    label: 'Valence Model',
    descriptor: (0, custom_property_1.CustomPropertyDescriptor)({
        name: 'molstar_computed_valence_model',
        // TODO `cifExport` and `symbol`
    }),
    type: 'local',
    defaultParams: exports.ValenceModelParams,
    getParams: (data) => exports.ValenceModelParams,
    isApplicable: (data) => true,
    obtain: async (ctx, data, props) => {
        const p = { ...param_definition_1.ParamDefinition.getDefaultValues(exports.ValenceModelParams), ...props };
        return { value: await (0, valence_model_1.calcValenceModel)(ctx.runtime, data, p) };
    }
});
