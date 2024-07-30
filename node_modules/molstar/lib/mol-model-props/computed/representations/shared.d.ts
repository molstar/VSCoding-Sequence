/**
 * Copyright (c) 2022-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
export declare const InteractionsSharedParams: {
    sizeFactor: PD.Numeric;
    dashCount: PD.Numeric;
    dashScale: PD.Numeric;
    ignoreHydrogens: PD.BooleanParam;
    ignoreHydrogensVariant: PD.Select<"all" | "non-polar">;
    includeParent: PD.BooleanParam;
    parentDisplay: PD.Select<"stub" | "full" | "between">;
};
export type InteractionsSharedParams = typeof InteractionsSharedParams;
