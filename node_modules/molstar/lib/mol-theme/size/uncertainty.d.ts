/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Unit, ElementIndex } from '../../mol-model/structure';
import type { SizeTheme } from '../size';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { ThemeDataContext } from '../../mol-theme/theme';
export declare const UncertaintySizeThemeParams: {
    bfactorFactor: PD.Numeric;
    rmsfFactor: PD.Numeric;
    baseSize: PD.Numeric;
};
export type UncertaintySizeThemeParams = typeof UncertaintySizeThemeParams;
export declare function getUncertaintySizeThemeParams(ctx: ThemeDataContext): {
    bfactorFactor: PD.Numeric;
    rmsfFactor: PD.Numeric;
    baseSize: PD.Numeric;
};
export declare function getUncertainty(unit: Unit, element: ElementIndex, props: PD.Values<UncertaintySizeThemeParams>): number;
export declare function UncertaintySizeTheme(ctx: ThemeDataContext, props: PD.Values<UncertaintySizeThemeParams>): SizeTheme<UncertaintySizeThemeParams>;
export declare const UncertaintySizeThemeProvider: SizeTheme.Provider<UncertaintySizeThemeParams, 'uncertainty'>;
