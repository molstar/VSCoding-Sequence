/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import type { ColorTheme } from '../color';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { ThemeDataContext } from '../theme';
export declare const UniformColorThemeParams: {
    value: PD.Color;
    saturation: PD.Numeric;
    lightness: PD.Numeric;
};
export type UniformColorThemeParams = typeof UniformColorThemeParams;
export declare function getUniformColorThemeParams(ctx: ThemeDataContext): {
    value: PD.Color;
    saturation: PD.Numeric;
    lightness: PD.Numeric;
};
export declare function UniformColorTheme(ctx: ThemeDataContext, props: PD.Values<UniformColorThemeParams>): ColorTheme<UniformColorThemeParams>;
export declare const UniformColorThemeProvider: ColorTheme.Provider<UniformColorThemeParams, 'uniform'>;
