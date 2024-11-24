/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * from https://github.com/dsehnal/CIFTools.js
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { ArrayCtor } from '../../mol-util/type-helpers';
export declare function arrayFind<T>(array: ArrayLike<T>, f: (v: T) => boolean): T | undefined;
export declare function iterableToArray<T>(it: IterableIterator<T>): T[];
/** Fills the array so that array[0] = start and array[array.length - 1] = end */
export declare function createRangeArray(start: number, end: number, ctor?: ArrayCtor<number>): Int32Array | {
    [i: number]: number;
    length: number;
};
export declare function arrayPickIndices<T>(array: ArrayLike<T>, indices: ArrayLike<number>): {
    [i: number]: T;
    length: number;
};
export declare function arrayGetCtor<T>(data: ArrayLike<T>): ArrayCtor<T>;
