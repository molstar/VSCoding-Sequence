"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarbohydrateSymbolColorThemeProvider = exports.CarbohydrateSymbolColorThemeParams = void 0;
exports.getCarbohydrateSymbolColorThemeParams = getCarbohydrateSymbolColorThemeParams;
exports.CarbohydrateSymbolColorTheme = CarbohydrateSymbolColorTheme;
const structure_1 = require("../../mol-model/structure");
const constants_1 = require("../../mol-model/structure/structure/carbohydrates/constants");
const color_1 = require("../../mol-util/color");
const param_definition_1 = require("../../mol-util/param-definition");
const legend_1 = require("../../mol-util/legend");
const categories_1 = require("./categories");
const DefaultColor = (0, color_1.Color)(0xCCCCCC);
const Description = 'Assigns colors according to the Symbol Nomenclature for Glycans (SNFG).';
exports.CarbohydrateSymbolColorThemeParams = {};
function getCarbohydrateSymbolColorThemeParams(ctx) {
    return exports.CarbohydrateSymbolColorThemeParams; // TODO return copy
}
function CarbohydrateSymbolColorTheme(ctx, props) {
    let color;
    if (ctx.structure) {
        const { elements, getElementIndices } = ctx.structure.carbohydrates;
        const getColor = (unit, index) => {
            if (!structure_1.Unit.isAtomic(unit))
                return DefaultColor;
            const carbs = getElementIndices(unit, index);
            return carbs.length > 0 ? elements[carbs[0]].component.color : DefaultColor;
        };
        color = (location, isSecondary) => {
            if (isSecondary) {
                return constants_1.SaccharideColors.Secondary;
            }
            else {
                if (structure_1.StructureElement.Location.is(location)) {
                    return getColor(location.unit, location.element);
                }
                else if (structure_1.Bond.isLocation(location)) {
                    return getColor(location.aUnit, location.aUnit.elements[location.aIndex]);
                }
            }
            return DefaultColor;
        };
    }
    else {
        color = () => DefaultColor;
    }
    return {
        factory: CarbohydrateSymbolColorTheme,
        granularity: 'group',
        color: color,
        props: props,
        description: Description,
        legend: (0, legend_1.TableLegend)(constants_1.MonosaccharidesColorTable)
    };
}
exports.CarbohydrateSymbolColorThemeProvider = {
    name: 'carbohydrate-symbol',
    label: 'Carbohydrate Symbol',
    category: categories_1.ColorThemeCategory.Residue,
    factory: CarbohydrateSymbolColorTheme,
    getParams: getCarbohydrateSymbolColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.CarbohydrateSymbolColorThemeParams),
    isApplicable: (ctx) => {
        return !!ctx.structure && ctx.structure.models.some(m => structure_1.Model.hasCarbohydrate(m));
    }
};
