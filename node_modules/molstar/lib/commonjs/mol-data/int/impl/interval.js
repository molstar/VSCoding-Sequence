"use strict";
/**
 * Copyright (c) 2017-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.areEqual = exports.toString = exports.hashCode = exports.size = exports.min = exports.end = exports.start = exports.is = exports.Empty = void 0;
exports.ofRange = ofRange;
exports.ofBounds = ofBounds;
exports.ofLength = ofLength;
exports.max = max;
exports.has = has;
exports.indexOf = indexOf;
exports.getAt = getAt;
exports.areIntersecting = areIntersecting;
exports.isSubInterval = isSubInterval;
exports.findPredecessorIndex = findPredecessorIndex;
exports.findPredecessorIndexInInterval = findPredecessorIndexInInterval;
exports.findRange = findRange;
exports.intersect = intersect;
exports.intersectionSize = intersectionSize;
const tuple_1 = require("../tuple");
exports.Empty = tuple_1.IntTuple.Zero;
function ofRange(min, max) { return max < min ? tuple_1.IntTuple.create(min, min) : tuple_1.IntTuple.create(min, max + 1); }
function ofBounds(start, end) { return end <= start ? tuple_1.IntTuple.create(start, start) : tuple_1.IntTuple.create(start, end); }
function ofLength(length) { return length < 0 ? tuple_1.IntTuple.create(0, 0) : tuple_1.IntTuple.create(0, length); }
exports.is = tuple_1.IntTuple.is;
exports.start = tuple_1.IntTuple.fst;
exports.end = tuple_1.IntTuple.snd;
exports.min = tuple_1.IntTuple.fst;
function max(i) { return tuple_1.IntTuple.snd(i) - 1; }
exports.size = tuple_1.IntTuple.diff;
exports.hashCode = tuple_1.IntTuple.hashCode;
exports.toString = tuple_1.IntTuple.toString;
function has(int, v) { return tuple_1.IntTuple.fst(int) <= v && v < tuple_1.IntTuple.snd(int); }
/** Returns the index of `x` in `set` or -1 if not found. */
function indexOf(int, x) { const m = (0, exports.start)(int); return x >= m && x < (0, exports.end)(int) ? x - m : -1; }
function getAt(int, i) { return tuple_1.IntTuple.fst(int) + i; }
exports.areEqual = tuple_1.IntTuple.areEqual;
function areIntersecting(a, b) {
    const sa = (0, exports.size)(a), sb = (0, exports.size)(b);
    if (sa === 0 && sb === 0)
        return true;
    return sa > 0 && sb > 0 && max(a) >= (0, exports.min)(b) && (0, exports.min)(a) <= max(b);
}
function isSubInterval(a, b) {
    if (!(0, exports.size)(a))
        return (0, exports.size)(b) === 0;
    if (!(0, exports.size)(b))
        return true;
    return (0, exports.start)(a) <= (0, exports.start)(b) && (0, exports.end)(a) >= (0, exports.end)(b);
}
function findPredecessorIndex(int, v) {
    const s = (0, exports.start)(int);
    if (v <= s)
        return 0;
    const e = (0, exports.end)(int);
    if (v >= e)
        return e - s;
    return v - s;
}
function findPredecessorIndexInInterval(int, v, bounds) {
    const bS = (0, exports.start)(bounds);
    const s = (0, exports.start)(int);
    if (v <= bS + s)
        return bS;
    const bE = (0, exports.end)(bounds);
    if (v >= bE + s)
        return bE;
    return v - s;
}
function findRange(int, min, max) {
    return ofBounds(findPredecessorIndex(int, min), findPredecessorIndex(int, max + 1));
}
function intersect(a, b) {
    if (!areIntersecting(a, b))
        return exports.Empty;
    return ofBounds(Math.max((0, exports.start)(a), (0, exports.start)(b)), Math.min((0, exports.end)(a), (0, exports.end)(b)));
}
function intersectionSize(a, b) {
    return (0, exports.size)(findRange(a, (0, exports.min)(b), max(b)));
}
