/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Unit, ElementIndex } from '../../mol-model/structure';
import type { ColorTheme } from '../color';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { ThemeDataContext } from '../theme';
export declare const UncertaintyColorThemeParams: {
    domain: PD.Interval;
    list: PD.ColorList;
};
export type UncertaintyColorThemeParams = typeof UncertaintyColorThemeParams;
export declare function getUncertaintyColorThemeParams(ctx: ThemeDataContext): {
    domain: PD.Interval;
    list: PD.ColorList;
};
export declare function getUncertainty(unit: Unit, element: ElementIndex): number;
export declare function UncertaintyColorTheme(ctx: ThemeDataContext, props: PD.Values<UncertaintyColorThemeParams>): ColorTheme<UncertaintyColorThemeParams>;
export declare const UncertaintyColorThemeProvider: ColorTheme.Provider<UncertaintyColorThemeParams, 'uncertainty'>;
