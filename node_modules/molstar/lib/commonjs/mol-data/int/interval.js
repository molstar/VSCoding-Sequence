"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interval = void 0;
const tslib_1 = require("tslib");
const Impl = tslib_1.__importStar(require("./impl/interval"));
var Interval;
(function (Interval) {
    Interval.Empty = Impl.Empty;
    Interval.ofSingleton = (v) => Impl.ofRange(v, v);
    /** Create interval from range [min, max] */
    Interval.ofRange = Impl.ofRange;
    /** Create interval from bounds [start, end), i.e. [start, end - 1] */
    Interval.ofBounds = Impl.ofBounds;
    /** Create interval from length [0, length), i.e. [0, length - 1] */
    Interval.ofLength = Impl.ofLength;
    Interval.is = Impl.is;
    /** Test if a value is within the bounds of the interval */
    Interval.has = Impl.has;
    /** Returns the index of `x` in `set` or -1 if not found. */
    Interval.indexOf = Impl.indexOf;
    Interval.getAt = Impl.getAt;
    /** Start value of the Interval<T>, same as min value */
    Interval.start = Impl.start;
    /** End value of the Interval<T>, same as max + 1 */
    Interval.end = Impl.end;
    /** Min value of the Interval<T>, same as start value */
    Interval.min = Impl.min;
    /** Max value of the Interval<T>, same as end - 1 */
    Interval.max = Impl.max;
    /** Number of values in the interval */
    Interval.size = Impl.size;
    /** Hash code describing the interval */
    Interval.hashCode = Impl.hashCode;
    /** String representation of the interval */
    Interval.toString = Impl.toString;
    /** Test if two intervals are identical */
    Interval.areEqual = Impl.areEqual;
    /** Test if two intervals are intersecting, i.e. their bounds overlap */
    Interval.areIntersecting = Impl.areIntersecting;
    /** Test if interval b is fully included in interval a */
    Interval.isSubInterval = Impl.isSubInterval;
    Interval.findPredecessorIndex = Impl.findPredecessorIndex;
    Interval.findPredecessorIndexInInterval = Impl.findPredecessorIndexInInterval;
    Interval.findRange = Impl.findRange;
    /** Size of the intersection of the two intervals */
    Interval.intersectionSize = Impl.intersectionSize;
    /** Get a new interval that is the intersection of the two intervals */
    Interval.intersect = Impl.intersect;
})(Interval || (exports.Interval = Interval = {}));
