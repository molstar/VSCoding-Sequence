/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { ColorTheme } from '../../../mol-theme/color';
import { ThemeDataContext } from '../../../mol-theme/theme';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
export declare const SIFTSMappingColorThemeParams: {
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
            colors: import("../../../mol-util/color/color").ColorListEntry[];
        };
    }>, "colors">>;
};
export type SIFTSMappingColorThemeParams = typeof SIFTSMappingColorThemeParams;
export declare function getSIFTSMappingColorThemeParams(ctx: ThemeDataContext): {
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
            colors: import("../../../mol-util/color/color").ColorListEntry[];
        };
    }>, "colors">>;
};
export declare function SIFTSMappingColorTheme(ctx: ThemeDataContext, props: PD.Values<SIFTSMappingColorThemeParams>): ColorTheme<SIFTSMappingColorThemeParams>;
export declare const SIFTSMappingColorThemeProvider: ColorTheme.Provider<SIFTSMappingColorThemeParams, 'sifts-mapping'>;
