/**
 * Copyright (c) 2021-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ColorScale } from '../../mol-util/color';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { ColorNames } from '../../mol-util/color/names';
import { Volume } from '../../mol-model/volume/volume';
import { ColorThemeCategory } from './categories';
const Description = 'Assign color based on the given value of a volume cell.';
export const VolumeValueColorThemeParams = {
    colorList: PD.ColorList({
        kind: 'interpolate',
        colors: [
            [ColorNames.white, 0],
            [ColorNames.red, 0.25],
            [ColorNames.white, 0.5],
            [ColorNames.blue, 0.75],
            [ColorNames.white, 1]
        ]
    }, { offsets: true, isEssential: true }),
};
export function getVolumeValueColorThemeParams(ctx) {
    return VolumeValueColorThemeParams; // TODO return copy
}
export function VolumeValueColorTheme(ctx, props) {
    const scale = ColorScale.create({ domain: [0, 1], listOrName: props.colorList.colors });
    const colors = [];
    for (let i = 0; i < 256; ++i) {
        colors[i] = scale.color(i / 255);
    }
    const palette = { colors, filter: 'linear' };
    return {
        factory: VolumeValueColorTheme,
        granularity: 'direct',
        props: props,
        description: Description,
        legend: scale.legend,
        palette,
    };
}
export const VolumeValueColorThemeProvider = {
    name: 'volume-value',
    label: 'Volume Value',
    category: ColorThemeCategory.Misc,
    factory: VolumeValueColorTheme,
    getParams: getVolumeValueColorThemeParams,
    defaultValues: PD.getDefaultValues(VolumeValueColorThemeParams),
    isApplicable: (ctx) => !!ctx.volume && !Volume.Segmentation.get(ctx.volume),
};
