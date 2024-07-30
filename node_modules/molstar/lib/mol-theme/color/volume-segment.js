/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Color } from '../../mol-util/color';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { getPaletteParams, getPalette } from '../../mol-util/color/palette';
import { Volume } from '../../mol-model/volume/volume';
import { ColorThemeCategory } from './categories';
const DefaultColor = Color(0xCCCCCC);
const Description = 'Gives every volume segment a unique color.';
export const VolumeSegmentColorThemeParams = {
    ...getPaletteParams({ type: 'colors', colorList: 'many-distinct' }),
};
export function getVolumeSegmentColorThemeParams(ctx) {
    return PD.clone(VolumeSegmentColorThemeParams);
}
export function VolumeSegmentColorTheme(ctx, props) {
    let color;
    let legend;
    const segmentation = ctx.volume && Volume.Segmentation.get(ctx.volume);
    if (segmentation) {
        const size = segmentation.segments.size;
        const segments = Array.from(segmentation.segments.keys());
        const palette = getPalette(size, props);
        legend = palette.legend;
        color = (location) => {
            if (Volume.Segment.isLocation(location)) {
                return palette.color(segments.indexOf(location.segment));
            }
            return DefaultColor;
        };
    }
    else {
        color = () => DefaultColor;
    }
    return {
        factory: VolumeSegmentColorTheme,
        granularity: 'instance',
        color,
        props,
        description: Description,
        legend
    };
}
export const VolumeSegmentColorThemeProvider = {
    name: 'volume-segment',
    label: 'Volume Segment',
    category: ColorThemeCategory.Misc,
    factory: VolumeSegmentColorTheme,
    getParams: getVolumeSegmentColorThemeParams,
    defaultValues: PD.getDefaultValues(VolumeSegmentColorThemeParams),
    isApplicable: (ctx) => !!ctx.volume && !!Volume.Segmentation.get(ctx.volume)
};
