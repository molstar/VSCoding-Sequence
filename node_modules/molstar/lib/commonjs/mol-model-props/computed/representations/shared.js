"use strict";
/**
 * Copyright (c) 2022-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionsSharedParams = void 0;
const param_definition_1 = require("../../../mol-util/param-definition");
exports.InteractionsSharedParams = {
    sizeFactor: param_definition_1.ParamDefinition.Numeric(0.3, { min: 0, max: 10, step: 0.01 }),
    dashCount: param_definition_1.ParamDefinition.Numeric(6, { min: 1, max: 10, step: 1 }),
    dashScale: param_definition_1.ParamDefinition.Numeric(0.4, { min: 0, max: 2, step: 0.1 }),
    ignoreHydrogens: param_definition_1.ParamDefinition.Boolean(false),
    ignoreHydrogensVariant: param_definition_1.ParamDefinition.Select('all', param_definition_1.ParamDefinition.arrayToOptions(['all', 'non-polar'])),
    includeParent: param_definition_1.ParamDefinition.Boolean(false),
    parentDisplay: param_definition_1.ParamDefinition.Select('stub', param_definition_1.ParamDefinition.arrayToOptions(['stub', 'full', 'between']), { description: 'Only has an effect when "includeParent" is enabled. "Stub" shows just the child side of interactions to the parent. "Full" shows both sides of interactions to the parent. "Between" shows only interactions to the parent.' }),
};
