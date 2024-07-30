/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Unit, ElementIndex } from '../../mol-model/structure';
import type { SizeTheme } from '../size';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { ThemeDataContext } from '../../mol-theme/theme';
export declare const PhysicalSizeThemeParams: {
    scale: PD.Numeric;
};
export type PhysicalSizeThemeParams = typeof PhysicalSizeThemeParams;
export declare function getPhysicalSizeThemeParams(ctx: ThemeDataContext): {
    scale: PD.Numeric;
};
export declare function getPhysicalRadius(unit: Unit, element: ElementIndex): number;
/**
 * Create attribute data with the physical size of an element,
 * i.e. vdw for atoms and radius for coarse spheres
 */
export declare function PhysicalSizeTheme(ctx: ThemeDataContext, props: PD.Values<PhysicalSizeThemeParams>): SizeTheme<PhysicalSizeThemeParams>;
export declare const PhysicalSizeThemeProvider: SizeTheme.Provider<PhysicalSizeThemeParams, 'physical'>;
