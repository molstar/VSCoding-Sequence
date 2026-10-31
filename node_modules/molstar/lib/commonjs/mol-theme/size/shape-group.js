"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShapeGroupSizeThemeProvider = exports.ShapeGroupSizeThemeParams = void 0;
exports.getShapeGroupSizeThemeParams = getShapeGroupSizeThemeParams;
exports.ShapeGroupSizeTheme = ShapeGroupSizeTheme;
const shape_1 = require("../../mol-model/shape");
const param_definition_1 = require("../../mol-util/param-definition");
const DefaultSize = 1;
const Description = 'Assigns sizes as defined by the shape object.';
exports.ShapeGroupSizeThemeParams = {};
function getShapeGroupSizeThemeParams(ctx) {
    return exports.ShapeGroupSizeThemeParams; // TODO return copy
}
function ShapeGroupSizeTheme(ctx, props) {
    return {
        factory: ShapeGroupSizeTheme,
        granularity: 'groupInstance',
        size: (location) => {
            if (shape_1.ShapeGroup.isLocation(location)) {
                return location.shape.getSize(location.group, location.instance);
            }
            return DefaultSize;
        },
        props,
        description: Description
    };
}
exports.ShapeGroupSizeThemeProvider = {
    name: 'shape-group',
    label: 'Shape Group',
    category: '',
    factory: ShapeGroupSizeTheme,
    getParams: getShapeGroupSizeThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.ShapeGroupSizeThemeParams),
    isApplicable: (ctx) => !!ctx.shape
};
