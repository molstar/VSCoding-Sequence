/**
 * Copyright (c) 2017-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { SortedArray as S } from '../sorted-array';
import { Interval as I } from '../interval';
type OrderedSetImpl = I | S;
type Nums = ArrayLike<number>;
export declare const Empty: OrderedSetImpl;
export declare const ofSingleton: <T extends number = number>(value: T) => I<T>;
export declare const ofRange: <T extends number = number>(min: T, max: T) => I<T>;
export declare const ofBounds: <T extends number = number>(start: T, end: T) => I<T>;
export declare function ofSortedArray(xs: Nums): OrderedSetImpl;
export declare function size(set: OrderedSetImpl): number;
export declare function has(set: OrderedSetImpl, x: number): boolean;
/** Returns the index of `x` in `set` or -1 if not found. */
export declare function indexOf(set: OrderedSetImpl, x: number): number;
export declare function getAt(set: OrderedSetImpl, i: number): number;
export declare function min(set: OrderedSetImpl): number;
export declare function max(set: OrderedSetImpl): number;
export declare function start(set: OrderedSetImpl): number;
export declare function end(set: OrderedSetImpl): number;
export declare function hashCode(set: OrderedSetImpl): number;
export declare function toString(set: OrderedSetImpl): string;
export declare function areEqual(a: OrderedSetImpl, b: OrderedSetImpl): boolean;
export declare function areIntersecting(a: OrderedSetImpl, b: OrderedSetImpl): boolean;
/** Check if the 2nd argument is a subset of the 1st */
export declare function isSubset(a: OrderedSetImpl, b: OrderedSetImpl): boolean;
export declare function findPredecessorIndex(set: OrderedSetImpl, x: number): number;
export declare function findPredecessorIndexInInterval(set: OrderedSetImpl, x: number, bounds: I): number;
export declare function findRange(set: OrderedSetImpl, min: number, max: number): I<number>;
export declare function intersectionSize(a: OrderedSetImpl, b: OrderedSetImpl): number;
export declare function union(a: OrderedSetImpl, b: OrderedSetImpl): I<number> | S<number>;
export declare function intersect(a: OrderedSetImpl, b: OrderedSetImpl): I<number> | S<number>;
export declare function subtract(a: OrderedSetImpl, b: OrderedSetImpl): I<number> | S<number>;
export declare function forEach(set: OrderedSetImpl, f: (value: number, i: number, ctx: any) => void, ctx: any): any;
export declare function forEachSegment(set: OrderedSetImpl, segment: (v: number) => number, f: (value: number, segIndex: number, ctx: any) => void, ctx: any): any;
export declare function indexedIntersect(idxA: OrderedSetImpl, a: S, b: S): OrderedSetImpl;
export {};
