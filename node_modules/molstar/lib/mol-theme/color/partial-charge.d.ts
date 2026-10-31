/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import type { ColorTheme } from '../color';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { ThemeDataContext } from '../theme';
export declare const PartialChargeColorThemeParams: {
    domain: PD.Interval;
    list: PD.ColorList;
};
export type PartialChargeColorThemeParams = typeof PartialChargeColorThemeParams;
export declare function getPartialChargeColorThemeParams(ctx: ThemeDataContext): {
    domain: PD.Interval;
    list: PD.ColorList;
};
export declare function PartialChargeColorTheme(ctx: ThemeDataContext, props: PD.Values<PartialChargeColorThemeParams>): ColorTheme<PartialChargeColorThemeParams>;
export declare const PartialChargeColorThemeProvider: ColorTheme.Provider<PartialChargeColorThemeParams, 'partial-charge'>;
