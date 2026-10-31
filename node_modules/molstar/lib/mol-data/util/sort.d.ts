/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
export type Comparer<T = any> = (data: T, i: number, j: number) => number;
export type Swapper<T = any> = (data: T, i: number, j: number) => void;
export declare function arrayLess(arr: ArrayLike<number>, i: number, j: number): number;
export declare function arraySwap(arr: ArrayLike<any>, i: number, j: number): void;
export declare function sortArray(data: ArrayLike<number>, cmp?: Comparer<ArrayLike<number>>): ArrayLike<number>;
export declare function sortArrayRange(data: ArrayLike<number>, start: number, end: number, cmp?: Comparer<ArrayLike<number>>): ArrayLike<number>;
export declare function sort<T>(data: T, start: number, end: number, cmp: Comparer<T>, swap: Swapper<T>): T;
