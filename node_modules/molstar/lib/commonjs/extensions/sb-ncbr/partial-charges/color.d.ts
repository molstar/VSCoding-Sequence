import { ColorTheme } from '../../../mol-theme/color';
import { ThemeDataContext } from '../../../mol-theme/theme';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
export declare const PartialChargesThemeParams: {
    maxAbsoluteCharge: PD.Numeric;
    absolute: PD.BooleanParam;
    chargeType: PD.Select<string>;
};
export type PartialChargesThemeParams = typeof PartialChargesThemeParams;
export declare function getPartialChargesThemeParams(): {
    maxAbsoluteCharge: PD.Numeric;
    absolute: PD.BooleanParam;
    chargeType: PD.Select<string>;
};
export declare function PartialChargesColorTheme(ctx: ThemeDataContext, props: PD.Values<PartialChargesThemeParams>): ColorTheme<PartialChargesThemeParams>;
export declare const SbNcbrPartialChargesColorThemeProvider: ColorTheme.Provider<PartialChargesThemeParams, 'sb-ncbr-partial-charges'>;
