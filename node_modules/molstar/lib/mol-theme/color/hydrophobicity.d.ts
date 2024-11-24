/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import type { ColorTheme } from '../color';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { ThemeDataContext } from '../theme';
export declare const HydrophobicityColorThemeParams: {
    list: PD.ColorList;
    scale: PD.Select<"DGwif" | "DGwoct" | "Oct-IF">;
};
export type HydrophobicityColorThemeParams = typeof HydrophobicityColorThemeParams;
export declare function getHydrophobicityColorThemeParams(ctx: ThemeDataContext): {
    list: PD.ColorList;
    scale: PD.Select<"DGwif" | "DGwoct" | "Oct-IF">;
};
export declare function hydrophobicity(compId: string, scaleIndex: number): number;
export declare function HydrophobicityColorTheme(ctx: ThemeDataContext, props: PD.Values<HydrophobicityColorThemeParams>): ColorTheme<HydrophobicityColorThemeParams>;
export declare const HydrophobicityColorThemeProvider: ColorTheme.Provider<HydrophobicityColorThemeParams, 'hydrophobicity'>;
