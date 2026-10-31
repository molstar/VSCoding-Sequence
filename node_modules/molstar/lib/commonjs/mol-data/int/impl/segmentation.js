"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SegmentIterator = void 0;
exports.create = create;
exports.ofOffsets = ofOffsets;
exports.count = count;
exports.getSegment = getSegment;
exports.projectValue = projectValue;
exports.segments = segments;
const ordered_set_1 = require("../ordered-set");
const interval_1 = require("../interval");
const sorted_array_1 = require("../sorted-array");
function create(values) {
    const offsets = sorted_array_1.SortedArray.ofSortedArray(values);
    const max = sorted_array_1.SortedArray.max(offsets);
    const index = new Int32Array(max);
    for (let i = 0, _i = values.length - 1; i < _i; i++) {
        for (let j = values[i], _j = values[i + 1]; j < _j; j++) {
            index[j] = i;
        }
    }
    return { offsets, index, count: values.length - 1 };
}
function ofOffsets(offsets, bounds) {
    const s = interval_1.Interval.start(bounds);
    const segments = new Int32Array(offsets.length + 1);
    for (let i = 0, _i = offsets.length; i < _i; i++) {
        segments[i] = offsets[i] - s;
    }
    segments[offsets.length] = interval_1.Interval.end(bounds) - s;
    return create(segments);
}
/** Get number of segments in a segmentation */
function count({ count }) { return count; }
function getSegment({ index }, value) { return index[value]; }
function projectValue({ offsets }, set, value) {
    const last = ordered_set_1.OrderedSet.max(offsets);
    const idx = value >= last ? -1 : ordered_set_1.OrderedSet.findPredecessorIndex(offsets, value - 1);
    return ordered_set_1.OrderedSet.findRange(set, ordered_set_1.OrderedSet.getAt(offsets, idx), ordered_set_1.OrderedSet.getAt(offsets, idx + 1) - 1);
}
class SegmentIterator {
    move() {
        while (this.hasNext) {
            if (this.updateValue()) {
                this.value.index = this.segmentMin++;
                this.hasNext = this.segmentMax >= this.segmentMin && interval_1.Interval.size(this.setRange) > 0;
                break;
            }
            else {
                this.updateSegmentRange();
            }
        }
        return this.value;
    }
    updateValue() {
        const segmentEnd = this.segments[this.segmentMin + 1];
        // TODO: add optimized version for interval and array?
        const setEnd = ordered_set_1.OrderedSet.findPredecessorIndexInInterval(this.set, segmentEnd, this.setRange);
        this.value.start = interval_1.Interval.start(this.setRange);
        this.value.end = setEnd;
        this.setRange = interval_1.Interval.ofBounds(setEnd, interval_1.Interval.end(this.setRange));
        return setEnd > this.value.start;
    }
    updateSegmentRange() {
        const sMin = interval_1.Interval.min(this.setRange), sMax = interval_1.Interval.max(this.setRange);
        if (sMax < sMin) {
            this.hasNext = false;
            return;
        }
        this.segmentMin = this.segmentMap[ordered_set_1.OrderedSet.getAt(this.set, sMin)];
        this.segmentMax = this.segmentMap[ordered_set_1.OrderedSet.getAt(this.set, sMax)];
        this.hasNext = this.segmentMax >= this.segmentMin;
    }
    setSegment(segment) {
        this.setRange = interval_1.Interval.ofBounds(segment.start, segment.end);
        this.updateSegmentRange();
    }
    constructor(segments, segmentMap, set, inputRange) {
        this.segments = segments;
        this.segmentMap = segmentMap;
        this.set = set;
        this.segmentMin = 0;
        this.segmentMax = 0;
        this.setRange = interval_1.Interval.Empty;
        this.value = { index: 0, start: 0, end: 0 };
        this.hasNext = false;
        this.setRange = inputRange;
        this.updateSegmentRange();
    }
}
exports.SegmentIterator = SegmentIterator;
function segments(segs, set, segment) {
    const int = typeof segment !== 'undefined' ? interval_1.Interval.ofBounds(segment.start, segment.end) : interval_1.Interval.ofBounds(0, ordered_set_1.OrderedSet.size(set));
    return new SegmentIterator(segs.offsets, segs.index, set, int);
}
