/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Interval } from './interval';
import { OrderedSet } from './ordered-set';
import * as Impl from './impl/segmentation';
declare namespace Segmentation {
    interface Segment<I extends number = number> {
        index: I;
        start: number;
        end: number;
    }
    const create: <T extends number = number, I extends number = number>(segs: ArrayLike<T>) => Segmentation<T, I>;
    const ofOffsets: <T extends number = number, I extends number = number>(offsets: ArrayLike<T>, bounds: Interval) => Segmentation<T, I>;
    const count: <T extends number = number, I extends number = number>(segs: Segmentation<T, I>) => number;
    const getSegment: <T extends number = number, I extends number = number>(segs: Segmentation<T, I>, value: T) => number;
    const projectValue: <T extends number = number, I extends number = number>(segs: Segmentation<T, I>, set: OrderedSet<T>, value: T) => Interval;
    /** Segment iterator that mutates a single segment object to mark all the segments. */
    const transientSegments: <T extends number = number, I extends number = number>(segs: Segmentation<T, I>, set: OrderedSet<T>, segment?: Segment) => Impl.SegmentIterator<I>;
    type SegmentIterator<I extends number = number> = Impl.SegmentIterator<I>;
}
interface Segmentation<T extends number = number, I extends number = number> {
    '@type': 'segmentation';
    /** All segments are defined by offsets [offsets[i], offsets[i + 1]) for i \in [0, count - 1] */
    readonly offsets: ArrayLike<T>;
    /** Segment index of the i-th element */
    readonly index: ArrayLike<I>;
    readonly count: number;
}
export { Segmentation };
