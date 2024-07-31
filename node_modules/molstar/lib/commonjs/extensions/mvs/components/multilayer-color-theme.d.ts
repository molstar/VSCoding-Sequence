/**
 * Copyright (c) 2023-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { StructureElement } from '../../../mol-model/structure';
import { ColorTheme } from '../../../mol-theme/color';
import { ThemeDataContext } from '../../../mol-theme/theme';
import { Color } from '../../../mol-util/color';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
/** Special value that can be used as color with null-like semantic (i.e. "no color provided").
 * By some lucky coincidence, Mol* treats -1 as white. */
export declare const NoColor: Color;
/** Parameter definition for color theme "Multilayer" */
export declare function makeMultilayerColorThemeParams(colorThemeRegistry: ColorTheme.Registry, ctx: ThemeDataContext): {
    layers: PD.ObjectList<PD.Normalize<{
        theme: PD.NamedParams<any, string>;
        selection: PD.NamedParams<"all" | "polymer" | "water" | "branched" | "ligand" | "ion" | "lipid" | "protein" | "nucleic" | "coarse" | "non-standard", "static"> | PD.NamedParams<import("../../../mol-script/script").Script, "script"> | PD.NamedParams<import("../../../mol-script/language/expression").Expression, "expression"> | PD.NamedParams<StructureElement.Bundle, "bundle"> | PD.NamedParams<PD.Normalize<{
            annotationId: any;
            fieldName: any;
            fieldValues: any;
        }>, "annotation">;
    }>>;
    background: PD.Color;
};
/** Parameter definition for color theme "Multilayer" */
export type MultilayerColorThemeParams = ReturnType<typeof makeMultilayerColorThemeParams>;
/** Parameter values for color theme "Multilayer" */
export type MultilayerColorThemeProps = PD.Values<MultilayerColorThemeParams>;
/** Default values for `MultilayerColorThemeProps` */
export declare const DefaultMultilayerColorThemeProps: MultilayerColorThemeProps;
/** Unique name for "Multilayer" color theme */
export declare const MultilayerColorThemeName = "mvs-multilayer";
/** A thingy that is needed to register color theme "Multilayer" */
export declare function makeMultilayerColorThemeProvider(colorThemeRegistry: ColorTheme.Registry): ColorTheme.Provider<MultilayerColorThemeParams, typeof MultilayerColorThemeName>;
