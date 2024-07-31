/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { StructureElement, Bond, Unit, Model } from '../../mol-model/structure';
import { SaccharideColors, MonosaccharidesColorTable } from '../../mol-model/structure/structure/carbohydrates/constants';
import { Color } from '../../mol-util/color';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { TableLegend } from '../../mol-util/legend';
import { ColorThemeCategory } from './categories';
const DefaultColor = Color(0xCCCCCC);
const Description = 'Assigns colors according to the Symbol Nomenclature for Glycans (SNFG).';
export const CarbohydrateSymbolColorThemeParams = {};
export function getCarbohydrateSymbolColorThemeParams(ctx) {
    return CarbohydrateSymbolColorThemeParams; // TODO return copy
}
export function CarbohydrateSymbolColorTheme(ctx, props) {
    let color;
    if (ctx.structure) {
        const { elements, getElementIndices } = ctx.structure.carbohydrates;
        const getColor = (unit, index) => {
            if (!Unit.isAtomic(unit))
                return DefaultColor;
            const carbs = getElementIndices(unit, index);
            return carbs.length > 0 ? elements[carbs[0]].component.color : DefaultColor;
        };
        color = (location, isSecondary) => {
            if (isSecondary) {
                return SaccharideColors.Secondary;
            }
            else {
                if (StructureElement.Location.is(location)) {
                    return getColor(location.unit, location.element);
                }
                else if (Bond.isLocation(location)) {
                    return getColor(location.aUnit, location.aUnit.elements[location.aIndex]);
                }
            }
            return DefaultColor;
        };
    }
    else {
        color = () => DefaultColor;
    }
    return {
        factory: CarbohydrateSymbolColorTheme,
        granularity: 'group',
        color: color,
        props: props,
        description: Description,
        legend: TableLegend(MonosaccharidesColorTable)
    };
}
export const CarbohydrateSymbolColorThemeProvider = {
    name: 'carbohydrate-symbol',
    label: 'Carbohydrate Symbol',
    category: ColorThemeCategory.Residue,
    factory: CarbohydrateSymbolColorTheme,
    getParams: getCarbohydrateSymbolColorThemeParams,
    defaultValues: PD.getDefaultValues(CarbohydrateSymbolColorThemeParams),
    isApplicable: (ctx) => {
        return !!ctx.structure && ctx.structure.models.some(m => Model.hasCarbohydrate(m));
    }
};
