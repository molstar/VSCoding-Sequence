/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Color, ColorScale } from '../../mol-util/color';
import { StructureElement, Bond } from '../../mol-model/structure';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { AtomPartialCharge } from '../../mol-model-formats/structure/property/partial-charge';
import { ColorThemeCategory } from './categories';
const DefaultPartialChargeColor = Color(0xffff99);
const Description = `Assigns a color based on the partial charge of an atom.`;
export const PartialChargeColorThemeParams = {
    domain: PD.Interval([-1, 1]),
    list: PD.ColorList('red-white-blue', { presetKind: 'scale' }),
};
export function getPartialChargeColorThemeParams(ctx) {
    return PartialChargeColorThemeParams; // TODO return copy
}
function getPartialCharge(unit, element) {
    var _a;
    return (_a = AtomPartialCharge.Provider.get(unit.model)) === null || _a === void 0 ? void 0 : _a.data.value(element);
}
export function PartialChargeColorTheme(ctx, props) {
    const scale = ColorScale.create({
        domain: props.domain,
        listOrName: props.list.colors,
    });
    function color(location) {
        if (StructureElement.Location.is(location)) {
            const q = getPartialCharge(location.unit, location.element);
            return q !== undefined ? scale.color(q) : DefaultPartialChargeColor;
        }
        else if (Bond.isLocation(location)) {
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
export const PartialChargeColorThemeProvider = {
    name: 'partial-charge',
    label: 'Partial Charge',
    category: ColorThemeCategory.Atom,
    factory: PartialChargeColorTheme,
    getParams: getPartialChargeColorThemeParams,
    defaultValues: PD.getDefaultValues(PartialChargeColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure && ctx.structure.models.some(m => AtomPartialCharge.Provider.get(m) !== undefined)
};
