/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Segmentation, OrderedSet, SortedArray } from '../int';
import { Iterator as _Iterator } from '../iterator';
/** Pairs of min and max indices of sorted, non-overlapping ranges */
type SortedRanges<T extends number = number> = SortedArray<T>;
declare namespace SortedRanges {
    function ofSortedRanges<T extends number = number>(array: ArrayLike<T>): SortedArray<T>;
    function start<T extends number = number>(ranges: SortedRanges<T>): T;
    function end<T extends number = number>(ranges: SortedRanges<T>): number;
    function min<T extends number = number>(ranges: SortedRanges<T>): T;
    function max<T extends number = number>(ranges: SortedRanges<T>): T;
    function size<T extends number = number>(ranges: SortedRanges<T>): number;
    function count<T extends number = number>(ranges: SortedRanges<T>): number;
    function startAt<T extends number = number>(ranges: SortedRanges<T>, index: number): T;
    function endAt<T extends number = number>(ranges: SortedRanges<T>, index: number): number;
    function minAt<T extends number = number>(ranges: SortedRanges<T>, index: number): T;
    function maxAt<T extends number = number>(ranges: SortedRanges<T>, index: number): T;
    function areEqual<T extends number = number>(a: SortedRanges<T>, b: SortedRanges<T>): boolean;
    function forEach<T extends number = number>(ranges: SortedRanges<T>, f: (value: T, i: number) => void): void;
    /** Returns if a value of `set` is included in `ranges` */
    function has<T extends number = number>(ranges: SortedRanges<T>, set: OrderedSet<T>): boolean;
    /** Returns if a value of `set` is included in `ranges` from given index */
    function hasFrom<T extends number = number>(ranges: SortedRanges<T>, set: OrderedSet<T>, from: number): boolean;
    function firstIntersectionIndex<T extends number = number>(ranges: SortedRanges<T>, set: OrderedSet<T>): number;
    function firstIntersectionIndexFrom<T extends number = number>(ranges: SortedRanges<T>, set: OrderedSet<T>, from: number): number;
    function transientSegments<T extends number = number, I extends number = number>(ranges: SortedRanges<T>, set: OrderedSet<T>): Iterator<T, I>;
    class Iterator<T extends number = number, I extends number = number> implements _Iterator<Segmentation.Segment<I>> {
        private ranges;
        private set;
        private value;
        private curIndex;
        hasNext: boolean;
        private updateValue;
        move(): Segmentation.Segment<I>;
        constructor(ranges: SortedRanges<T>, set: OrderedSet<T>);
    }
}
export { SortedRanges };
