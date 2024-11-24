"use strict";
/**
 * Copyright (c) 2017-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderedSet = void 0;
const tslib_1 = require("tslib");
const Base = tslib_1.__importStar(require("./impl/ordered-set"));
const interval_1 = require("./interval");
var OrderedSet;
(function (OrderedSet) {
    OrderedSet.Empty = Base.Empty;
    OrderedSet.ofSingleton = Base.ofSingleton;
    /** Create interval from range [min, max] */
    OrderedSet.ofRange = Base.ofRange;
    /** Create interval from bounds [start, end), i.e. [start, end - 1] */
    OrderedSet.ofBounds = Base.ofBounds;
    /** It is the responsibility of the caller to ensure the array is sorted and contains unique values. */
    OrderedSet.ofSortedArray = Base.ofSortedArray;
    OrderedSet.has = Base.has;
    /** Returns the index of `x` in `set` or -1 if not found. */
    OrderedSet.indexOf = Base.indexOf;
    /** Returns the value in `set` at index `i`. */
    OrderedSet.getAt = Base.getAt;
    OrderedSet.min = Base.min;
    OrderedSet.max = Base.max;
    OrderedSet.start = Base.start;
    OrderedSet.end = Base.end;
    /** Number of elements in the OrderedSet */
    OrderedSet.size = Base.size;
    OrderedSet.hashCode = Base.hashCode;
    OrderedSet.areEqual = Base.areEqual;
    OrderedSet.areIntersecting = Base.areIntersecting;
    /** Check if the 2nd argument is a subset of the 1st */
    OrderedSet.isSubset = Base.isSubset;
    OrderedSet.union = Base.union;
    OrderedSet.intersect = Base.intersect;
    OrderedSet.indexedIntersect = Base.indexedIntersect;
    /** Returns elements of `a` that are not in `b`, i.e `a` - `b` */
    OrderedSet.subtract = Base.subtract;
    /**
     * Returns 0 if `x` is smaller or equal the first element of `set`
     * Returns length of `set` if `x` is bigger than the last element of `set`
     * Otherwise returns the first index where the value of `set` is equal or bigger than `x`
     */
    OrderedSet.findPredecessorIndex = Base.findPredecessorIndex;
    OrderedSet.findPredecessorIndexInInterval = Base.findPredecessorIndexInInterval;
    OrderedSet.findRange = Base.findRange;
    OrderedSet.intersectionSize = Base.intersectionSize;
    function forEach(set, f, ctx) {
        return Base.forEach(set, f, ctx);
    }
    OrderedSet.forEach = forEach;
    function forEachSegment(set, segment, f, ctx) {
        return Base.forEachSegment(set, segment, f, ctx);
    }
    OrderedSet.forEachSegment = forEachSegment;
    function isInterval(set) {
        return interval_1.Interval.is(set);
    }
    OrderedSet.isInterval = isInterval;
    function isSortedArray(set) {
        return !interval_1.Interval.is(set);
    }
    OrderedSet.isSortedArray = isSortedArray;
    function toArray(set) {
        const array = [];
        OrderedSet.forEach(set, v => array.push(v));
        return array;
    }
    OrderedSet.toArray = toArray;
    function toString(set) {
        return Base.toString(set);
    }
    OrderedSet.toString = toString;
})(OrderedSet || (exports.OrderedSet = OrderedSet = {}));
