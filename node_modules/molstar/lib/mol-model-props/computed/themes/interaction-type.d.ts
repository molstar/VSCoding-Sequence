/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { ThemeDataContext } from '../../../mol-theme/theme';
import { ColorTheme } from '../../../mol-theme/color';
export declare const InteractionTypeColorThemeParams: {};
export type InteractionTypeColorThemeParams = typeof InteractionTypeColorThemeParams;
export declare function getInteractionTypeColorThemeParams(ctx: ThemeDataContext): {};
export declare function InteractionTypeColorTheme(ctx: ThemeDataContext, props: PD.Values<InteractionTypeColorThemeParams>): ColorTheme<InteractionTypeColorThemeParams>;
export declare const InteractionTypeColorThemeProvider: ColorTheme.Provider<InteractionTypeColorThemeParams, 'interaction-type'>;
