/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Adam Midlik <midlik@gmail.com>
 */
import { Jsonable } from './json';
import { NumberArray } from './type-helpers';
/** Get the maximum value in an array */
export declare function arrayMax(array: ArrayLike<number>): number;
/** Get the minimum value in an array */
export declare function arrayMin(array: ArrayLike<number>): number;
/** Get the minimum & maximum value in an array */
export declare function arrayMinMax(array: ArrayLike<number>): number[];
/** Get the sum of values in an array */
export declare function arraySum(array: ArrayLike<number>, stride?: number, offset?: number): number;
/** Get the mean of values in an array */
export declare function arrayMean(array: ArrayLike<number>, stride?: number, offset?: number): number;
/** Get the root mean square of values in an array */
export declare function arrayRms(array: ArrayLike<number>): number;
/** Fill an array with serial numbers starting from 0 until n - 1 (defaults to array.length) */
export declare function fillSerial<T extends NumberArray>(array: T, n?: number): T;
export declare function arrayRemoveInPlace<T>(xs: T[], x: T): boolean;
export declare function arrayRemoveAtInPlace<T>(xs: T[], idx: number): void;
export declare function arraySetAdd<T>(xs: T[], x: T): boolean;
export declare function arraySetRemove<T>(xs: T[], x: T): boolean;
/**
 * Caution, O(n^2) complexity. Only use for small input sizes.
 * For larger inputs consider using `SortedArray`.
 */
export declare function arrayAreIntersecting<T>(xs: T[], ys: T[]): boolean;
/**
 * Caution, O(n^2) complexity. Only use for small input sizes.
 * For larger inputs consider using `SortedArray`.
 */
export declare function arrayIntersectionSize<T>(xs: T[], ys: T[]): number;
export declare function arrayEqual<T>(xs?: ArrayLike<T>, ys?: ArrayLike<T>): boolean;
export declare function arrayIsIdentity(xs: ArrayLike<number>): boolean;
export declare function arrayMapUpsert<T>(xs: [string, T][], key: string, value: T): void;
/** Return an array containing integers from [start, end) if `end` is given,
 * or from [0, start) if `end` is omitted. */
export declare function range(start: number, end?: number): number[];
/** Copy all elements from `src` to the end of `dst`.
 * Equivalent to `dst.push(...src)`, but avoids storing element on call stack. Faster that `extend` from Underscore.js.
 * `extend(a, a)` will double the array.
 * Returns the modified `dst` array.
 */
export declare function arrayExtend<T>(dst: T[], src: ArrayLike<T>): T[];
/** Check whether `array` is sorted, sort if not. */
export declare function sortIfNeeded<T>(array: T[], compareFn: (a: T, b: T) => number): T[];
/** Decide whether `array` is sorted. */
export declare function arrayIsSorted<T>(array: T[], compareFn: (a: T, b: T) => number): boolean;
/** Remove all elements from the array which do not fulfil `predicate`. Return the modified array itself. */
export declare function filterInPlace<T>(array: T[], predicate: (x: T) => boolean): T[];
/** Return an array of all distinct values from `values`
 * (i.e. with removed duplicates).
 * Uses deep equality for objects and arrays,
 * independent from object key order and undefined properties.
 * E.g. {a: 1, b: undefined, c: {d: [], e: null}} is equal to {c: {e: null, d: []}}, a: 1}.
 * If two or more objects in `values` are equal, only the first of them will be in the result. */
export declare function arrayDistinct<T extends Jsonable>(values: T[]): T[];
