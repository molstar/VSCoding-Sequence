"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionsProvider = exports.InteractionsParams = void 0;
const param_definition_1 = require("../../mol-util/param-definition");
const interactions_1 = require("./interactions/interactions");
const custom_structure_property_1 = require("../common/custom-structure-property");
const custom_property_1 = require("../../mol-model/custom-property");
exports.InteractionsParams = {
    ...interactions_1.InteractionsParams
};
exports.InteractionsProvider = custom_structure_property_1.CustomStructureProperty.createProvider({
    label: 'Interactions',
    descriptor: (0, custom_property_1.CustomPropertyDescriptor)({
        name: 'molstar_computed_interactions',
        // TODO `cifExport` and `symbol`
    }),
    type: 'local',
    defaultParams: exports.InteractionsParams,
    getParams: (data) => exports.InteractionsParams,
    isApplicable: (data) => !data.isCoarseGrained,
    obtain: async (ctx, data, props) => {
        const p = { ...param_definition_1.ParamDefinition.getDefaultValues(exports.InteractionsParams), ...props };
        return { value: await (0, interactions_1.computeInteractions)(ctx, data, p) };
    }
});
