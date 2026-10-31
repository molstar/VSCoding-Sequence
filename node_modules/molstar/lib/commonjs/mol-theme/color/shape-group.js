"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShapeGroupColorThemeProvider = exports.ShapeGroupColorThemeParams = void 0;
exports.getShapeGroupColorThemeParams = getShapeGroupColorThemeParams;
exports.ShapeGroupColorTheme = ShapeGroupColorTheme;
const color_1 = require("../../mol-util/color");
const shape_1 = require("../../mol-model/shape");
const param_definition_1 = require("../../mol-util/param-definition");
const categories_1 = require("./categories");
const DefaultColor = (0, color_1.Color)(0xCCCCCC);
const Description = 'Assigns colors as defined by the shape object.';
exports.ShapeGroupColorThemeParams = {};
function getShapeGroupColorThemeParams(ctx) {
    return exports.ShapeGroupColorThemeParams; // TODO return copy
}
function ShapeGroupColorTheme(ctx, props) {
    return {
        factory: ShapeGroupColorTheme,
        granularity: 'groupInstance',
        color: (location) => {
            if (shape_1.ShapeGroup.isLocation(location)) {
                return location.shape.getColor(location.group, location.instance);
            }
            return DefaultColor;
        },
        props,
        description: Description
    };
}
exports.ShapeGroupColorThemeProvider = {
    name: 'shape-group',
    label: 'Shape Group',
    category: categories_1.ColorThemeCategory.Misc,
    factory: ShapeGroupColorTheme,
    getParams: getShapeGroupColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.ShapeGroupColorThemeParams),
    isApplicable: (ctx) => !!ctx.shape
};
