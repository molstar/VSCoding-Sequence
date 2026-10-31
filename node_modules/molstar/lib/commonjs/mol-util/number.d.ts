/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
/**
 * Determine the number of digits in a floating point number
 * Find a number M such that round(M * v) - M * v <= delta.
 * If no such M exists, return -1.
 */
export declare function getMantissaMultiplier(v: number, maxDigits: number, delta: number): number;
export declare function integerDigitCount(v: number, delta: number): number;
/**
 * Determine the maximum number of digits in a floating point array.
 * Find a number M such that round(M * v) - M * v <= delta.
 * If no such M exists, return -1.
 */
export declare function getArrayDigitCount(xs: ArrayLike<number>, maxDigits: number, delta: number): {
    mantissaDigits: number;
    integerDigits: number;
};
export declare function isInteger(s: string): boolean;
export declare function getPrecision(v: number): number;
export declare function toPrecision(v: number, precision: number): number;
export declare function toFixed(v: number, fractionDigits: number): number;
