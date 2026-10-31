/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Color } from '../../mol-util/color';
import { StructureElement, Bond } from '../../mol-model/structure';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { getPaletteParams, getPalette } from '../../mol-util/color/palette';
import { ColorLists, getColorListFromName } from '../../mol-util/color/lists';
import { ColorThemeCategory } from './categories';
const DefaultList = 'dark-2';
const DefaultColor = Color(0xCCCCCC);
const Description = 'Gives every chain instance (single chain or collection of single elements) a unique color based on the position (index) of the chain in the list of chains in the structure.';
export const UnitIndexColorThemeParams = {
    ...getPaletteParams({ type: 'colors', colorList: DefaultList }),
};
export function getUnitIndexColorThemeParams(ctx) {
    const params = PD.clone(UnitIndexColorThemeParams);
    if (ctx.structure) {
        if (ctx.structure.root.units.length > ColorLists[DefaultList].list.length) {
            params.palette.defaultValue.name = 'colors';
            params.palette.defaultValue.params = {
                ...params.palette.defaultValue.params,
                list: { kind: 'interpolate', colors: getColorListFromName(DefaultList).list }
            };
        }
    }
    return params;
}
export function UnitIndexColorTheme(ctx, props) {
    let color;
    let legend;
    if (ctx.structure) {
        const { units } = ctx.structure.root;
        const palette = getPalette(units.length, props);
        legend = palette.legend;
        const unitIdColor = new Map();
        for (let i = 0, il = units.length; i < il; ++i) {
            unitIdColor.set(units[i].id, palette.color(i));
        }
        color = (location) => {
            if (StructureElement.Location.is(location)) {
                return unitIdColor.get(location.unit.id);
            }
            else if (Bond.isLocation(location)) {
                return unitIdColor.get(location.aUnit.id);
            }
            return DefaultColor;
        };
    }
    else {
        color = () => DefaultColor;
    }
    return {
        factory: UnitIndexColorTheme,
        granularity: 'instance',
        color,
        props,
        description: Description,
        legend
    };
}
export const UnitIndexColorThemeProvider = {
    name: 'unit-index',
    label: 'Chain Instance',
    category: ColorThemeCategory.Chain,
    factory: UnitIndexColorTheme,
    getParams: getUnitIndexColorThemeParams,
    defaultValues: PD.getDefaultValues(UnitIndexColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure
};
