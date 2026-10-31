"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeBuckets = makeBuckets;
const sort_1 = require("./sort");
function sortAsc(bs, i, j) { return bs[i].key < bs[j].key ? -1 : 1; }
function _makeBuckets(indices, getKey, sortBuckets, start, end) {
    const buckets = new Map();
    const bucketList = [];
    let prevKey = getKey(indices[0]);
    let isBucketed = true;
    for (let i = start; i < end; i++) {
        const key = getKey(indices[i]);
        if (buckets.has(key)) {
            buckets.get(key).count++;
            if (prevKey !== key)
                isBucketed = false;
        }
        else {
            const bucket = { key, count: 1, offset: i };
            buckets.set(key, bucket);
            bucketList[bucketList.length] = bucket;
        }
        prevKey = key;
    }
    const bucketOffsets = new Int32Array(bucketList.length + 1);
    bucketOffsets[bucketList.length] = end;
    let sorted = true;
    if (sortBuckets) {
        for (let i = 1, _i = bucketList.length; i < _i; i++) {
            if (bucketList[i - 1].key > bucketList[i].key) {
                sorted = false;
                break;
            }
        }
    }
    if (isBucketed && sorted) {
        for (let i = 0; i < bucketList.length; i++)
            bucketOffsets[i] = bucketList[i].offset;
        return bucketOffsets;
    }
    if (sortBuckets && !sorted) {
        (0, sort_1.sort)(bucketList, 0, bucketList.length, sortAsc, sort_1.arraySwap);
    }
    let offset = 0;
    for (let i = 0; i < bucketList.length; i++) {
        const b = bucketList[i];
        b.offset = offset;
        offset += b.count;
    }
    const reorderedIndices = new Int32Array(end - start);
    for (let i = start; i < end; i++) {
        const key = getKey(indices[i]);
        const bucket = buckets.get(key);
        reorderedIndices[bucket.offset++] = indices[i];
    }
    for (let i = 0, _i = reorderedIndices.length; i < _i; i++) {
        indices[i + start] = reorderedIndices[i];
    }
    bucketOffsets[0] = start;
    for (let i = 1; i < bucketList.length; i++)
        bucketOffsets[i] = bucketList[i - 1].offset + start;
    return bucketOffsets;
}
/**
 * Reorders indices so that the same keys are next to each other, [start, end)
 * Returns the offsets of buckets. So that [offsets[i], offsets[i + 1]) determines the range.
 */
function makeBuckets(indices, getKey, options) {
    const s = (options && options.start) || 0;
    const e = (options && options.end) || indices.length;
    if (e - s <= 0)
        throw new Error('Can only bucket non-empty collections.');
    return _makeBuckets(indices, getKey, !!(options && options.sort), s, e);
}
