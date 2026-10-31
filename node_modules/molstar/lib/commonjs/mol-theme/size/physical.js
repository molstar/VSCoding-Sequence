"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhysicalSizeThemeProvider = exports.PhysicalSizeThemeParams = void 0;
exports.getPhysicalSizeThemeParams = getPhysicalSizeThemeParams;
exports.getPhysicalRadius = getPhysicalRadius;
exports.PhysicalSizeTheme = PhysicalSizeTheme;
const structure_1 = require("../../mol-model/structure");
const atomic_1 = require("../../mol-model/structure/model/properties/atomic");
const param_definition_1 = require("../../mol-util/param-definition");
const DefaultSize = 1;
const Description = 'Assigns a physical size, i.e. vdW radius for atoms or given radius for coarse spheres.';
exports.PhysicalSizeThemeParams = {
    scale: param_definition_1.ParamDefinition.Numeric(1, { min: 0.1, max: 5, step: 0.1 })
};
function getPhysicalSizeThemeParams(ctx) {
    return exports.PhysicalSizeThemeParams; // TODO return copy
}
function getPhysicalRadius(unit, element) {
    if (structure_1.Unit.isAtomic(unit)) {
        return (0, atomic_1.VdwRadius)(unit.model.atomicHierarchy.atoms.type_symbol.value(element));
    }
    else if (structure_1.Unit.isSpheres(unit)) {
        return unit.model.coarseConformation.spheres.radius[element];
    }
    else {
        return 0;
    }
}
/**
 * Create attribute data with the physical size of an element,
 * i.e. vdw for atoms and radius for coarse spheres
 */
function PhysicalSizeTheme(ctx, props) {
    const scale = props.scale === void 0 ? 1 : props.scale;
    function size(location) {
        let size;
        if (structure_1.StructureElement.Location.is(location)) {
            size = scale * getPhysicalRadius(location.unit, location.element);
        }
        else if (structure_1.Bond.isLocation(location)) {
            size = scale * Math.min(getPhysicalRadius(location.aUnit, location.aUnit.elements[location.aIndex]), getPhysicalRadius(location.bUnit, location.bUnit.elements[location.bIndex]));
        }
        else {
            size = scale * DefaultSize;
        }
        return size;
    }
    return {
        factory: PhysicalSizeTheme,
        granularity: 'group',
        size,
        props,
        description: Description
    };
}
exports.PhysicalSizeThemeProvider = {
    name: 'physical',
    label: 'Physical',
    category: '',
    factory: PhysicalSizeTheme,
    getParams: getPhysicalSizeThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.PhysicalSizeThemeParams),
    isApplicable: (ctx) => !!ctx.structure
};
