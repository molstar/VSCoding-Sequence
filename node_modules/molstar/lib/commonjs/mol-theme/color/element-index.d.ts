/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import type { ColorTheme } from '../color';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { ThemeDataContext } from '../../mol-theme/theme';
export declare const ElementIndexColorThemeParams: {
    palette: PD.Mapped<PD.NamedParams<PD.Normalize<{
        maxCount: number;
        hue: [number, number];
        chroma: [number, number];
        luminance: [number, number];
        sort: "none" | "contrast";
        clusteringStepCount: number;
        minSampleCount: number;
        sampleCountFactor: number;
    }>, "generate"> | PD.NamedParams<PD.Normalize<{
        list: {
            kind: "interpolate" | "set";
            colors: import("../../mol-util/color/color").ColorListEntry[];
        };
    }>, "colors">>;
};
export type ElementIndexColorThemeParams = typeof ElementIndexColorThemeParams;
export declare function getElementIndexColorThemeParams(ctx: ThemeDataContext): {
    palette: PD.Mapped<PD.NamedParams<PD.Normalize<{
        maxCount: number;
        hue: [number, number];
        chroma: [number, number];
        luminance: [number, number];
        sort: "none" | "contrast";
        clusteringStepCount: number;
        minSampleCount: number;
        sampleCountFactor: number;
    }>, "generate"> | PD.NamedParams<PD.Normalize<{
        list: {
            kind: "interpolate" | "set";
            colors: import("../../mol-util/color/color").ColorListEntry[];
        };
    }>, "colors">>;
};
export declare function ElementIndexColorTheme(ctx: ThemeDataContext, props: PD.Values<ElementIndexColorThemeParams>): ColorTheme<ElementIndexColorThemeParams>;
export declare const ElementIndexColorThemeProvider: ColorTheme.Provider<ElementIndexColorThemeParams, 'element-index'>;
