"use strict";
/**
 * Copyright (c) 2017-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortedArray = void 0;
const tslib_1 = require("tslib");
const Impl = tslib_1.__importStar(require("./impl/sorted-array"));
var SortedArray;
(function (SortedArray) {
    SortedArray.Empty = Impl.Empty;
    SortedArray.ofUnsortedArray = Impl.ofUnsortedArray;
    SortedArray.ofSingleton = Impl.ofSingleton;
    SortedArray.ofSortedArray = Impl.ofSortedArray;
    /** create sorted array [min, max] (it DOES contain the max value) */
    SortedArray.ofRange = Impl.ofRange;
    /** create sorted array [min, max) (it does NOT contain the max value) */
    SortedArray.ofBounds = (min, max) => Impl.ofRange(min, max - 1);
    SortedArray.is = Impl.is;
    SortedArray.isRange = Impl.isRange;
    SortedArray.has = Impl.has;
    /** Returns the index of `x` in `set` or -1 if not found. */
    SortedArray.indexOf = Impl.indexOf;
    SortedArray.indexOfInInterval = Impl.indexOfInInterval;
    SortedArray.indexOfInRange = Impl.indexOfInRange;
    /** Returns `array[0]` */
    SortedArray.start = Impl.start;
    /** Returns `array[array.length - 1] + 1` */
    SortedArray.end = Impl.end;
    SortedArray.min = Impl.min;
    SortedArray.max = Impl.max;
    SortedArray.size = Impl.size;
    SortedArray.hashCode = Impl.hashCode;
    SortedArray.toString = Impl.toString;
    SortedArray.areEqual = Impl.areEqual;
    SortedArray.areIntersecting = Impl.areIntersecting;
    SortedArray.isSubset = Impl.isSubset;
    SortedArray.union = Impl.union;
    SortedArray.intersect = Impl.intersect;
    SortedArray.subtract = Impl.subtract;
    SortedArray.findPredecessorIndex = Impl.findPredecessorIndex;
    SortedArray.findPredecessorIndexInInterval = Impl.findPredecessorIndexInInterval;
    SortedArray.findRange = Impl.findRange;
    SortedArray.intersectionSize = Impl.intersectionSize;
    SortedArray.deduplicate = Impl.deduplicate;
    /** Returns indices of xs in the array. E.g. indicesOf([10, 11, 12], [10, 12]) ==> [0, 2] */
    SortedArray.indicesOf = Impl.indicesOf;
})(SortedArray || (exports.SortedArray = SortedArray = {}));
