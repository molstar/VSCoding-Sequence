/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
declare namespace Interval {
    const Empty: Interval;
    const ofSingleton: <T extends number = number>(value: T) => Interval<T>;
    /** Create interval from range [min, max] */
    const ofRange: <T extends number = number>(min: T, max: T) => Interval<T>;
    /** Create interval from bounds [start, end), i.e. [start, end - 1] */
    const ofBounds: <T extends number = number>(start: T, end: T) => Interval<T>;
    /** Create interval from length [0, length), i.e. [0, length - 1] */
    const ofLength: <T extends number = number>(length: T) => Interval<T>;
    const is: <T extends number = number>(v: any) => v is Interval<T>;
    /** Test if a value is within the bounds of the interval */
    const has: <T extends number = number>(interval: Interval<T>, x: T) => boolean;
    /** Returns the index of `x` in `set` or -1 if not found. */
    const indexOf: <T extends number = number>(interval: Interval<T>, x: T) => number;
    const getAt: <T extends number = number>(interval: Interval<T>, i: number) => T;
    /** Start value of the Interval<T>, same as min value */
    const start: <T extends number = number>(interval: Interval<T>) => T;
    /** End value of the Interval<T>, same as max + 1 */
    const end: <T extends number = number>(interval: Interval<T>) => T;
    /** Min value of the Interval<T>, same as start value */
    const min: <T extends number = number>(interval: Interval<T>) => T;
    /** Max value of the Interval<T>, same as end - 1 */
    const max: <T extends number = number>(interval: Interval<T>) => T;
    /** Number of values in the interval */
    const size: <T extends number = number>(interval: Interval<T>) => number;
    /** Hash code describing the interval */
    const hashCode: <T extends number = number>(interval: Interval<T>) => number;
    /** String representation of the interval */
    const toString: <T extends number = number>(interval: Interval<T>) => string;
    /** Test if two intervals are identical */
    const areEqual: <T extends number = number>(a: Interval<T>, b: Interval<T>) => boolean;
    /** Test if two intervals are intersecting, i.e. their bounds overlap */
    const areIntersecting: <T extends number = number>(a: Interval<T>, b: Interval<T>) => boolean;
    /** Test if interval b is fully included in interval a */
    const isSubInterval: <T extends number = number>(a: Interval<T>, b: Interval<T>) => boolean;
    const findPredecessorIndex: <T extends number = number>(interval: Interval<T>, x: T) => number;
    const findPredecessorIndexInInterval: <T extends number = number>(interval: Interval<T>, x: T, bounds: Interval) => number;
    const findRange: <T extends number = number>(interval: Interval<T>, min: T, max: T) => Interval;
    /** Size of the intersection of the two intervals */
    const intersectionSize: <T extends number = number>(a: Interval<T>, b: Interval<T>) => number;
    /** Get a new interval that is the intersection of the two intervals */
    const intersect: <T extends number = number>(a: Interval<T>, b: Interval<T>) => Interval<T>;
}
/** Interval describing a range [min, max] of values */
interface Interval<T extends number = number> {
    '@type': 'int-interval';
}
export { Interval };
