/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { StructureElement, Unit, Bond } from '../../mol-model/structure';
import { VdwRadius } from '../../mol-model/structure/model/properties/atomic';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
const DefaultSize = 1;
const Description = 'Assigns a physical size, i.e. vdW radius for atoms or given radius for coarse spheres.';
export const PhysicalSizeThemeParams = {
    scale: PD.Numeric(1, { min: 0.1, max: 5, step: 0.1 })
};
export function getPhysicalSizeThemeParams(ctx) {
    return PhysicalSizeThemeParams; // TODO return copy
}
export function getPhysicalRadius(unit, element) {
    if (Unit.isAtomic(unit)) {
        return VdwRadius(unit.model.atomicHierarchy.atoms.type_symbol.value(element));
    }
    else if (Unit.isSpheres(unit)) {
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
export function PhysicalSizeTheme(ctx, props) {
    const scale = props.scale === void 0 ? 1 : props.scale;
    function size(location) {
        let size;
        if (StructureElement.Location.is(location)) {
            size = scale * getPhysicalRadius(location.unit, location.element);
        }
        else if (Bond.isLocation(location)) {
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
export const PhysicalSizeThemeProvider = {
    name: 'physical',
    label: 'Physical',
    category: '',
    factory: PhysicalSizeTheme,
    getParams: getPhysicalSizeThemeParams,
    defaultValues: PD.getDefaultValues(PhysicalSizeThemeParams),
    isApplicable: (ctx) => !!ctx.structure
};
