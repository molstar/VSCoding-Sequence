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
const Description = 'Gives every polymer chain instance a unique color based on the position (index) of the polymer in the list of polymers in the structure.';
export const PolymerIndexColorThemeParams = {
    ...getPaletteParams({ type: 'colors', colorList: DefaultList }),
};
export function getPolymerIndexColorThemeParams(ctx) {
    const params = PD.clone(PolymerIndexColorThemeParams);
    if (ctx.structure) {
        if (getPolymerChainCount(ctx.structure.root) > ColorLists[DefaultList].list.length) {
            params.palette.defaultValue.name = 'colors';
            params.palette.defaultValue.params = {
                ...params.palette.defaultValue.params,
                list: { kind: 'interpolate', colors: getColorListFromName(DefaultList).list }
            };
        }
    }
    return params;
}
function getPolymerChainCount(structure) {
    let polymerChainCount = 0;
    const { units } = structure;
    for (let i = 0, il = units.length; i < il; ++i) {
        if (units[i].polymerElements.length > 0)
            ++polymerChainCount;
    }
    return polymerChainCount;
}
export function PolymerIndexColorTheme(ctx, props) {
    let color;
    let legend;
    if (ctx.structure) {
        const palette = getPalette(getPolymerChainCount(ctx.structure.root), props);
        legend = palette.legend;
        const { units } = ctx.structure.root;
        const unitIdColor = new Map();
        for (let i = 0, j = 0, il = units.length; i < il; ++i) {
            if (units[i].polymerElements.length > 0) {
                unitIdColor.set(units[i].id, palette.color(j));
                ++j;
            }
        }
        color = (location) => {
            let color;
            if (StructureElement.Location.is(location)) {
                color = unitIdColor.get(location.unit.id);
            }
            else if (Bond.isLocation(location)) {
                color = unitIdColor.get(location.aUnit.id);
            }
            return color !== undefined ? color : DefaultColor;
        };
    }
    else {
        color = () => DefaultColor;
    }
    return {
        factory: PolymerIndexColorTheme,
        granularity: 'instance',
        color,
        props,
        description: Description,
        legend
    };
}
export const PolymerIndexColorThemeProvider = {
    name: 'polymer-index',
    label: 'Polymer Chain Instance',
    category: ColorThemeCategory.Chain,
    factory: PolymerIndexColorTheme,
    getParams: getPolymerIndexColorThemeParams,
    defaultValues: PD.getDefaultValues(PolymerIndexColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure
};
