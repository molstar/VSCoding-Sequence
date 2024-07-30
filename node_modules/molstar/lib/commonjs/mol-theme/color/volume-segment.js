"use strict";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolumeSegmentColorThemeProvider = exports.VolumeSegmentColorThemeParams = void 0;
exports.getVolumeSegmentColorThemeParams = getVolumeSegmentColorThemeParams;
exports.VolumeSegmentColorTheme = VolumeSegmentColorTheme;
const color_1 = require("../../mol-util/color");
const param_definition_1 = require("../../mol-util/param-definition");
const palette_1 = require("../../mol-util/color/palette");
const volume_1 = require("../../mol-model/volume/volume");
const categories_1 = require("./categories");
const DefaultColor = (0, color_1.Color)(0xCCCCCC);
const Description = 'Gives every volume segment a unique color.';
exports.VolumeSegmentColorThemeParams = {
    ...(0, palette_1.getPaletteParams)({ type: 'colors', colorList: 'many-distinct' }),
};
function getVolumeSegmentColorThemeParams(ctx) {
    return param_definition_1.ParamDefinition.clone(exports.VolumeSegmentColorThemeParams);
}
function VolumeSegmentColorTheme(ctx, props) {
    let color;
    let legend;
    const segmentation = ctx.volume && volume_1.Volume.Segmentation.get(ctx.volume);
    if (segmentation) {
        const size = segmentation.segments.size;
        const segments = Array.from(segmentation.segments.keys());
        const palette = (0, palette_1.getPalette)(size, props);
        legend = palette.legend;
        color = (location) => {
            if (volume_1.Volume.Segment.isLocation(location)) {
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
exports.VolumeSegmentColorThemeProvider = {
    name: 'volume-segment',
    label: 'Volume Segment',
    category: categories_1.ColorThemeCategory.Misc,
    factory: VolumeSegmentColorTheme,
    getParams: getVolumeSegmentColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.VolumeSegmentColorThemeParams),
    isApplicable: (ctx) => !!ctx.volume && !!volume_1.Volume.Segmentation.get(ctx.volume)
};
