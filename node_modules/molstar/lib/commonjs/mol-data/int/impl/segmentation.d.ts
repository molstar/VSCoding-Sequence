/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Iterator } from '../../iterator';
import { OrderedSet } from '../ordered-set';
import { Interval } from '../interval';
import { SortedArray } from '../sorted-array';
import { Segmentation as Segs } from '../segmentation';
interface Segmentation {
    /** Segments stored as a sorted array */
    offsets: SortedArray;
    /** Mapping of values to segments */
    index: Int32Array;
    /** Number of segments */
    count: number;
}
export declare function create(values: ArrayLike<number>): Segmentation;
export declare function ofOffsets(offsets: ArrayLike<number>, bounds: Interval): Segmentation;
/** Get number of segments in a segmentation */
export declare function count({ count }: Segmentation): number;
export declare function getSegment({ index }: Segmentation, value: number): number;
export declare function projectValue({ offsets }: Segmentation, set: OrderedSet, value: number): Interval;
export declare class SegmentIterator<I extends number = number> implements Iterator<Segs.Segment<I>> {
    private segments;
    private segmentMap;
    private set;
    private segmentMin;
    private segmentMax;
    private setRange;
    private value;
    hasNext: boolean;
    move(): Segs.Segment<I>;
    private updateValue;
    private updateSegmentRange;
    setSegment(segment: Segs.Segment<number>): void;
    constructor(segments: SortedArray, segmentMap: Int32Array, set: OrderedSet, inputRange: Interval);
}
export declare function segments(segs: Segmentation, set: OrderedSet, segment?: Segs.Segment): SegmentIterator<number>;
export {};
