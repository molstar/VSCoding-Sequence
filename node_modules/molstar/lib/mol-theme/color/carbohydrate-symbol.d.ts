/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import type { ColorTheme } from '../color';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { ThemeDataContext } from '../theme';
export declare const CarbohydrateSymbolColorThemeParams: {};
export type CarbohydrateSymbolColorThemeParams = typeof CarbohydrateSymbolColorThemeParams;
export declare function getCarbohydrateSymbolColorThemeParams(ctx: ThemeDataContext): {};
export declare function CarbohydrateSymbolColorTheme(ctx: ThemeDataContext, props: PD.Values<CarbohydrateSymbolColorThemeParams>): ColorTheme<CarbohydrateSymbolColorThemeParams>;
export declare const CarbohydrateSymbolColorThemeProvider: ColorTheme.Provider<CarbohydrateSymbolColorThemeParams, 'carbohydrate-symbol'>;
