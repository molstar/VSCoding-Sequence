/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { OrderedSet, SortedArray, Interval } from '../int';
var SortedRanges;
(function (SortedRanges) {
    function ofSortedRanges(array) { return SortedArray.ofSortedArray(array); }
    SortedRanges.ofSortedRanges = ofSortedRanges;
    function start(ranges) { return ranges[0]; }
    SortedRanges.start = start;
    function end(ranges) { return ranges[ranges.length - 1] + 1; }
    SortedRanges.end = end;
    function min(ranges) { return ranges[0]; }
    SortedRanges.min = min;
    function max(ranges) { return ranges[ranges.length - 1]; }
    SortedRanges.max = max;
    function size(ranges) {
        let size = 0;
        for (let i = 0, il = ranges.length; i < il; i += 2) {
            size += ranges[i + 1] - ranges[i] + 1;
        }
        return size;
    }
    SortedRanges.size = size;
    function count(ranges) { return ranges.length / 2; }
    SortedRanges.count = count;
    function startAt(ranges, index) {
        return ranges[index * 2];
    }
    SortedRanges.startAt = startAt;
    function endAt(ranges, index) {
        return ranges[index * 2 + 1] + 1;
    }
    SortedRanges.endAt = endAt;
    function minAt(ranges, index) {
        return ranges[index * 2];
    }
    SortedRanges.minAt = minAt;
    function maxAt(ranges, index) {
        return ranges[index * 2 + 1];
    }
    SortedRanges.maxAt = maxAt;
    function areEqual(a, b) {
        if (a.length !== b.length)
            return false;
        for (let i = 0, il = a.length; i < il; ++i) {
            if (a[i] !== b[i])
                return false;
        }
        return true;
    }
    SortedRanges.areEqual = areEqual;
    function forEach(ranges, f) {
        let k = 0;
        for (let i = 0, il = ranges.length; i < il; i += 2) {
            for (let j = ranges[i], jl = ranges[i + 1]; j <= jl; ++j) {
                f(j, k);
                ++k;
            }
        }
    }
    SortedRanges.forEach = forEach;
    /** Returns if a value of `set` is included in `ranges` */
    function has(ranges, set) {
        return firstIntersectionIndex(ranges, set) !== -1;
    }
    SortedRanges.has = has;
    /** Returns if a value of `set` is included in `ranges` from given index */
    function hasFrom(ranges, set, from) {
        return firstIntersectionIndexFrom(ranges, set, from) !== -1;
    }
    SortedRanges.hasFrom = hasFrom;
    function firstIntersectionIndex(ranges, set) {
        return firstIntersectionIndexFrom(ranges, set, 0);
    }
    SortedRanges.firstIntersectionIndex = firstIntersectionIndex;
    function firstIntersectionIndexFrom(ranges, set, from) {
        if (minAt(ranges, from) > OrderedSet.max(set) || max(ranges) < OrderedSet.min(set))
            return -1;
        for (let i = from, il = count(ranges); i < il; ++i) {
            const interval = Interval.ofRange(minAt(ranges, i), maxAt(ranges, i));
            if (OrderedSet.areIntersecting(interval, set))
                return i;
        }
        return -1;
    }
    SortedRanges.firstIntersectionIndexFrom = firstIntersectionIndexFrom;
    function transientSegments(ranges, set) {
        return new Iterator(ranges, set);
    }
    SortedRanges.transientSegments = transientSegments;
    class Iterator {
        updateValue() {
            this.value.index = this.curIndex;
            this.value.start = OrderedSet.findPredecessorIndex(this.set, startAt(this.ranges, this.curIndex));
            this.value.end = OrderedSet.findPredecessorIndex(this.set, endAt(this.ranges, this.curIndex));
        }
        move() {
            if (this.hasNext) {
                this.updateValue();
                this.curIndex = firstIntersectionIndexFrom(this.ranges, this.set, this.curIndex + 1);
                this.hasNext = this.curIndex !== -1;
            }
            return this.value;
        }
        constructor(ranges, set) {
            this.ranges = ranges;
            this.set = set;
            this.value = { index: 0, start: 0, end: 0 };
            this.curIndex = 0;
            this.hasNext = false;
            this.curIndex = firstIntersectionIndex(ranges, set);
            this.hasNext = this.curIndex !== -1;
        }
    }
    SortedRanges.Iterator = Iterator;
})(SortedRanges || (SortedRanges = {}));
export { SortedRanges };
