/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { ColorTheme } from '../../../mol-theme/color';
import { ThemeDataContext } from '../../../mol-theme/theme';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
export declare const StructureQualityReportColorThemeParams: {
    type: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "issue-count"> | PD.NamedParams<PD.Normalize<{
        kind: string;
    }>, "specific-issue">>;
};
type Params = typeof StructureQualityReportColorThemeParams;
export declare function StructureQualityReportColorTheme(ctx: ThemeDataContext, props: PD.Values<Params>): ColorTheme<Params>;
export declare const StructureQualityReportColorThemeProvider: ColorTheme.Provider<Params, 'pdbe-structure-quality-report'>;
export {};
