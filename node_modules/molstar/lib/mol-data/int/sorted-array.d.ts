/**
 * Copyright (c) 2017-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Interval } from './interval';
declare namespace SortedArray {
    const Empty: SortedArray;
    const ofUnsortedArray: <T extends number = number>(xs: ArrayLike<number>) => SortedArray<T>;
    const ofSingleton: <T extends number = number>(v: number) => SortedArray<T>;
    const ofSortedArray: <T extends number = number>(xs: ArrayLike<number>) => SortedArray<T>;
    /** create sorted array [min, max] (it DOES contain the max value) */
    const ofRange: <T extends number = number>(min: T, max: T) => SortedArray<T>;
    /** create sorted array [min, max) (it does NOT contain the max value) */
    const ofBounds: <T extends number = number>(min: T, max: T) => SortedArray<T>;
    const is: <T extends number = number>(v: any) => v is SortedArray<T>;
    const isRange: <T extends number = number>(array: ArrayLike<number>) => boolean;
    const has: <T extends number = number>(array: SortedArray<T>, x: T) => boolean;
    /** Returns the index of `x` in `set` or -1 if not found. */
    const indexOf: <T extends number = number>(array: SortedArray<T>, x: T) => number;
    const indexOfInInterval: <T extends number = number>(array: SortedArray<T>, x: number, bounds: Interval) => number;
    const indexOfInRange: <T extends number = number>(array: SortedArray<T>, x: number, start: number, end: number) => number;
    /** Returns `array[0]` */
    const start: <T extends number = number>(array: SortedArray<T>) => T;
    /** Returns `array[array.length - 1] + 1` */
    const end: <T extends number = number>(array: SortedArray<T>) => T;
    const min: <T extends number = number>(array: SortedArray<T>) => T;
    const max: <T extends number = number>(array: SortedArray<T>) => T;
    const size: <T extends number = number>(array: SortedArray<T>) => number;
    const hashCode: <T extends number = number>(array: SortedArray<T>) => number;
    const toString: <T extends number = number>(array: SortedArray<T>) => string;
    const areEqual: <T extends number = number>(a: SortedArray<T>, b: SortedArray<T>) => boolean;
    const areIntersecting: <T extends number = number>(a: SortedArray<T>, b: SortedArray<T>) => boolean;
    const isSubset: <T extends number = number>(a: SortedArray<T>, b: SortedArray<T>) => boolean;
    const union: <T extends number = number>(a: SortedArray<T>, b: SortedArray<T>) => SortedArray<T>;
    const intersect: <T extends number = number>(a: SortedArray<T>, b: SortedArray<T>) => SortedArray<T>;
    const subtract: <T extends number = number>(a: SortedArray<T>, b: SortedArray<T>) => SortedArray<T>;
    const findPredecessorIndex: <T extends number = number>(array: SortedArray<T>, x: T) => number;
    const findPredecessorIndexInInterval: <T extends number = number>(array: SortedArray<T>, x: T, bounds: Interval) => number;
    const findRange: <T extends number = number>(array: SortedArray<T>, min: T, max: T) => Interval;
    const intersectionSize: <T extends number = number>(a: SortedArray<T>, b: SortedArray<T>) => number;
    const deduplicate: <T extends number = number>(array: SortedArray<T>) => SortedArray<T>;
    /** Returns indices of xs in the array. E.g. indicesOf([10, 11, 12], [10, 12]) ==> [0, 2] */
    const indicesOf: <T extends number = number, I extends number = number>(array: SortedArray<T>, xs: SortedArray<T>) => SortedArray<I>;
}
interface SortedArray<T extends number = number> extends ArrayLike<T> {
    '@type': 'int-sorted-array';
}
export { SortedArray };
