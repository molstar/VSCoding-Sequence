/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { ThemeDataContext } from '../../mol-theme/theme';
import type { SizeTheme } from '../../mol-theme/size';
export declare const ShapeGroupSizeThemeParams: {};
export type ShapeGroupSizeThemeParams = typeof ShapeGroupSizeThemeParams;
export declare function getShapeGroupSizeThemeParams(ctx: ThemeDataContext): {};
export declare function ShapeGroupSizeTheme(ctx: ThemeDataContext, props: PD.Values<ShapeGroupSizeThemeParams>): SizeTheme<ShapeGroupSizeThemeParams>;
export declare const ShapeGroupSizeThemeProvider: SizeTheme.Provider<ShapeGroupSizeThemeParams, 'shape-group'>;
