"use strict";
/**
 * Copyright (c) 2022-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureIndexColorThemeProvider = exports.StructureIndexColorThemeParams = void 0;
exports.getStructureIndexColorThemeParams = getStructureIndexColorThemeParams;
exports.StructureIndexColorTheme = StructureIndexColorTheme;
const color_1 = require("../../mol-util/color");
const structure_1 = require("../../mol-model/structure");
const param_definition_1 = require("../../mol-util/param-definition");
const palette_1 = require("../../mol-util/color/palette");
const categories_1 = require("./categories");
const DefaultColor = (0, color_1.Color)(0xCCCCCC);
const Description = 'Gives every structure a unique color based on its index.';
exports.StructureIndexColorThemeParams = {
    ...(0, palette_1.getPaletteParams)({ type: 'colors', colorList: 'many-distinct' }),
};
function getStructureIndexColorThemeParams(ctx) {
    return param_definition_1.ParamDefinition.clone(exports.StructureIndexColorThemeParams);
}
function StructureIndexColorTheme(ctx, props) {
    var _a;
    let color;
    let legend;
    let contextHash = -1;
    if (ctx.structure) {
        const size = ((_a = structure_1.Structure.MaxIndex.get(ctx.structure).value) !== null && _a !== void 0 ? _a : -1) + 1;
        contextHash = size;
        const palette = (0, palette_1.getPalette)(size, props);
        legend = palette.legend;
        color = (location) => {
            if (structure_1.StructureElement.Location.is(location)) {
                return palette.color(structure_1.Structure.Index.get(location.structure).value || 0);
            }
            else if (structure_1.Bond.isLocation(location)) {
                return palette.color(structure_1.Structure.Index.get(location.aStructure).value || 0);
            }
            return DefaultColor;
        };
    }
    else {
        color = () => DefaultColor;
    }
    return {
        factory: StructureIndexColorTheme,
        granularity: 'instance',
        color,
        props,
        contextHash,
        description: Description,
        legend
    };
}
exports.StructureIndexColorThemeProvider = {
    name: 'structure-index',
    label: 'Structure Index',
    category: categories_1.ColorThemeCategory.Chain,
    factory: StructureIndexColorTheme,
    getParams: getStructureIndexColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.StructureIndexColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure && ctx.structure.elementCount > 0
};
