"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartialChargeColorThemeProvider = exports.PartialChargeColorThemeParams = void 0;
exports.getPartialChargeColorThemeParams = getPartialChargeColorThemeParams;
exports.PartialChargeColorTheme = PartialChargeColorTheme;
const color_1 = require("../../mol-util/color");
const structure_1 = require("../../mol-model/structure");
const param_definition_1 = require("../../mol-util/param-definition");
const partial_charge_1 = require("../../mol-model-formats/structure/property/partial-charge");
const categories_1 = require("./categories");
const DefaultPartialChargeColor = (0, color_1.Color)(0xffff99);
const Description = `Assigns a color based on the partial charge of an atom.`;
exports.PartialChargeColorThemeParams = {
    domain: param_definition_1.ParamDefinition.Interval([-1, 1]),
    list: param_definition_1.ParamDefinition.ColorList('red-white-blue', { presetKind: 'scale' }),
};
function getPartialChargeColorThemeParams(ctx) {
    return exports.PartialChargeColorThemeParams; // TODO return copy
}
function getPartialCharge(unit, element) {
    var _a;
    return (_a = partial_charge_1.AtomPartialCharge.Provider.get(unit.model)) === null || _a === void 0 ? void 0 : _a.data.value(element);
}
function PartialChargeColorTheme(ctx, props) {
    const scale = color_1.ColorScale.create({
        domain: props.domain,
        listOrName: props.list.colors,
    });
    function color(location) {
        if (structure_1.StructureElement.Location.is(location)) {
            const q = getPartialCharge(location.unit, location.element);
            return q !== undefined ? scale.color(q) : DefaultPartialChargeColor;
        }
        else if (structure_1.Bond.isLocation(location)) {
            const q = getPartialCharge(location.aUnit, location.aUnit.elements[location.aIndex]);
            return q !== undefined ? scale.color(q) : DefaultPartialChargeColor;
        }
        return DefaultPartialChargeColor;
    }
    return {
        factory: PartialChargeColorTheme,
        granularity: 'group',
        preferSmoothing: true,
        color,
        props,
        description: Description,
        legend: scale ? scale.legend : undefined
    };
}
exports.PartialChargeColorThemeProvider = {
    name: 'partial-charge',
    label: 'Partial Charge',
    category: categories_1.ColorThemeCategory.Atom,
    factory: PartialChargeColorTheme,
    getParams: getPartialChargeColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.PartialChargeColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure && ctx.structure.models.some(m => partial_charge_1.AtomPartialCharge.Provider.get(m) !== undefined)
};
