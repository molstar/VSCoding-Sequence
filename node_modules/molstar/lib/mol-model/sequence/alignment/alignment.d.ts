/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { SubstitutionMatrix } from './substitution-matrix';
declare const DefaultAlignmentOptions: {
    gapPenalty: number;
    gapExtensionPenalty: number;
    substMatrix: SubstitutionMatrix | "default";
};
export type AlignmentOptions = typeof DefaultAlignmentOptions;
export declare function align(seqA: ArrayLike<string>, seqB: ArrayLike<string>, options?: Partial<AlignmentOptions>): {
    aliA: ArrayLike<string>;
    aliB: ArrayLike<string>;
    score: number;
};
export {};
