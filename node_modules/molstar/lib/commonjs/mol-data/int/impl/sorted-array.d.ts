/**
 * Copyright (c) 2017-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Interval } from '../interval';
type Nums = ArrayLike<number>;
export declare const Empty: Nums;
export declare function ofSingleton(v: number): number[];
export declare function ofSortedArray(xs: Nums): Nums;
export declare function ofUnsortedArray(xs: Nums): Nums;
export declare function ofRange(min: number, max: number): never[] | Int32Array;
export declare function is(xs: any): xs is Nums;
export declare function isRange(xs: Nums): boolean;
export declare function start(xs: Nums): number;
export declare function end(xs: Nums): number;
export declare function min(xs: Nums): number;
export declare function max(xs: Nums): number;
export declare function size(xs: Nums): number;
export declare function hashCode(xs: Nums): number;
export declare function toString(xs: Nums): string;
/** Returns the index of `x` in `set` or -1 if not found. */
export declare function indexOf(xs: Nums, v: number): number;
export declare function indexOfInInterval(xs: Nums, v: number, bounds: Interval): number;
export declare function indexOfInRange(xs: Nums, v: number, s: number, e: number): number;
export declare function has(xs: Nums, v: number): boolean;
export declare function getAt(xs: Nums, i: number): number;
export declare function areEqual(a: Nums, b: Nums): boolean;
/**
 * Returns 0 if `v` is smaller or equal the first element of `xs`
 * Returns length of `xs` if `v` is bigger than the last element of `xs`
 * Otherwise returns the first index where the value of `xs` is equal or bigger than `v`
 */
export declare function findPredecessorIndex(xs: Nums, v: number): number;
export declare function findPredecessorIndexInInterval(xs: Nums, v: number, bounds: Interval): number;
export declare function findRange(xs: Nums, min: number, max: number): Interval<number>;
export declare function areIntersecting(a: Nums, b: Nums): boolean;
export declare function isSubset(a: Nums, b: Nums): boolean;
export declare function union(a: Nums, b: Nums): Nums;
export declare function intersectionSize(a: Nums, b: Nums): number;
export declare function intersect(a: Nums, b: Nums): Nums;
export declare function subtract(a: Nums, b: Nums): Nums;
export declare function deduplicate(xs: Nums): Nums;
export declare function indicesOf(a: Nums, b: Nums): Nums;
export {};
