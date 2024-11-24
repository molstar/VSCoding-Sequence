"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCoarseRanges = getCoarseRanges;
const int_1 = require("../../../../../mol-data/int");
const sorted_ranges_1 = require("../../../../../mol-data/int/sorted-ranges");
// TODO assumes all coarse elements are part of a polymer
// TODO add gaps at the ends of the chains by comparing to the polymer sequence data
function getCoarseRanges(data, chemicalComponentMap) {
    const polymerRanges = [];
    const gapRanges = [];
    const chainIt = int_1.Segmentation.transientSegments(data.chainElementSegments, int_1.Interval.ofBounds(0, data.count));
    const { seq_id_begin, seq_id_end } = data;
    while (chainIt.hasNext) {
        const { start, end } = chainIt.move();
        let startIndex = -1;
        let prevSeqEnd = -1;
        for (let i = start; i < end; ++i) {
            const seqEnd = seq_id_end.value(i);
            if (i === start) {
                startIndex = i;
                prevSeqEnd = seq_id_end.value(i);
            }
            else {
                if (seq_id_begin.value(i) - prevSeqEnd > 1) {
                    polymerRanges.push(startIndex, i - 1);
                    gapRanges.push(i - 1, i);
                    startIndex = i;
                }
            }
            if (i === end - 1) {
                polymerRanges.push(startIndex, i);
            }
            prevSeqEnd = seqEnd;
        }
    }
    return {
        polymerRanges: sorted_ranges_1.SortedRanges.ofSortedRanges(polymerRanges),
        gapRanges: sorted_ranges_1.SortedRanges.ofSortedRanges(gapRanges)
    };
}
