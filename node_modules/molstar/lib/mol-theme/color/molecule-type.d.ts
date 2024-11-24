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
export declare const MoleculeTypeColors: ColorMap<{
    water: number;
    ion: number;
    protein: number;
    RNA: number;
    DNA: number;
    PNA: number;
    saccharide: number;
}>;
export type MoleculeTypeColors = typeof MoleculeTypeColors;
export declare const MoleculeTypeColorThemeParams: {
    saturation: PD.Numeric;
    lightness: PD.Numeric;
    colors: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "default"> | PD.NamedParams<PD.Normalize<{
        water: Color;
        ion: Color;
        protein: Color;
        RNA: Color;
        DNA: Color;
        PNA: Color;
        saccharide: Color;
    }>, "custom">>;
};
export type MoleculeTypeColorThemeParams = typeof MoleculeTypeColorThemeParams;
export declare function getMoleculeTypeColorThemeParams(ctx: ThemeDataContext): {
    saturation: PD.Numeric;
    lightness: PD.Numeric;
    colors: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "default"> | PD.NamedParams<PD.Normalize<{
        water: Color;
        ion: Color;
        protein: Color;
        RNA: Color;
        DNA: Color;
        PNA: Color;
        saccharide: Color;
    }>, "custom">>;
};
export declare function moleculeTypeColor(colorMap: MoleculeTypeColors, unit: Unit, element: ElementIndex): Color;
export declare function MoleculeTypeColorTheme(ctx: ThemeDataContext, props: PD.Values<MoleculeTypeColorThemeParams>): ColorTheme<MoleculeTypeColorThemeParams>;
export declare const MoleculeTypeColorThemeProvider: ColorTheme.Provider<MoleculeTypeColorThemeParams, 'molecule-type'>;
