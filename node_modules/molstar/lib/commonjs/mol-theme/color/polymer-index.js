"use strict";
/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolymerIndexColorThemeProvider = exports.PolymerIndexColorThemeParams = void 0;
exports.getPolymerIndexColorThemeParams = getPolymerIndexColorThemeParams;
exports.PolymerIndexColorTheme = PolymerIndexColorTheme;
const color_1 = require("../../mol-util/color");
const structure_1 = require("../../mol-model/structure");
const param_definition_1 = require("../../mol-util/param-definition");
const palette_1 = require("../../mol-util/color/palette");
const lists_1 = require("../../mol-util/color/lists");
const categories_1 = require("./categories");
const DefaultList = 'dark-2';
const DefaultColor = (0, color_1.Color)(0xCCCCCC);
const Description = 'Gives every polymer chain instance a unique color based on the position (index) of the polymer in the list of polymers in the structure.';
exports.PolymerIndexColorThemeParams = {
    ...(0, palette_1.getPaletteParams)({ type: 'colors', colorList: DefaultList }),
};
function getPolymerIndexColorThemeParams(ctx) {
    const params = param_definition_1.ParamDefinition.clone(exports.PolymerIndexColorThemeParams);
    if (ctx.structure) {
        if (getPolymerChainCount(ctx.structure.root) > lists_1.ColorLists[DefaultList].list.length) {
            params.palette.defaultValue.name = 'colors';
            params.palette.defaultValue.params = {
                ...params.palette.defaultValue.params,
                list: { kind: 'interpolate', colors: (0, lists_1.getColorListFromName)(DefaultList).list }
            };
        }
    }
    return params;
}
function getPolymerChainCount(structure) {
    let polymerChainCount = 0;
    const { units } = structure;
    for (let i = 0, il = units.length; i < il; ++i) {
        if (units[i].polymerElements.length > 0)
            ++polymerChainCount;
    }
    return polymerChainCount;
}
function PolymerIndexColorTheme(ctx, props) {
    let color;
    let legend;
    if (ctx.structure) {
        const palette = (0, palette_1.getPalette)(getPolymerChainCount(ctx.structure.root), props);
        legend = palette.legend;
        const { units } = ctx.structure.root;
        const unitIdColor = new Map();
        for (let i = 0, j = 0, il = units.length; i < il; ++i) {
            if (units[i].polymerElements.length > 0) {
                unitIdColor.set(units[i].id, palette.color(j));
                ++j;
            }
        }
        color = (location) => {
            let color;
            if (structure_1.StructureElement.Location.is(location)) {
                color = unitIdColor.get(location.unit.id);
            }
            else if (structure_1.Bond.isLocation(location)) {
                color = unitIdColor.get(location.aUnit.id);
            }
            return color !== undefined ? color : DefaultColor;
        };
    }
    else {
        color = () => DefaultColor;
    }
    return {
        factory: PolymerIndexColorTheme,
        granularity: 'instance',
        color,
        props,
        description: Description,
        legend
    };
}
exports.PolymerIndexColorThemeProvider = {
    name: 'polymer-index',
    label: 'Polymer Chain Instance',
    category: categories_1.ColorThemeCategory.Chain,
    factory: PolymerIndexColorTheme,
    getParams: getPolymerIndexColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.PolymerIndexColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure
};
