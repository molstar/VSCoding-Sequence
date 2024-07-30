"use strict";
/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementIndexColorThemeProvider = exports.ElementIndexColorThemeParams = void 0;
exports.getElementIndexColorThemeParams = getElementIndexColorThemeParams;
exports.ElementIndexColorTheme = ElementIndexColorTheme;
const color_1 = require("../../mol-util/color");
const structure_1 = require("../../mol-model/structure");
const int_1 = require("../../mol-data/int");
const param_definition_1 = require("../../mol-util/param-definition");
const palette_1 = require("../../mol-util/color/palette");
const categories_1 = require("./categories");
const DefaultColor = (0, color_1.Color)(0xCCCCCC);
const Description = 'Gives every element (atom or coarse sphere/gaussian) a unique color based on the position (index) of the element in the list of elements in the structure.';
exports.ElementIndexColorThemeParams = {
    ...(0, palette_1.getPaletteParams)({ type: 'colors', colorList: 'red-yellow-blue' }),
};
function getElementIndexColorThemeParams(ctx) {
    return exports.ElementIndexColorThemeParams; // TODO return copy
}
function ElementIndexColorTheme(ctx, props) {
    let color;
    let legend;
    if (ctx.structure) {
        const { units } = ctx.structure.root;
        const unitCount = units.length;
        const cummulativeElementCount = new Map();
        const unitIdIndex = new Map();
        let elementCount = 0;
        for (let i = 0; i < unitCount; ++i) {
            cummulativeElementCount.set(i, elementCount);
            elementCount += units[i].elements.length;
            unitIdIndex.set(units[i].id, i);
        }
        const palette = (0, palette_1.getPalette)(elementCount, props);
        legend = palette.legend;
        color = (location) => {
            if (structure_1.StructureElement.Location.is(location)) {
                const unitIndex = unitIdIndex.get(location.unit.id);
                const unitElementIndex = int_1.OrderedSet.findPredecessorIndex(units[unitIndex].elements, location.element);
                return palette.color(cummulativeElementCount.get(unitIndex) + unitElementIndex);
            }
            else if (structure_1.Bond.isLocation(location)) {
                const unitIndex = unitIdIndex.get(location.aUnit.id);
                const unitElementIndex = int_1.OrderedSet.findPredecessorIndex(units[unitIndex].elements, location.aUnit.elements[location.aIndex]);
                return palette.color(cummulativeElementCount.get(unitIndex) + unitElementIndex);
            }
            return DefaultColor;
        };
    }
    else {
        color = () => DefaultColor;
    }
    return {
        factory: ElementIndexColorTheme,
        granularity: 'groupInstance',
        preferSmoothing: true,
        color,
        props,
        description: Description,
        legend
    };
}
exports.ElementIndexColorThemeProvider = {
    name: 'element-index',
    label: 'Element Index',
    category: categories_1.ColorThemeCategory.Atom,
    factory: ElementIndexColorTheme,
    getParams: getElementIndexColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.ElementIndexColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure
};
