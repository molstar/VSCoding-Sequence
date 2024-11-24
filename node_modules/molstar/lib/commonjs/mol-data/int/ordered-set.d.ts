/**
 * Copyright (c) 2017-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Interval } from './interval';
import { SortedArray } from './sorted-array';
declare namespace OrderedSet {
    const Empty: OrderedSet;
    const ofSingleton: <T extends number = number>(value: T) => OrderedSet<T>;
    /** Create interval from range [min, max] */
    const ofRange: <T extends number = number>(min: T, max: T) => OrderedSet<T>;
    /** Create interval from bounds [start, end), i.e. [start, end - 1] */
    const ofBounds: <T extends number = number>(start: T, end: T) => OrderedSet<T>;
    /** It is the responsibility of the caller to ensure the array is sorted and contains unique values. */
    const ofSortedArray: <T extends number = number>(xs: ArrayLike<T>) => OrderedSet<T>;
    const has: <T extends number = number>(set: OrderedSet<T>, x: T) => boolean;
    /** Returns the index of `x` in `set` or -1 if not found. */
    const indexOf: <T extends number = number>(set: OrderedSet<T>, x: T) => number;
    /** Returns the value in `set` at index `i`. */
    const getAt: <T extends number = number>(set: OrderedSet<T>, i: number) => T;
    const min: <T extends number = number>(set: OrderedSet<T>) => T;
    const max: <T extends number = number>(set: OrderedSet<T>) => T;
    const start: <T extends number = number>(set: OrderedSet<T>) => T;
    const end: <T extends number = number>(set: OrderedSet<T>) => T;
    /** Number of elements in the OrderedSet */
    const size: <T extends number = number>(set: OrderedSet<T>) => number;
    const hashCode: <T extends number = number>(set: OrderedSet<T>) => number;
    const areEqual: <T extends number = number>(a: OrderedSet<T>, b: OrderedSet<T>) => boolean;
    const areIntersecting: <T extends number = number>(a: OrderedSet<T>, b: OrderedSet<T>) => boolean;
    /** Check if the 2nd argument is a subset of the 1st */
    const isSubset: <T extends number = number>(a: OrderedSet<T>, b: OrderedSet<T>) => boolean;
    const union: <T extends number = number>(a: OrderedSet<T>, b: OrderedSet<T>) => OrderedSet<T>;
    const intersect: <T extends number = number>(a: OrderedSet<T>, b: OrderedSet<T>) => OrderedSet<T>;
    const indexedIntersect: <T extends number = number, S extends number = number>(idxA: OrderedSet<T>, a: SortedArray<S>, b: SortedArray<S>) => OrderedSet<T>;
    /** Returns elements of `a` that are not in `b`, i.e `a` - `b` */
    const subtract: <T extends number = number>(a: OrderedSet<T>, b: OrderedSet<T>) => OrderedSet<T>;
    /**
     * Returns 0 if `x` is smaller or equal the first element of `set`
     * Returns length of `set` if `x` is bigger than the last element of `set`
     * Otherwise returns the first index where the value of `set` is equal or bigger than `x`
     */
    const findPredecessorIndex: <T extends number = number>(set: OrderedSet<T>, x: number) => number;
    const findPredecessorIndexInInterval: <T extends number = number>(set: OrderedSet<T>, x: T, range: Interval) => number;
    const findRange: <T extends number = number>(set: OrderedSet<T>, min: T, max: T) => Interval;
    const intersectionSize: <T extends number = number>(a: OrderedSet<T>, b: OrderedSet<T>) => number;
    function forEach<T extends number, Ctx>(set: OrderedSet<T>, f: (v: T, i: number, ctx: Ctx) => void, ctx?: Ctx): Ctx;
    function forEachSegment<T extends number, S extends number, Ctx>(set: OrderedSet<T>, segment: (v: T) => S, f: (v: S, sI: number, ctx: Ctx) => void, ctx?: Ctx): Ctx;
    function isInterval<T extends number = number>(set: OrderedSet<T>): set is Interval<T>;
    function isSortedArray<T extends number = number>(set: OrderedSet<T>): set is SortedArray<T>;
    function toArray<T extends number = number>(set: OrderedSet<T>): T[];
    function toString<T extends number = number>(set: OrderedSet<T>): string;
}
type OrderedSet<T extends number = number> = SortedArray<T> | Interval<T>;
export { OrderedSet };
