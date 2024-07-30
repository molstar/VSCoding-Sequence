/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { SortedArray } from '../../../mol-data/int';
import { ElementIndex } from '../../../mol-model/structure';
/** Represents a collection of disjoint atom ranges in a model.
 * The number of ranges is `AtomRanges.count(ranges)`,
 * the i-th range covers atoms `[ranges.from[i], ranges.to[i])`. */
export interface AtomRanges {
    from: ElementIndex[];
    to: ElementIndex[];
}
export declare const AtomRanges: {
    /** Return the number of disjoined ranges in a `AtomRanges` object */
    count(ranges: AtomRanges): number;
    /** Create new `AtomRanges` without any atoms */
    empty(): AtomRanges;
    /** Create new `AtomRanges` containing a single range of atoms `[from, to)` */
    single(from: ElementIndex, to: ElementIndex): AtomRanges;
    /** Add a range of atoms `[from, to)` to existing `AtomRanges` and return the modified original.
     * The added range must start after the end of the last existing range
     * (if it starts just on the next atom, these two ranges will get merged). */
    add(ranges: AtomRanges, from: ElementIndex, to: ElementIndex): AtomRanges;
    /** Apply function `func` to each range in `ranges` */
    foreach(ranges: AtomRanges, func: (from: ElementIndex, to: ElementIndex) => any): void;
    /** Apply function `func` to each range in `ranges` and return an array with results */
    map<T>(ranges: AtomRanges, func: (from: ElementIndex, to: ElementIndex) => T): T[];
    /** Compute the set union of multiple `AtomRanges` objects (as sets of atoms) */
    union(ranges: AtomRanges[]): AtomRanges;
    /** Return a sorted subset of `atoms` which lie in any of `ranges` (i.e. set intersection of `atoms` and `ranges`).
     * If `out` is provided, use it to store the result (clear any old contents).
     * If `outFirstAtomIndex` is provided, fill `outFirstAtomIndex.value` with the index of the first selected atom (if any). */
    selectAtomsInRanges(atoms: SortedArray<ElementIndex>, ranges: AtomRanges, out?: ElementIndex[], outFirstAtomIndex?: {
        value?: number;
    }): ElementIndex[];
};
