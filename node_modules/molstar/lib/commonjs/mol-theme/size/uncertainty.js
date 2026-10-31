"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UncertaintySizeThemeProvider = exports.UncertaintySizeThemeParams = void 0;
exports.getUncertaintySizeThemeParams = getUncertaintySizeThemeParams;
exports.getUncertainty = getUncertainty;
exports.UncertaintySizeTheme = UncertaintySizeTheme;
const structure_1 = require("../../mol-model/structure");
const param_definition_1 = require("../../mol-util/param-definition");
const Description = `Assigns a size reflecting the uncertainty or disorder of an element's position, e.g. B-factor or RMSF, depending on the data availability and experimental technique.`;
exports.UncertaintySizeThemeParams = {
    bfactorFactor: param_definition_1.ParamDefinition.Numeric(0.1, { min: 0, max: 1, step: 0.01 }),
    rmsfFactor: param_definition_1.ParamDefinition.Numeric(0.05, { min: 0, max: 1, step: 0.01 }),
    baseSize: param_definition_1.ParamDefinition.Numeric(0.2, { min: 0, max: 2, step: 0.1 }),
};
function getUncertaintySizeThemeParams(ctx) {
    return exports.UncertaintySizeThemeParams; // TODO return copy
}
function getUncertainty(unit, element, props) {
    if (structure_1.Unit.isAtomic(unit)) {
        return unit.model.atomicConformation.B_iso_or_equiv.value(element) * props.bfactorFactor;
    }
    else if (structure_1.Unit.isSpheres(unit)) {
        return unit.model.coarseConformation.spheres.rmsf[element] * props.rmsfFactor;
    }
    else {
        return 0;
    }
}
function UncertaintySizeTheme(ctx, props) {
    function size(location) {
        let size = props.baseSize;
        if (structure_1.StructureElement.Location.is(location)) {
            size += getUncertainty(location.unit, location.element, props);
        }
        else if (structure_1.Bond.isLocation(location)) {
            size += getUncertainty(location.aUnit, location.aUnit.elements[location.aIndex], props);
        }
        return size;
    }
    return {
        factory: UncertaintySizeTheme,
        granularity: 'group',
        size,
        props,
        description: Description
    };
}
exports.UncertaintySizeThemeProvider = {
    name: 'uncertainty',
    label: 'Uncertainty/Disorder',
    category: '',
    factory: UncertaintySizeTheme,
    getParams: getUncertaintySizeThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.UncertaintySizeThemeParams),
    isApplicable: (ctx) => !!ctx.structure && ctx.structure.models.some(m => m.atomicConformation.B_iso_or_equiv.isDefined || m.coarseHierarchy.isDefined)
};
