"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtomRanges = void 0;
const int_1 = require("../../../mol-data/int");
const array_1 = require("../../../mol-util/array");
exports.AtomRanges = {
    /** Return the number of disjoined ranges in a `AtomRanges` object */
    count(ranges) {
        return ranges.from.length;
    },
    /** Create new `AtomRanges` without any atoms */
    empty() {
        return { from: [], to: [] };
    },
    /** Create new `AtomRanges` containing a single range of atoms `[from, to)` */
    single(from, to) {
        return { from: [from], to: [to] };
    },
    /** Add a range of atoms `[from, to)` to existing `AtomRanges` and return the modified original.
     * The added range must start after the end of the last existing range
     * (if it starts just on the next atom, these two ranges will get merged). */
    add(ranges, from, to) {
        const n = exports.AtomRanges.count(ranges);
        if (n > 0) {
            const lastTo = ranges.to[n - 1];
            if (from < lastTo)
                throw new Error('Overlapping ranges not allowed');
            if (from === lastTo) {
                ranges.to[n - 1] = to;
            }
            else {
                ranges.from.push(from);
                ranges.to.push(to);
            }
        }
        else {
            ranges.from.push(from);
            ranges.to.push(to);
        }
        return ranges;
    },
    /** Apply function `func` to each range in `ranges` */
    foreach(ranges, func) {
        const n = exports.AtomRanges.count(ranges);
        for (let i = 0; i < n; i++)
            func(ranges.from[i], ranges.to[i]);
    },
    /** Apply function `func` to each range in `ranges` and return an array with results */
    map(ranges, func) {
        const n = exports.AtomRanges.count(ranges);
        const result = new Array(n);
        for (let i = 0; i < n; i++)
            result[i] = func(ranges.from[i], ranges.to[i]);
        return result;
    },
    /** Compute the set union of multiple `AtomRanges` objects (as sets of atoms) */
    union(ranges) {
        const concat = exports.AtomRanges.empty();
        for (const r of ranges) {
            (0, array_1.arrayExtend)(concat.from, r.from);
            (0, array_1.arrayExtend)(concat.to, r.to);
        }
        const indices = (0, array_1.range)(concat.from.length).sort((i, j) => concat.from[i] - concat.from[j]); // sort by start of range
        const result = exports.AtomRanges.empty();
        let last = -1;
        for (const i of indices) {
            const from = concat.from[i];
            const to = concat.to[i];
            if (last >= 0 && from <= result.to[last]) {
                if (to > result.to[last]) {
                    result.to[last] = to;
                }
            }
            else {
                result.from.push(from);
                result.to.push(to);
                last++;
            }
        }
        return result;
    },
    /** Return a sorted subset of `atoms` which lie in any of `ranges` (i.e. set intersection of `atoms` and `ranges`).
     * If `out` is provided, use it to store the result (clear any old contents).
     * If `outFirstAtomIndex` is provided, fill `outFirstAtomIndex.value` with the index of the first selected atom (if any). */
    selectAtomsInRanges(atoms, ranges, out, outFirstAtomIndex = {}) {
        var _a, _b;
        out !== null && out !== void 0 ? out : (out = []);
        out.length = 0;
        outFirstAtomIndex.value = undefined;
        const nAtoms = atoms.length;
        const nRanges = exports.AtomRanges.count(ranges);
        if (nAtoms <= nRanges) {
            // Implementation 1 (more efficient when there are fewer atoms)
            let iRange = int_1.SortedArray.findPredecessorIndex(int_1.SortedArray.ofSortedArray(ranges.to), atoms[0] + 1);
            for (let iAtom = 0; iAtom < nAtoms; iAtom++) {
                const a = atoms[iAtom];
                while (iRange < nRanges && ranges.to[iRange] <= a)
                    iRange++;
                const qualifies = iRange < nRanges && ranges.from[iRange] <= a;
                if (qualifies) {
                    out.push(a);
                    (_a = outFirstAtomIndex.value) !== null && _a !== void 0 ? _a : (outFirstAtomIndex.value = iAtom);
                }
            }
        }
        else {
            // Implementation 2 (more efficient when there are fewer ranges)
            for (let iRange = 0; iRange < nRanges; iRange++) {
                const from = ranges.from[iRange];
                const to = ranges.to[iRange];
                for (let iAtom = int_1.SortedArray.findPredecessorIndex(atoms, from); iAtom < nAtoms; iAtom++) {
                    const a = atoms[iAtom];
                    if (a < to) {
                        out.push(a);
                        (_b = outFirstAtomIndex.value) !== null && _b !== void 0 ? _b : (outFirstAtomIndex.value = iAtom);
                    }
                    else {
                        break;
                    }
                }
            }
        }
        return out;
    },
};
