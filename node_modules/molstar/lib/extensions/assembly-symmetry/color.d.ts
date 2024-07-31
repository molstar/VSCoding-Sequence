/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ThemeDataContext } from '../../mol-theme/theme';
import { ColorTheme } from '../../mol-theme/color';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { AssemblySymmetryData } from './prop';
export declare const AssemblySymmetryClusterColorThemeParams: {
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
export type AssemblySymmetryClusterColorThemeParams = typeof AssemblySymmetryClusterColorThemeParams;
export declare function getAssemblySymmetryClusterColorThemeParams(ctx: ThemeDataContext): {
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
export declare function AssemblySymmetryClusterColorTheme(ctx: ThemeDataContext, props: PD.Values<AssemblySymmetryClusterColorThemeParams>): ColorTheme<AssemblySymmetryClusterColorThemeParams>;
export declare const AssemblySymmetryClusterColorThemeProvider: ColorTheme.Provider<AssemblySymmetryClusterColorThemeParams, AssemblySymmetryData.Tag.Cluster>;
