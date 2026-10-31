/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Color } from '../../mol-util/color';
import { StructureElement, Bond } from '../../mol-model/structure';
import { OrderedSet } from '../../mol-data/int';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { getPaletteParams, getPalette } from '../../mol-util/color/palette';
import { ColorThemeCategory } from './categories';
const DefaultColor = Color(0xCCCCCC);
const Description = 'Gives every element (atom or coarse sphere/gaussian) a unique color based on the position (index) of the element in the list of elements in the structure.';
export const ElementIndexColorThemeParams = {
    ...getPaletteParams({ type: 'colors', colorList: 'red-yellow-blue' }),
};
export function getElementIndexColorThemeParams(ctx) {
    return ElementIndexColorThemeParams; // TODO return copy
}
export function ElementIndexColorTheme(ctx, props) {
    let color;
    let legend;
    if (ctx.structure) {
        const { units } = ctx.structure.root;
        const unitCount = units.length;
        const cummulativeElementCount = new Map();
        const unitIdIndex = new Map();
        let elementCount = 0;
        for (let i = 0; i < unitCount; ++i) {
            cummulativeElementCount.set(i, elementCount);
            elementCount += units[i].elements.length;
            unitIdIndex.set(units[i].id, i);
        }
        const palette = getPalette(elementCount, props);
        legend = palette.legend;
        color = (location) => {
            if (StructureElement.Location.is(location)) {
                const unitIndex = unitIdIndex.get(location.unit.id);
                const unitElementIndex = OrderedSet.findPredecessorIndex(units[unitIndex].elements, location.element);
                return palette.color(cummulativeElementCount.get(unitIndex) + unitElementIndex);
            }
            else if (Bond.isLocation(location)) {
                const unitIndex = unitIdIndex.get(location.aUnit.id);
                const unitElementIndex = OrderedSet.findPredecessorIndex(units[unitIndex].elements, location.aUnit.elements[location.aIndex]);
                return palette.color(cummulativeElementCount.get(unitIndex) + unitElementIndex);
            }
            return DefaultColor;
        };
    }
    else {
        color = () => DefaultColor;
    }
    return {
        factory: ElementIndexColorTheme,
        granularity: 'groupInstance',
        preferSmoothing: true,
        color,
        props,
        description: Description,
        legend
    };
}
export const ElementIndexColorThemeProvider = {
    name: 'element-index',
    label: 'Element Index',
    category: ColorThemeCategory.Atom,
    factory: ElementIndexColorTheme,
    getParams: getElementIndexColorThemeParams,
    defaultValues: PD.getDefaultValues(ElementIndexColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure
};
