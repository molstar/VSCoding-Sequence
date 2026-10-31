"use strict";
/**
 * Copyright (c) 2022-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Jason Pattle <jpattle@exscientia.co.uk>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelIndexColorThemeProvider = exports.ModelIndexColorThemeParams = void 0;
exports.getModelIndexColorThemeParams = getModelIndexColorThemeParams;
exports.ModelIndexColorTheme = ModelIndexColorTheme;
const color_1 = require("../../mol-util/color");
const structure_1 = require("../../mol-model/structure");
const param_definition_1 = require("../../mol-util/param-definition");
const palette_1 = require("../../mol-util/color/palette");
const categories_1 = require("./categories");
const DefaultColor = (0, color_1.Color)(0xCCCCCC);
const Description = 'Gives every model a unique color based on its index.';
exports.ModelIndexColorThemeParams = {
    ...(0, palette_1.getPaletteParams)({ type: 'colors', colorList: 'many-distinct' }),
};
function getModelIndexColorThemeParams(ctx) {
    return param_definition_1.ParamDefinition.clone(exports.ModelIndexColorThemeParams);
}
function ModelIndexColorTheme(ctx, props) {
    var _a;
    let color;
    let legend;
    let contextHash = -1;
    if (ctx.structure) {
        // max-index is the same for all models
        const size = ((_a = structure_1.Model.MaxIndex.get(ctx.structure.models[0]).value) !== null && _a !== void 0 ? _a : -1) + 1;
        contextHash = size;
        const palette = (0, palette_1.getPalette)(size, props);
        legend = palette.legend;
        color = (location) => {
            if (structure_1.StructureElement.Location.is(location)) {
                return palette.color(structure_1.Model.Index.get(location.unit.model).value || 0);
            }
            else if (structure_1.Bond.isLocation(location)) {
                return palette.color(structure_1.Model.Index.get(location.aUnit.model).value || 0);
            }
            return DefaultColor;
        };
    }
    else {
        color = () => DefaultColor;
    }
    return {
        factory: ModelIndexColorTheme,
        granularity: 'instance',
        color,
        props,
        contextHash,
        description: Description,
        legend
    };
}
exports.ModelIndexColorThemeProvider = {
    name: 'model-index',
    label: 'Model Index',
    category: categories_1.ColorThemeCategory.Chain,
    factory: ModelIndexColorTheme,
    getParams: getModelIndexColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.ModelIndexColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure && ctx.structure.elementCount > 0
};
