/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { ThemeDataContext } from '../../../mol-theme/theme';
import { ColorTheme } from '../../../mol-theme/color';
export declare const CrossLinkColorThemeParams: {
    domain: PD.Interval;
    list: PD.ColorList;
};
export type CrossLinkColorThemeParams = typeof CrossLinkColorThemeParams;
export declare function getCrossLinkColorThemeParams(ctx: ThemeDataContext): {
    domain: PD.Interval;
    list: PD.ColorList;
};
export declare function CrossLinkColorTheme(ctx: ThemeDataContext, props: PD.Values<CrossLinkColorThemeParams>): ColorTheme<CrossLinkColorThemeParams>;
export declare const CrossLinkColorThemeProvider: ColorTheme.Provider<CrossLinkColorThemeParams, 'cross-link'>;
