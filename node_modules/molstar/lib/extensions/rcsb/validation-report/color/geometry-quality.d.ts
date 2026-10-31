/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ThemeDataContext } from '../../../../mol-theme/theme';
import { ColorTheme } from '../../../../mol-theme/color';
import { ParamDefinition as PD } from '../../../../mol-util/param-definition';
import { ValidationReport } from '../prop';
export declare function getGeometricQualityColorThemeParams(ctx: ThemeDataContext): {
    ignore: PD.MultiSelect<string>;
};
export type GeometricQualityColorThemeParams = ReturnType<typeof getGeometricQualityColorThemeParams>;
export declare function GeometryQualityColorTheme(ctx: ThemeDataContext, props: PD.Values<GeometricQualityColorThemeParams>): ColorTheme<GeometricQualityColorThemeParams>;
export declare const GeometryQualityColorThemeProvider: ColorTheme.Provider<GeometricQualityColorThemeParams, ValidationReport.Tag.GeometryQuality>;
