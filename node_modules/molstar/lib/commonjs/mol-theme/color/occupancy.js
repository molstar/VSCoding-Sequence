"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OccupancyColorThemeProvider = exports.OccupancyColorThemeParams = void 0;
exports.getOccupancyColorThemeParams = getOccupancyColorThemeParams;
exports.getOccupancy = getOccupancy;
exports.OccupancyColorTheme = OccupancyColorTheme;
const color_1 = require("../../mol-util/color");
const structure_1 = require("../../mol-model/structure");
const param_definition_1 = require("../../mol-util/param-definition");
const categories_1 = require("./categories");
const DefaultOccupancyColor = (0, color_1.Color)(0xCCCCCC);
const Description = `Assigns a color based on the occupancy of an atom.`;
exports.OccupancyColorThemeParams = {
    domain: param_definition_1.ParamDefinition.Interval([0, 1]),
    list: param_definition_1.ParamDefinition.ColorList('purples', { presetKind: 'scale' }),
};
function getOccupancyColorThemeParams(ctx) {
    return exports.OccupancyColorThemeParams; // TODO return copy
}
function getOccupancy(unit, element) {
    if (structure_1.Unit.isAtomic(unit)) {
        return unit.model.atomicConformation.occupancy.value(element);
    }
    else {
        return 0;
    }
}
function OccupancyColorTheme(ctx, props) {
    const scale = color_1.ColorScale.create({
        reverse: false,
        domain: props.domain,
        listOrName: props.list.colors,
    });
    function color(location) {
        if (structure_1.StructureElement.Location.is(location)) {
            return scale.color(getOccupancy(location.unit, location.element));
        }
        else if (structure_1.Bond.isLocation(location)) {
            return scale.color(getOccupancy(location.aUnit, location.aUnit.elements[location.aIndex]));
        }
        return DefaultOccupancyColor;
    }
    return {
        factory: OccupancyColorTheme,
        granularity: 'group',
        preferSmoothing: true,
        color,
        props,
        description: Description,
        legend: scale ? scale.legend : undefined
    };
}
exports.OccupancyColorThemeProvider = {
    name: 'occupancy',
    label: 'Occupancy',
    category: categories_1.ColorThemeCategory.Atom,
    factory: OccupancyColorTheme,
    getParams: getOccupancyColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.OccupancyColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure && ctx.structure.models.some(m => m.atomicConformation.occupancy.isDefined)
};
