"use strict";
/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAtomicRanges = getAtomicRanges;
const int_1 = require("../../../../../mol-data/int");
const sorted_ranges_1 = require("../../../../../mol-data/int/sorted-ranges");
const types_1 = require("../../types");
const util_1 = require("../../../util");
const linear_algebra_1 = require("../../../../../mol-math/linear-algebra");
function areBackboneConnected(riStart, riEnd, conformation, index, derived) {
    const { polymerType, traceElementIndex, directionFromElementIndex, directionToElementIndex } = derived.residue;
    const ptStart = polymerType[riStart];
    const ptEnd = polymerType[riEnd];
    if (ptStart === 0 /* PolymerType.NA */ || ptEnd === 0 /* PolymerType.NA */)
        return false;
    if (traceElementIndex[riStart] === -1 || traceElementIndex[riEnd] === -1)
        return false;
    let eiStart = index.findAtomsOnResidue(riStart, (0, util_1.getAtomIdForAtomRole)(ptStart, 'backboneStart'));
    let eiEnd = index.findAtomsOnResidue(riEnd, (0, util_1.getAtomIdForAtomRole)(ptEnd, 'backboneEnd'));
    if (eiStart === -1 || eiEnd === -1) {
        eiStart = index.findAtomsOnResidue(riStart, (0, util_1.getAtomIdForAtomRole)(ptStart, 'coarseBackbone'));
        eiEnd = index.findAtomsOnResidue(riEnd, (0, util_1.getAtomIdForAtomRole)(ptEnd, 'coarseBackbone'));
    }
    const { x, y, z } = conformation;
    const pStart = linear_algebra_1.Vec3.create(x[eiStart], y[eiStart], z[eiStart]);
    const pEnd = linear_algebra_1.Vec3.create(x[eiEnd], y[eiEnd], z[eiEnd]);
    const isCoarse = directionFromElementIndex[riStart] === -1 || directionToElementIndex[riStart] === -1 || directionFromElementIndex[riEnd] === -1 || directionToElementIndex[riEnd] === -1;
    return linear_algebra_1.Vec3.distance(pStart, pEnd) < (isCoarse ? 10 : 3);
}
function getAtomicRanges(hierarchy, entities, conformation, sequence) {
    const polymerRanges = [];
    const gapRanges = [];
    const cyclicPolymerMap = new Map();
    const chainIt = int_1.Segmentation.transientSegments(hierarchy.chainAtomSegments, int_1.Interval.ofBounds(0, hierarchy.atoms._rowCount));
    const residueIt = int_1.Segmentation.transientSegments(hierarchy.residueAtomSegments, int_1.Interval.ofBounds(0, hierarchy.atoms._rowCount));
    const { index, derived } = hierarchy;
    const { label_seq_id } = hierarchy.residues;
    const { label_entity_id } = hierarchy.chains;
    const { moleculeType, traceElementIndex } = derived.residue;
    let prevSeqId;
    let prevStart;
    let prevEnd;
    let startIndex;
    while (chainIt.hasNext) {
        const chainSegment = chainIt.move();
        residueIt.setSegment(chainSegment);
        prevSeqId = -1;
        prevStart = -1;
        prevEnd = -1;
        startIndex = -1;
        const eI = entities.getEntityIndex(label_entity_id.value(chainSegment.index));
        const seq = sequence.byEntityKey[eI];
        const maxSeqId = seq ? seq.sequence.seqId.value(seq.sequence.seqId.rowCount - 1) : -1;
        // check cyclic peptides, seqIds and distance must be compatible
        const riStart = hierarchy.residueAtomSegments.index[chainSegment.start];
        const riEnd = hierarchy.residueAtomSegments.index[chainSegment.end - 1];
        const seqIdStart = label_seq_id.value(riStart);
        const seqIdEnd = label_seq_id.value(riEnd);
        if (seqIdStart === 1 && seqIdEnd === maxSeqId && conformation.xyzDefined && areBackboneConnected(riStart, riEnd, conformation, index, derived)) {
            cyclicPolymerMap.set(riStart, riEnd);
            cyclicPolymerMap.set(riEnd, riStart);
        }
        while (residueIt.hasNext) {
            const residueSegment = residueIt.move();
            const residueIndex = residueSegment.index;
            const seqId = label_seq_id.value(residueIndex);
            // treat polymers residues that don't have a trace element resolved as gaps
            if ((0, types_1.isPolymer)(moleculeType[residueIndex]) && traceElementIndex[residueIndex] !== -1) {
                if (startIndex !== -1) {
                    if (seqId !== prevSeqId + 1) {
                        polymerRanges.push(startIndex, prevEnd - 1);
                        gapRanges.push(prevStart, residueSegment.end - 1);
                        startIndex = residueSegment.start;
                    }
                    else if (!residueIt.hasNext) {
                        polymerRanges.push(startIndex, residueSegment.end - 1);
                        // TODO store terminal gaps
                    }
                    else {
                        const riStart = hierarchy.residueAtomSegments.index[residueSegment.start];
                        const riEnd = hierarchy.residueAtomSegments.index[prevEnd - 1];
                        if (conformation.xyzDefined && !areBackboneConnected(riStart, riEnd, conformation, hierarchy.index, derived)) {
                            polymerRanges.push(startIndex, prevEnd - 1);
                            // add gap even for consecutive residues if they are not connected
                            gapRanges.push(prevStart, residueSegment.end - 1);
                            startIndex = residueSegment.start;
                        }
                    }
                }
                else {
                    startIndex = residueSegment.start; // start polymer
                    // TODO store terminal gaps
                }
            }
            else {
                if (startIndex !== -1) {
                    polymerRanges.push(startIndex, prevEnd - 1);
                    startIndex = -1;
                }
            }
            prevStart = residueSegment.start;
            prevEnd = residueSegment.end;
            prevSeqId = seqId;
        }
    }
    return {
        polymerRanges: sorted_ranges_1.SortedRanges.ofSortedRanges(polymerRanges),
        gapRanges: sorted_ranges_1.SortedRanges.ofSortedRanges(gapRanges),
        cyclicPolymerMap
    };
}
