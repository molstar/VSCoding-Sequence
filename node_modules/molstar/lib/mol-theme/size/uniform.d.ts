/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import type { SizeTheme } from '../size';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { ThemeDataContext } from '../../mol-theme/theme';
export declare const UniformSizeThemeParams: {
    value: PD.Numeric;
};
export type UniformSizeThemeParams = typeof UniformSizeThemeParams;
export declare function getUniformSizeThemeParams(ctx: ThemeDataContext): {
    value: PD.Numeric;
};
export declare function UniformSizeTheme(ctx: ThemeDataContext, props: PD.Values<UniformSizeThemeParams>): SizeTheme<UniformSizeThemeParams>;
export declare const UniformSizeThemeProvider: SizeTheme.Provider<UniformSizeThemeParams, 'uniform'>;
