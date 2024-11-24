/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import type { ColorTheme } from '../color';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { ThemeDataContext } from '../theme';
export declare const OperatorHklColorThemeParams: {
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
export type OperatorHklColorThemeParams = typeof OperatorHklColorThemeParams;
export declare function getOperatorHklColorThemeParams(ctx: ThemeDataContext): {
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
export declare function OperatorHklColorTheme(ctx: ThemeDataContext, props: PD.Values<OperatorHklColorThemeParams>): ColorTheme<OperatorHklColorThemeParams>;
export declare const OperatorHklColorThemeProvider: ColorTheme.Provider<OperatorHklColorThemeParams, 'operator-hkl'>;
