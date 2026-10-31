/**
 * Copyright (c) 2022-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Jason Pattle <jpattle@exscientia.co.uk>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Color } from '../../mol-util/color';
import { StructureElement, Bond, Model } from '../../mol-model/structure';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { getPaletteParams, getPalette } from '../../mol-util/color/palette';
import { ColorThemeCategory } from './categories';
const DefaultColor = Color(0xCCCCCC);
const Description = 'Gives every model a unique color based on its index.';
export const ModelIndexColorThemeParams = {
    ...getPaletteParams({ type: 'colors', colorList: 'many-distinct' }),
};
export function getModelIndexColorThemeParams(ctx) {
    return PD.clone(ModelIndexColorThemeParams);
}
export function ModelIndexColorTheme(ctx, props) {
    var _a;
    let color;
    let legend;
    let contextHash = -1;
    if (ctx.structure) {
        // max-index is the same for all models
        const size = ((_a = Model.MaxIndex.get(ctx.structure.models[0]).value) !== null && _a !== void 0 ? _a : -1) + 1;
        contextHash = size;
        const palette = getPalette(size, props);
        legend = palette.legend;
        color = (location) => {
            if (StructureElement.Location.is(location)) {
                return palette.color(Model.Index.get(location.unit.model).value || 0);
            }
            else if (Bond.isLocation(location)) {
                return palette.color(Model.Index.get(location.aUnit.model).value || 0);
            }
            return DefaultColor;
        };
    }
    else {
        color = () => DefaultColor;
    }
    return {
        factory: ModelIndexColorTheme,
        granularity: 'instance',
        color,
        props,
        contextHash,
        description: Description,
        legend
    };
}
export const ModelIndexColorThemeProvider = {
    name: 'model-index',
    label: 'Model Index',
    category: ColorThemeCategory.Chain,
    factory: ModelIndexColorTheme,
    getParams: getModelIndexColorThemeParams,
    defaultValues: PD.getDefaultValues(ModelIndexColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure && ctx.structure.elementCount > 0
};
