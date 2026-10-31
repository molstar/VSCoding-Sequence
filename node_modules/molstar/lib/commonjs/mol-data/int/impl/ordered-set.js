"use strict";
/**
 * Copyright (c) 2017-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ofBounds = exports.ofRange = exports.ofSingleton = exports.Empty = void 0;
exports.ofSortedArray = ofSortedArray;
exports.size = size;
exports.has = has;
exports.indexOf = indexOf;
exports.getAt = getAt;
exports.min = min;
exports.max = max;
exports.start = start;
exports.end = end;
exports.hashCode = hashCode;
exports.toString = toString;
exports.areEqual = areEqual;
exports.areIntersecting = areIntersecting;
exports.isSubset = isSubset;
exports.findPredecessorIndex = findPredecessorIndex;
exports.findPredecessorIndexInInterval = findPredecessorIndexInInterval;
exports.findRange = findRange;
exports.intersectionSize = intersectionSize;
exports.union = union;
exports.intersect = intersect;
exports.subtract = subtract;
exports.forEach = forEach;
exports.forEachSegment = forEachSegment;
exports.indexedIntersect = indexedIntersect;
const sorted_array_1 = require("../sorted-array");
const interval_1 = require("../interval");
exports.Empty = interval_1.Interval.Empty;
exports.ofSingleton = interval_1.Interval.ofSingleton;
exports.ofRange = interval_1.Interval.ofRange;
exports.ofBounds = interval_1.Interval.ofBounds;
function ofSortedArray(xs) {
    if (!xs.length)
        return exports.Empty;
    // check if the array is just a range
    if (sorted_array_1.SortedArray.isRange(xs))
        return interval_1.Interval.ofRange(xs[0], xs[xs.length - 1]);
    return xs;
}
function size(set) { return interval_1.Interval.is(set) ? interval_1.Interval.size(set) : sorted_array_1.SortedArray.size(set); }
function has(set, x) { return interval_1.Interval.is(set) ? interval_1.Interval.has(set, x) : sorted_array_1.SortedArray.has(set, x); }
/** Returns the index of `x` in `set` or -1 if not found. */
function indexOf(set, x) { return interval_1.Interval.is(set) ? interval_1.Interval.indexOf(set, x) : sorted_array_1.SortedArray.indexOf(set, x); }
function getAt(set, i) { return interval_1.Interval.is(set) ? interval_1.Interval.getAt(set, i) : set[i]; }
function min(set) { return interval_1.Interval.is(set) ? interval_1.Interval.min(set) : sorted_array_1.SortedArray.min(set); }
function max(set) { return interval_1.Interval.is(set) ? interval_1.Interval.max(set) : sorted_array_1.SortedArray.max(set); }
function start(set) { return interval_1.Interval.is(set) ? interval_1.Interval.start(set) : sorted_array_1.SortedArray.start(set); }
function end(set) { return interval_1.Interval.is(set) ? interval_1.Interval.end(set) : sorted_array_1.SortedArray.end(set); }
function hashCode(set) { return interval_1.Interval.is(set) ? interval_1.Interval.hashCode(set) : sorted_array_1.SortedArray.hashCode(set); }
// TODO: possibly add more hash functions to allow for multilevel hashing.
function toString(set) { return interval_1.Interval.is(set) ? interval_1.Interval.toString(set) : sorted_array_1.SortedArray.toString(set); }
function areEqual(a, b) {
    if (interval_1.Interval.is(a)) {
        if (interval_1.Interval.is(b))
            return interval_1.Interval.areEqual(a, b);
        return areEqualIS(a, b);
    }
    else if (interval_1.Interval.is(b))
        return areEqualIS(b, a);
    return sorted_array_1.SortedArray.areEqual(a, b);
}
function areIntersecting(a, b) {
    if (interval_1.Interval.is(a)) {
        if (interval_1.Interval.is(b))
            return interval_1.Interval.areIntersecting(a, b);
        return areIntersectingSI(b, a);
    }
    else if (interval_1.Interval.is(b))
        return areIntersectingSI(a, b);
    return sorted_array_1.SortedArray.areIntersecting(a, b);
}
/** Check if the 2nd argument is a subset of the 1st */
function isSubset(a, b) {
    if (interval_1.Interval.is(a)) {
        if (interval_1.Interval.is(b))
            return interval_1.Interval.isSubInterval(a, b);
        return isSubsetIS(a, b);
    }
    else if (interval_1.Interval.is(b))
        return isSubsetSI(a, b);
    return sorted_array_1.SortedArray.isSubset(a, b);
}
function findPredecessorIndex(set, x) {
    return interval_1.Interval.is(set) ? interval_1.Interval.findPredecessorIndex(set, x) : sorted_array_1.SortedArray.findPredecessorIndex(set, x);
}
function findPredecessorIndexInInterval(set, x, bounds) {
    return interval_1.Interval.is(set) ? interval_1.Interval.findPredecessorIndexInInterval(set, x, bounds) : sorted_array_1.SortedArray.findPredecessorIndexInInterval(set, x, bounds);
}
function findRange(set, min, max) {
    return interval_1.Interval.is(set) ? interval_1.Interval.findRange(set, min, max) : sorted_array_1.SortedArray.findRange(set, min, max);
}
function intersectionSize(a, b) {
    if (interval_1.Interval.is(a)) {
        if (interval_1.Interval.is(b))
            return interval_1.Interval.intersectionSize(a, b);
        return intersectionSizeSI(b, a);
    }
    else if (interval_1.Interval.is(b))
        return intersectionSizeSI(a, b);
    return sorted_array_1.SortedArray.intersectionSize(a, b);
}
function union(a, b) {
    if (interval_1.Interval.is(a)) {
        if (interval_1.Interval.is(b))
            return unionII(a, b);
        return unionSI(b, a);
    }
    else if (interval_1.Interval.is(b))
        return unionSI(a, b);
    return ofSortedArray(sorted_array_1.SortedArray.union(a, b));
}
function intersect(a, b) {
    if (interval_1.Interval.is(a)) {
        if (interval_1.Interval.is(b))
            return interval_1.Interval.intersect(a, b);
        return intersectSI(b, a);
    }
    else if (interval_1.Interval.is(b))
        return intersectSI(a, b);
    return ofSortedArray(sorted_array_1.SortedArray.intersect(a, b));
}
function subtract(a, b) {
    if (interval_1.Interval.is(a)) {
        if (interval_1.Interval.is(b))
            return subtractII(a, b);
        return subtractIS(a, b);
    }
    else if (interval_1.Interval.is(b))
        return subtractSI(a, b);
    return ofSortedArray(sorted_array_1.SortedArray.subtract(a, b));
}
function areEqualIS(a, b) { return interval_1.Interval.size(a) === sorted_array_1.SortedArray.size(b) && interval_1.Interval.start(a) === sorted_array_1.SortedArray.start(b) && interval_1.Interval.end(a) === sorted_array_1.SortedArray.end(b); }
function areIntersectingSI(a, b) {
    return a.length !== 0 && interval_1.Interval.size(sorted_array_1.SortedArray.findRange(a, interval_1.Interval.min(b), interval_1.Interval.max(b))) !== 0;
}
function isSubsetSI(a, b) {
    const minB = interval_1.Interval.min(b), maxB = interval_1.Interval.max(b);
    if (maxB - minB + 1 === 0)
        return true;
    const minA = sorted_array_1.SortedArray.min(a), maxA = sorted_array_1.SortedArray.max(a);
    if (minB < minA || maxB > maxA)
        return false;
    const r = sorted_array_1.SortedArray.findRange(a, minB, maxB);
    return interval_1.Interval.size(r) === interval_1.Interval.size(b);
}
function isSubsetIS(a, b) {
    const minA = interval_1.Interval.min(a), maxA = interval_1.Interval.max(a);
    if (maxA - minA + 1 === 0)
        return false;
    const minB = sorted_array_1.SortedArray.min(b), maxB = sorted_array_1.SortedArray.max(b);
    return minB >= minA && maxB <= maxA;
}
function areRangesIntersecting(a, b) {
    const sa = size(a), sb = size(b);
    if (sa === 0 && sb === 0)
        return true;
    return sa > 0 && sb > 0 && max(a) >= min(b) && min(a) <= max(b);
}
function isRangeSubset(a, b) {
    if (!size(a))
        return size(b) === 0;
    if (!size(b))
        return true;
    return min(a) <= min(b) && max(a) >= max(b);
}
function unionII(a, b) {
    if (interval_1.Interval.areEqual(a, b))
        return a;
    const sizeA = interval_1.Interval.size(a), sizeB = interval_1.Interval.size(b);
    if (!sizeB)
        return a;
    if (!sizeA)
        return b;
    const minA = interval_1.Interval.min(a), minB = interval_1.Interval.min(b);
    if (areRangesIntersecting(a, b))
        return interval_1.Interval.ofRange(Math.min(minA, minB), Math.max(interval_1.Interval.max(a), interval_1.Interval.max(b)));
    let lSize, lMin, rSize, rMin;
    if (minA < minB) {
        lSize = sizeA;
        lMin = minA;
        rSize = sizeB;
        rMin = minB;
    }
    else {
        lSize = sizeB;
        lMin = minB;
        rSize = sizeA;
        rMin = minA;
    }
    const arr = new Int32Array(sizeA + sizeB);
    for (let i = 0; i < lSize; i++)
        arr[i] = i + lMin;
    for (let i = 0; i < rSize; i++)
        arr[i + lSize] = i + rMin;
    return ofSortedArray(arr);
}
function unionSI(a, b) {
    const bSize = interval_1.Interval.size(b);
    if (!bSize)
        return a;
    // is the array fully contained in the range?
    if (isRangeSubset(b, a))
        return b;
    const min = interval_1.Interval.min(b), max = interval_1.Interval.max(b);
    const r = sorted_array_1.SortedArray.findRange(a, min, max);
    const start = interval_1.Interval.start(r), end = interval_1.Interval.end(r);
    const indices = new Int32Array(start + (a.length - end) + bSize);
    let offset = 0;
    for (let i = 0; i < start; i++)
        indices[offset++] = a[i];
    for (let i = min; i <= max; i++)
        indices[offset++] = i;
    for (let i = end, _i = a.length; i < _i; i++)
        indices[offset++] = a[i];
    return ofSortedArray(indices);
}
function intersectionSizeSI(a, b) {
    if (!interval_1.Interval.size(b))
        return 0;
    const r = sorted_array_1.SortedArray.findRange(a, interval_1.Interval.min(b), interval_1.Interval.max(b));
    return interval_1.Interval.end(r) - interval_1.Interval.start(r);
}
function intersectSI(a, b) {
    if (!interval_1.Interval.size(b))
        return exports.Empty;
    const r = sorted_array_1.SortedArray.findRange(a, interval_1.Interval.min(b), interval_1.Interval.max(b));
    const start = interval_1.Interval.start(r), end = interval_1.Interval.end(r);
    const resultSize = end - start;
    if (!resultSize)
        return exports.Empty;
    if (resultSize === a.length)
        return a;
    const indices = new Int32Array(resultSize);
    let offset = 0;
    for (let i = start; i < end; i++) {
        indices[offset++] = a[i];
    }
    return ofSortedArray(indices);
}
function subtractII(a, b) {
    if (interval_1.Interval.areEqual(a, b))
        return exports.Empty;
    if (!interval_1.Interval.areIntersecting(a, b))
        return a;
    const minA = interval_1.Interval.min(a), maxA = interval_1.Interval.max(a);
    const minB = interval_1.Interval.min(b), maxB = interval_1.Interval.max(b);
    if (maxA < minA || maxB < minB)
        return a;
    // is A subset of B? ==> Empty
    if (interval_1.Interval.isSubInterval(b, a))
        return exports.Empty;
    if (interval_1.Interval.isSubInterval(a, b)) {
        // this splits the interval into two, gotta represent it as a set.
        const l = minB - minA, r = maxA - maxB;
        if (l <= 0)
            return interval_1.Interval.ofRange(maxB + 1, maxB + r);
        if (r <= 0)
            return interval_1.Interval.ofRange(minA, minA + l - 1);
        const ret = new Int32Array(l + r);
        let offset = 0;
        for (let i = 0; i < l; i++)
            ret[offset++] = minA + i;
        for (let i = 1; i <= r; i++)
            ret[offset++] = maxB + i;
        return ofSortedArray(ret);
    }
    if (minA < minB)
        return interval_1.Interval.ofRange(minA, minB - 1);
    return interval_1.Interval.ofRange(maxB + 1, maxA);
}
function subtractSI(a, b) {
    const min = interval_1.Interval.min(b), max = interval_1.Interval.max(b);
    // is empty?
    if (max < min)
        return a;
    const r = sorted_array_1.SortedArray.findRange(a, min, max);
    const start = interval_1.Interval.start(r), end = interval_1.Interval.end(r);
    const resultSize = a.length - (end - start);
    // A is subset of B
    if (resultSize <= 0)
        return exports.Empty;
    // No common elements
    if (resultSize === a.length)
        return a;
    const ret = new Int32Array(resultSize);
    let offset = 0;
    for (let i = 0; i < start; i++)
        ret[offset++] = a[i];
    for (let i = end, _i = a.length; i < _i; i++)
        ret[offset++] = a[i];
    return ofSortedArray(ret);
}
function subtractIS(a, b) {
    const min = interval_1.Interval.min(a), max = interval_1.Interval.max(a);
    // is empty?
    if (max < min)
        return a;
    const rSize = max - min + 1;
    const interval = sorted_array_1.SortedArray.findRange(b, min, max);
    const start = interval_1.Interval.start(interval), end = interval_1.Interval.end(interval);
    const commonCount = end - start;
    // No common elements.
    if (commonCount === 0)
        return a;
    const resultSize = rSize - commonCount;
    // A is subset of B
    if (resultSize <= 0)
        return exports.Empty;
    const ret = new Int32Array(resultSize);
    const li = b.length - 1;
    const fst = b[Math.min(start, li)], last = b[Math.min(end, li)];
    let offset = 0;
    for (let i = min; i < fst; i++)
        ret[offset++] = i;
    for (let i = fst; i <= last; i++) {
        if (sorted_array_1.SortedArray.indexOfInInterval(b, i, interval) < 0)
            ret[offset++] = i;
    }
    for (let i = last + 1; i <= max; i++)
        ret[offset++] = i;
    return ofSortedArray(ret);
}
function forEach(set, f, ctx) {
    if (interval_1.Interval.is(set)) {
        const start = interval_1.Interval.min(set);
        for (let i = start, _i = interval_1.Interval.max(set); i <= _i; i++) {
            f(i, i - start, ctx);
        }
    }
    else {
        for (let i = 0, _i = set.length; i < _i; i++) {
            f(set[i], i, ctx);
        }
    }
    return ctx;
}
function forEachSegment(set, segment, f, ctx) {
    if (interval_1.Interval.is(set)) {
        let sI = 0;
        for (let i = interval_1.Interval.min(set), _i = interval_1.Interval.max(set); i <= _i; i++) {
            const s = segment(i);
            let endI = i + 1;
            while (endI < _i && segment(endI) === s)
                endI++;
            i = endI - 1;
            f(s, sI, ctx);
            sI++;
        }
    }
    else {
        let sI = 0;
        for (let i = 0, _i = set.length; i < _i; i++) {
            const s = segment(set[i]);
            let endI = i + 1;
            while (endI < _i && segment(set[endI]) === s)
                endI++;
            i = endI - 1;
            f(s, sI, ctx);
            sI++;
        }
    }
    return ctx;
}
function indexedIntersect(idxA, a, b) {
    if (a === b)
        return idxA;
    const lenI = size(idxA), lenA = a.length, lenB = b.length;
    if (lenI === 0 || lenA === 0 || lenB === 0)
        return exports.Empty;
    const startJ = sorted_array_1.SortedArray.findPredecessorIndex(b, a[min(idxA)]);
    const endJ = sorted_array_1.SortedArray.findPredecessorIndex(b, a[max(idxA)] + 1);
    let commonCount = 0;
    let offset = 0;
    let O = 0;
    let j = startJ;
    while (O < lenI && j < endJ) {
        const x = a[getAt(idxA, O)], y = b[j];
        if (x < y) {
            O++;
        }
        else if (x > y) {
            j++;
        }
        else {
            commonCount++;
            O++;
            j++;
        }
    }
    // no common elements
    if (commonCount === 0)
        return exports.Empty;
    // A === B
    if (commonCount === lenA && commonCount === lenB)
        return idxA;
    const indices = new Int32Array(commonCount);
    offset = 0;
    O = 0;
    j = startJ;
    while (O < lenI && j < endJ) {
        const x = a[getAt(idxA, O)], y = b[j];
        if (x < y) {
            O++;
        }
        else if (x > y) {
            j++;
        }
        else {
            indices[offset++] = j;
            O++;
            j++;
        }
    }
    return ofSortedArray(indices);
}
