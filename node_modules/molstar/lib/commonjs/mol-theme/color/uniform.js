"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniformColorThemeProvider = exports.UniformColorThemeParams = void 0;
exports.getUniformColorThemeParams = getUniformColorThemeParams;
exports.UniformColorTheme = UniformColorTheme;
const color_1 = require("../../mol-util/color");
const param_definition_1 = require("../../mol-util/param-definition");
const legend_1 = require("../../mol-util/legend");
const mol_util_1 = require("../../mol-util");
const categories_1 = require("./categories");
const DefaultColor = (0, color_1.Color)(0xCCCCCC);
const Description = 'Gives everything the same, uniform color.';
exports.UniformColorThemeParams = {
    value: param_definition_1.ParamDefinition.Color(DefaultColor),
    saturation: param_definition_1.ParamDefinition.Numeric(0, { min: -6, max: 6, step: 0.1 }),
    lightness: param_definition_1.ParamDefinition.Numeric(0, { min: -6, max: 6, step: 0.1 }),
};
function getUniformColorThemeParams(ctx) {
    return exports.UniformColorThemeParams; // TODO return copy
}
function UniformColorTheme(ctx, props) {
    let color = (0, mol_util_1.defaults)(props.value, DefaultColor);
    color = color_1.Color.saturate(color, props.saturation);
    color = color_1.Color.lighten(color, props.lightness);
    return {
        factory: UniformColorTheme,
        granularity: 'uniform',
        color: () => color,
        props: props,
        description: Description,
        legend: (0, legend_1.TableLegend)([['uniform', color]])
    };
}
exports.UniformColorThemeProvider = {
    name: 'uniform',
    label: 'Uniform',
    category: categories_1.ColorThemeCategory.Misc,
    factory: UniformColorTheme,
    getParams: getUniformColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.UniformColorThemeParams),
    isApplicable: (ctx) => true
};
