"use strict";
/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitIndexColorThemeProvider = exports.UnitIndexColorThemeParams = void 0;
exports.getUnitIndexColorThemeParams = getUnitIndexColorThemeParams;
exports.UnitIndexColorTheme = UnitIndexColorTheme;
const color_1 = require("../../mol-util/color");
const structure_1 = require("../../mol-model/structure");
const param_definition_1 = require("../../mol-util/param-definition");
const palette_1 = require("../../mol-util/color/palette");
const lists_1 = require("../../mol-util/color/lists");
const categories_1 = require("./categories");
const DefaultList = 'dark-2';
const DefaultColor = (0, color_1.Color)(0xCCCCCC);
const Description = 'Gives every chain instance (single chain or collection of single elements) a unique color based on the position (index) of the chain in the list of chains in the structure.';
exports.UnitIndexColorThemeParams = {
    ...(0, palette_1.getPaletteParams)({ type: 'colors', colorList: DefaultList }),
};
function getUnitIndexColorThemeParams(ctx) {
    const params = param_definition_1.ParamDefinition.clone(exports.UnitIndexColorThemeParams);
    if (ctx.structure) {
        if (ctx.structure.root.units.length > lists_1.ColorLists[DefaultList].list.length) {
            params.palette.defaultValue.name = 'colors';
            params.palette.defaultValue.params = {
                ...params.palette.defaultValue.params,
                list: { kind: 'interpolate', colors: (0, lists_1.getColorListFromName)(DefaultList).list }
            };
        }
    }
    return params;
}
function UnitIndexColorTheme(ctx, props) {
    let color;
    let legend;
    if (ctx.structure) {
        const { units } = ctx.structure.root;
        const palette = (0, palette_1.getPalette)(units.length, props);
        legend = palette.legend;
        const unitIdColor = new Map();
        for (let i = 0, il = units.length; i < il; ++i) {
            unitIdColor.set(units[i].id, palette.color(i));
        }
        color = (location) => {
            if (structure_1.StructureElement.Location.is(location)) {
                return unitIdColor.get(location.unit.id);
            }
            else if (structure_1.Bond.isLocation(location)) {
                return unitIdColor.get(location.aUnit.id);
            }
            return DefaultColor;
        };
    }
    else {
        color = () => DefaultColor;
    }
    return {
        factory: UnitIndexColorTheme,
        granularity: 'instance',
        color,
        props,
        description: Description,
        legend
    };
}
exports.UnitIndexColorThemeProvider = {
    name: 'unit-index',
    label: 'Chain Instance',
    category: categories_1.ColorThemeCategory.Chain,
    factory: UnitIndexColorTheme,
    getParams: getUnitIndexColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.UnitIndexColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure
};
