/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Color, ColorScale } from '../../mol-util/color';
import { StructureElement, Unit, Bond } from '../../mol-model/structure';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { ColorThemeCategory } from './categories';
const DefaultOccupancyColor = Color(0xCCCCCC);
const Description = `Assigns a color based on the occupancy of an atom.`;
export const OccupancyColorThemeParams = {
    domain: PD.Interval([0, 1]),
    list: PD.ColorList('purples', { presetKind: 'scale' }),
};
export function getOccupancyColorThemeParams(ctx) {
    return OccupancyColorThemeParams; // TODO return copy
}
export function getOccupancy(unit, element) {
    if (Unit.isAtomic(unit)) {
        return unit.model.atomicConformation.occupancy.value(element);
    }
    else {
        return 0;
    }
}
export function OccupancyColorTheme(ctx, props) {
    const scale = ColorScale.create({
        reverse: false,
        domain: props.domain,
        listOrName: props.list.colors,
    });
    function color(location) {
        if (StructureElement.Location.is(location)) {
            return scale.color(getOccupancy(location.unit, location.element));
        }
        else if (Bond.isLocation(location)) {
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
export const OccupancyColorThemeProvider = {
    name: 'occupancy',
    label: 'Occupancy',
    category: ColorThemeCategory.Atom,
    factory: OccupancyColorTheme,
    getParams: getOccupancyColorThemeParams,
    defaultValues: PD.getDefaultValues(OccupancyColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure && ctx.structure.models.some(m => m.atomicConformation.occupancy.isDefined)
};
