/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { OrderedSet } from '../ordered-set';
import { Interval } from '../interval';
import { SortedArray } from '../sorted-array';
export function create(values) {
    const offsets = SortedArray.ofSortedArray(values);
    const max = SortedArray.max(offsets);
    const index = new Int32Array(max);
    for (let i = 0, _i = values.length - 1; i < _i; i++) {
        for (let j = values[i], _j = values[i + 1]; j < _j; j++) {
            index[j] = i;
        }
    }
    return { offsets, index, count: values.length - 1 };
}
export function ofOffsets(offsets, bounds) {
    const s = Interval.start(bounds);
    const segments = new Int32Array(offsets.length + 1);
    for (let i = 0, _i = offsets.length; i < _i; i++) {
        segments[i] = offsets[i] - s;
    }
    segments[offsets.length] = Interval.end(bounds) - s;
    return create(segments);
}
/** Get number of segments in a segmentation */
export function count({ count }) { return count; }
export function getSegment({ index }, value) { return index[value]; }
export function projectValue({ offsets }, set, value) {
    const last = OrderedSet.max(offsets);
    const idx = value >= last ? -1 : OrderedSet.findPredecessorIndex(offsets, value - 1);
    return OrderedSet.findRange(set, OrderedSet.getAt(offsets, idx), OrderedSet.getAt(offsets, idx + 1) - 1);
}
export class SegmentIterator {
    move() {
        while (this.hasNext) {
            if (this.updateValue()) {
                this.value.index = this.segmentMin++;
                this.hasNext = this.segmentMax >= this.segmentMin && Interval.size(this.setRange) > 0;
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
        const setEnd = OrderedSet.findPredecessorIndexInInterval(this.set, segmentEnd, this.setRange);
        this.value.start = Interval.start(this.setRange);
        this.value.end = setEnd;
        this.setRange = Interval.ofBounds(setEnd, Interval.end(this.setRange));
        return setEnd > this.value.start;
    }
    updateSegmentRange() {
        const sMin = Interval.min(this.setRange), sMax = Interval.max(this.setRange);
        if (sMax < sMin) {
            this.hasNext = false;
            return;
        }
        this.segmentMin = this.segmentMap[OrderedSet.getAt(this.set, sMin)];
        this.segmentMax = this.segmentMap[OrderedSet.getAt(this.set, sMax)];
        this.hasNext = this.segmentMax >= this.segmentMin;
    }
    setSegment(segment) {
        this.setRange = Interval.ofBounds(segment.start, segment.end);
        this.updateSegmentRange();
    }
    constructor(segments, segmentMap, set, inputRange) {
        this.segments = segments;
        this.segmentMap = segmentMap;
        this.set = set;
        this.segmentMin = 0;
        this.segmentMax = 0;
        this.setRange = Interval.Empty;
        this.value = { index: 0, start: 0, end: 0 };
        this.hasNext = false;
        this.setRange = inputRange;
        this.updateSegmentRange();
    }
}
export function segments(segs, set, segment) {
    const int = typeof segment !== 'undefined' ? Interval.ofBounds(segment.start, segment.end) : Interval.ofBounds(0, OrderedSet.size(set));
    return new SegmentIterator(segs.offsets, segs.index, set, int);
}
