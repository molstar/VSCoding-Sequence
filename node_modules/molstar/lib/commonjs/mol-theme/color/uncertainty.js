"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UncertaintyColorThemeProvider = exports.UncertaintyColorThemeParams = void 0;
exports.getUncertaintyColorThemeParams = getUncertaintyColorThemeParams;
exports.getUncertainty = getUncertainty;
exports.UncertaintyColorTheme = UncertaintyColorTheme;
const color_1 = require("../../mol-util/color");
const structure_1 = require("../../mol-model/structure");
const param_definition_1 = require("../../mol-util/param-definition");
const categories_1 = require("./categories");
const DefaultUncertaintyColor = (0, color_1.Color)(0xffff99);
const Description = `Assigns a color based on the uncertainty or disorder of an element's position, e.g. B-factor or RMSF, depending on the data availability and experimental technique.`;
exports.UncertaintyColorThemeParams = {
    domain: param_definition_1.ParamDefinition.Interval([0, 100]),
    list: param_definition_1.ParamDefinition.ColorList('red-white-blue', { presetKind: 'scale' }),
};
function getUncertaintyColorThemeParams(ctx) {
    return exports.UncertaintyColorThemeParams; // TODO return copy
}
function getUncertainty(unit, element) {
    if (structure_1.Unit.isAtomic(unit)) {
        return unit.model.atomicConformation.B_iso_or_equiv.value(element);
    }
    else if (structure_1.Unit.isSpheres(unit)) {
        return unit.model.coarseConformation.spheres.rmsf[element];
    }
    else {
        return 0;
    }
}
function UncertaintyColorTheme(ctx, props) {
    const scale = color_1.ColorScale.create({
        reverse: true,
        domain: props.domain,
        listOrName: props.list.colors,
    });
    // TODO calc domain based on data, set min/max as 10/90 percentile to be robust against outliers
    function color(location) {
        if (structure_1.StructureElement.Location.is(location)) {
            return scale.color(getUncertainty(location.unit, location.element));
        }
        else if (structure_1.Bond.isLocation(location)) {
            return scale.color(getUncertainty(location.aUnit, location.aUnit.elements[location.aIndex]));
        }
        return DefaultUncertaintyColor;
    }
    return {
        factory: UncertaintyColorTheme,
        granularity: 'group',
        preferSmoothing: true,
        color,
        props,
        description: Description,
        legend: scale ? scale.legend : undefined
    };
}
exports.UncertaintyColorThemeProvider = {
    name: 'uncertainty',
    label: 'Uncertainty/Disorder',
    category: categories_1.ColorThemeCategory.Atom,
    factory: UncertaintyColorTheme,
    getParams: getUncertaintyColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.UncertaintyColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure && ctx.structure.models.some(m => m.atomicConformation.B_iso_or_equiv.isDefined || m.coarseHierarchy.isDefined)
};
