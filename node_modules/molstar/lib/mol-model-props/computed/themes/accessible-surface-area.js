/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Color, ColorScale } from '../../../mol-util/color';
import { ColorTheme } from '../../../mol-theme/color';
import { Bond, StructureElement, Unit } from '../../../mol-model/structure';
import { AccessibleSurfaceAreaProvider } from '../accessible-surface-area';
import { AccessibleSurfaceArea } from '../accessible-surface-area/shrake-rupley';
import { hash2 } from '../../../mol-data/util';
const DefaultColor = Color(0xFAFAFA);
const Description = 'Assigns a color based on the relative accessible surface area of a residue.';
export const AccessibleSurfaceAreaColorThemeParams = {
    list: PD.ColorList('rainbow', { presetKind: 'scale' })
};
export function getAccessibleSurfaceAreaColorThemeParams(ctx) {
    return AccessibleSurfaceAreaColorThemeParams; // TODO return copy
}
export function AccessibleSurfaceAreaColorTheme(ctx, props) {
    let color;
    const scale = ColorScale.create({
        listOrName: props.list.colors,
        minLabel: 'buried',
        maxLabel: 'exposed',
        domain: [0.0, 1.0]
    });
    const accessibleSurfaceArea = ctx.structure && AccessibleSurfaceAreaProvider.get(ctx.structure);
    const contextHash = accessibleSurfaceArea ? hash2(accessibleSurfaceArea.id, accessibleSurfaceArea.version) : -1;
    if ((accessibleSurfaceArea === null || accessibleSurfaceArea === void 0 ? void 0 : accessibleSurfaceArea.value) && ctx.structure) {
        const l = StructureElement.Location.create(ctx.structure);
        const asa = accessibleSurfaceArea.value;
        const getColor = (location) => {
            const value = AccessibleSurfaceArea.getNormalizedValue(location, asa);
            return value === -1 ? DefaultColor : scale.color(value);
        };
        color = (location) => {
            if (StructureElement.Location.is(location) && Unit.isAtomic(location.unit)) {
                return getColor(location);
            }
            else if (Bond.isLocation(location)) {
                l.unit = location.aUnit;
                l.element = location.aUnit.elements[location.aIndex];
                return getColor(l);
            }
            return DefaultColor;
        };
    }
    else {
        color = () => DefaultColor;
    }
    return {
        factory: AccessibleSurfaceAreaColorTheme,
        granularity: 'group',
        preferSmoothing: true,
        color,
        props,
        contextHash,
        description: Description,
        legend: scale ? scale.legend : undefined
    };
}
export const AccessibleSurfaceAreaColorThemeProvider = {
    name: 'accessible-surface-area',
    label: 'Accessible Surface Area',
    category: ColorTheme.Category.Residue,
    factory: AccessibleSurfaceAreaColorTheme,
    getParams: getAccessibleSurfaceAreaColorThemeParams,
    defaultValues: PD.getDefaultValues(AccessibleSurfaceAreaColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure,
    ensureCustomProperties: {
        attach: (ctx, data) => data.structure ? AccessibleSurfaceAreaProvider.attach(ctx, data.structure, void 0, true) : Promise.resolve(),
        detach: (data) => data.structure && AccessibleSurfaceAreaProvider.ref(data.structure, false)
    }
};
