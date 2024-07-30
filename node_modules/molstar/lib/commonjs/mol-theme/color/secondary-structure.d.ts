/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Color, ColorMap } from '../../mol-util/color';
import { Unit, ElementIndex } from '../../mol-model/structure';
import type { ColorTheme } from '../color';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { ThemeDataContext } from '../theme';
import { SecondaryStructureValue } from '../../mol-model-props/computed/secondary-structure';
declare const SecondaryStructureColors: ColorMap<{
    alphaHelix: number;
    threeTenHelix: number;
    piHelix: number;
    betaTurn: number;
    betaStrand: number;
    coil: number;
    bend: number;
    turn: number;
    dna: number;
    rna: number;
    carbohydrate: number;
}>;
export type SecondaryStructureColors = typeof SecondaryStructureColors;
export declare const SecondaryStructureColorThemeParams: {
    saturation: PD.Numeric;
    lightness: PD.Numeric;
    colors: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "default"> | PD.NamedParams<PD.Normalize<{
        alphaHelix: Color;
        threeTenHelix: Color;
        piHelix: Color;
        betaTurn: Color;
        betaStrand: Color;
        coil: Color;
        bend: Color;
        turn: Color;
        dna: Color;
        rna: Color;
        carbohydrate: Color;
    }>, "custom">>;
};
export type SecondaryStructureColorThemeParams = typeof SecondaryStructureColorThemeParams;
export declare function getSecondaryStructureColorThemeParams(ctx: ThemeDataContext): {
    saturation: PD.Numeric;
    lightness: PD.Numeric;
    colors: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "default"> | PD.NamedParams<PD.Normalize<{
        alphaHelix: Color;
        threeTenHelix: Color;
        piHelix: Color;
        betaTurn: Color;
        betaStrand: Color;
        coil: Color;
        bend: Color;
        turn: Color;
        dna: Color;
        rna: Color;
        carbohydrate: Color;
    }>, "custom">>;
};
export declare function secondaryStructureColor(colorMap: SecondaryStructureColors, unit: Unit, element: ElementIndex, computedSecondaryStructure?: SecondaryStructureValue): Color;
export declare function SecondaryStructureColorTheme(ctx: ThemeDataContext, props: PD.Values<SecondaryStructureColorThemeParams>): ColorTheme<SecondaryStructureColorThemeParams>;
export declare const SecondaryStructureColorThemeProvider: ColorTheme.Provider<SecondaryStructureColorThemeParams, 'secondary-structure'>;
export {};
