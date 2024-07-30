"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayMax = arrayMax;
exports.arrayMin = arrayMin;
exports.arrayMinMax = arrayMinMax;
exports.arraySum = arraySum;
exports.arrayMean = arrayMean;
exports.arrayRms = arrayRms;
exports.fillSerial = fillSerial;
exports.arrayRemoveInPlace = arrayRemoveInPlace;
exports.arrayRemoveAtInPlace = arrayRemoveAtInPlace;
exports.arraySetAdd = arraySetAdd;
exports.arraySetRemove = arraySetRemove;
exports.arrayAreIntersecting = arrayAreIntersecting;
exports.arrayIntersectionSize = arrayIntersectionSize;
exports.arrayEqual = arrayEqual;
exports.arrayIsIdentity = arrayIsIdentity;
exports.arrayMapUpsert = arrayMapUpsert;
exports.range = range;
exports.arrayExtend = arrayExtend;
exports.sortIfNeeded = sortIfNeeded;
exports.arrayIsSorted = arrayIsSorted;
exports.filterInPlace = filterInPlace;
exports.arrayDistinct = arrayDistinct;
const json_1 = require("./json");
// TODO move to mol-math as Vector???
/** Get the maximum value in an array */
function arrayMax(array) {
    let max = -Infinity;
    for (let i = 0, il = array.length; i < il; ++i) {
        if (array[i] > max)
            max = array[i];
    }
    return max;
}
/** Get the minimum value in an array */
function arrayMin(array) {
    let min = Infinity;
    for (let i = 0, il = array.length; i < il; ++i) {
        if (array[i] < min)
            min = array[i];
    }
    return min;
}
/** Get the minimum & maximum value in an array */
function arrayMinMax(array) {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0, il = array.length; i < il; ++i) {
        if (array[i] < min)
            min = array[i];
        if (array[i] > max)
            max = array[i];
    }
    return [min, max];
}
/** Get the sum of values in an array */
function arraySum(array, stride = 1, offset = 0) {
    const n = array.length;
    let sum = 0;
    for (let i = offset; i < n; i += stride) {
        sum += array[i];
    }
    return sum;
}
/** Get the mean of values in an array */
function arrayMean(array, stride = 1, offset = 0) {
    return arraySum(array, stride, offset) / (array.length / stride);
}
/** Get the root mean square of values in an array */
function arrayRms(array) {
    const n = array.length;
    let sumSq = 0;
    for (let i = 0; i < n; ++i) {
        const di = array[i];
        sumSq += di * di;
    }
    return Math.sqrt(sumSq / n);
}
/** Fill an array with serial numbers starting from 0 until n - 1 (defaults to array.length) */
function fillSerial(array, n) {
    for (let i = 0, il = n ? Math.min(n, array.length) : array.length; i < il; ++i)
        array[i] = i;
    return array;
}
function arrayRemoveInPlace(xs, x) {
    let i = 0, found = false;
    for (const il = xs.length; i < il; i++) {
        if (xs[i] === x) {
            found = true;
            break;
        }
    }
    if (!found)
        return false;
    arrayRemoveAtInPlace(xs, i);
    return true;
}
function arrayRemoveAtInPlace(xs, idx) {
    for (let i = idx, _i = xs.length - 1; i < _i; i++) {
        xs[i] = xs[i + 1];
    }
    xs.pop();
}
function arraySetAdd(xs, x) {
    if (xs.indexOf(x) >= 0)
        return false;
    xs.push(x);
    return true;
}
function arraySetRemove(xs, x) {
    const idx = xs.indexOf(x);
    if (idx < 0)
        return false;
    for (let i = idx, _i = xs.length - 1; i < _i; i++) {
        xs[i] = xs[i + 1];
    }
    xs.pop();
    return true;
}
/**
 * Caution, O(n^2) complexity. Only use for small input sizes.
 * For larger inputs consider using `SortedArray`.
 */
function arrayAreIntersecting(xs, ys) {
    for (let i = 0, il = xs.length; i < il; ++i) {
        if (ys.includes(xs[i]))
            return true;
    }
    return false;
}
/**
 * Caution, O(n^2) complexity. Only use for small input sizes.
 * For larger inputs consider using `SortedArray`.
 */
function arrayIntersectionSize(xs, ys) {
    let count = 0;
    for (let i = 0, il = xs.length; i < il; ++i) {
        if (ys.includes(xs[i]))
            count += 1;
    }
    return count;
}
function arrayEqual(xs, ys) {
    if (!xs || xs.length === 0)
        return !ys || ys.length === 0;
    if (!ys)
        return false;
    const lenX = xs.length;
    if (lenX !== ys.length)
        return false;
    for (let i = 0; i < lenX; i++) {
        if (xs[i] !== ys[i])
            return false;
    }
    return true;
}
function arrayIsIdentity(xs) {
    for (let i = 0, _i = xs.length; i < _i; i++) {
        if (xs[i] !== i)
            return false;
    }
    return true;
}
function arrayMapUpsert(xs, key, value) {
    for (let i = 0, il = xs.length; i < il; ++i) {
        if (xs[i][0] === key) {
            xs[i][1] = value;
            return;
        }
    }
    xs.push([key, value]);
}
/** Return an array containing integers from [start, end) if `end` is given,
 * or from [0, start) if `end` is omitted. */
function range(start, end) {
    if (end === undefined) {
        end = start;
        start = 0;
    }
    const length = Math.max(end - start, 0);
    const result = Array(length);
    for (let i = 0; i < length; i++) {
        result[i] = start + i;
    }
    return result;
}
/** Copy all elements from `src` to the end of `dst`.
 * Equivalent to `dst.push(...src)`, but avoids storing element on call stack. Faster that `extend` from Underscore.js.
 * `extend(a, a)` will double the array.
 * Returns the modified `dst` array.
 */
function arrayExtend(dst, src) {
    const offset = dst.length;
    const nCopy = src.length;
    dst.length += nCopy;
    for (let i = 0; i < nCopy; i++) {
        dst[offset + i] = src[i];
    }
    return dst;
}
/** Check whether `array` is sorted, sort if not. */
function sortIfNeeded(array, compareFn) {
    return arrayIsSorted(array, compareFn) ? array : array.sort(compareFn);
}
/** Decide whether `array` is sorted. */
function arrayIsSorted(array, compareFn) {
    for (let i = 1, n = array.length; i < n; i++) {
        if (compareFn(array[i - 1], array[i]) > 0) {
            return false;
        }
    }
    return true;
}
/** Remove all elements from the array which do not fulfil `predicate`. Return the modified array itself. */
function filterInPlace(array, predicate) {
    const n = array.length;
    let iDest = 0;
    for (let iSrc = 0; iSrc < n; iSrc++) {
        if (predicate(array[iSrc])) {
            array[iDest++] = array[iSrc];
        }
    }
    array.length = iDest;
    return array;
}
/** Return an array of all distinct values from `values`
 * (i.e. with removed duplicates).
 * Uses deep equality for objects and arrays,
 * independent from object key order and undefined properties.
 * E.g. {a: 1, b: undefined, c: {d: [], e: null}} is equal to {c: {e: null, d: []}}, a: 1}.
 * If two or more objects in `values` are equal, only the first of them will be in the result. */
function arrayDistinct(values) {
    const seen = new Set();
    const result = [];
    for (const value of values) {
        const key = (0, json_1.canonicalJsonString)(value);
        if (!seen.has(key)) {
            seen.add(key);
            result.push(value);
        }
    }
    return result;
}
