"use strict";
/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAtomicPolymerElements = getAtomicPolymerElements;
exports.getCoarsePolymerElements = getCoarsePolymerElements;
exports.getAtomicGapElements = getAtomicGapElements;
exports.getCoarseGapElements = getCoarseGapElements;
exports.getNucleotideElements = getNucleotideElements;
exports.getProteinElements = getProteinElements;
const structure_1 = require("../../../../mol-model/structure");
const int_1 = require("../../../../mol-data/int");
const sorted_ranges_1 = require("../../../../mol-data/int/sorted-ranges");
const types_1 = require("../../../../mol-model/structure/model/types");
function getAtomicPolymerElements(unit) {
    const indices = [];
    const { elements, model } = unit;
    const { residueAtomSegments } = unit.model.atomicHierarchy;
    const { traceElementIndex } = model.atomicHierarchy.derived.residue;
    const polymerIt = sorted_ranges_1.SortedRanges.transientSegments(unit.model.atomicRanges.polymerRanges, elements);
    const residueIt = int_1.Segmentation.transientSegments(residueAtomSegments, elements);
    while (polymerIt.hasNext) {
        const polymerSegment = polymerIt.move();
        residueIt.setSegment(polymerSegment);
        while (residueIt.hasNext) {
            const residueSegment = residueIt.move();
            const { start, end, index } = residueSegment;
            if (int_1.OrderedSet.areIntersecting(int_1.Interval.ofRange(elements[start], elements[end - 1]), elements)) {
                const elementIndex = traceElementIndex[index];
                indices.push(elementIndex === -1 ? residueAtomSegments.offsets[index] : elementIndex);
            }
        }
    }
    return int_1.SortedArray.ofSortedArray(indices);
}
function getCoarsePolymerElements(unit) {
    const indices = [];
    const { elements, model } = unit;
    const { spheres, gaussians } = model.coarseHierarchy;
    const polymerRanges = structure_1.Unit.isSpheres(unit) ? spheres.polymerRanges : gaussians.polymerRanges;
    const polymerIt = sorted_ranges_1.SortedRanges.transientSegments(polymerRanges, elements);
    while (polymerIt.hasNext) {
        const { start, end } = polymerIt.move();
        for (let i = start; i < end; ++i) {
            indices.push(elements[i]);
        }
    }
    return int_1.SortedArray.ofSortedArray(indices);
}
//
function getAtomicGapElements(unit) {
    const indices = [];
    const { elements, model, residueIndex } = unit;
    const { residueAtomSegments } = unit.model.atomicHierarchy;
    const { traceElementIndex } = model.atomicHierarchy.derived.residue;
    const gapIt = sorted_ranges_1.SortedRanges.transientSegments(unit.model.atomicRanges.gapRanges, unit.elements);
    while (gapIt.hasNext) {
        const gapSegment = gapIt.move();
        const indexStart = residueIndex[elements[gapSegment.start]];
        const indexEnd = residueIndex[elements[gapSegment.end - 1]];
        const elementIndexStart = traceElementIndex[indexStart];
        const elementIndexEnd = traceElementIndex[indexEnd];
        indices.push(elementIndexStart === -1 ? residueAtomSegments.offsets[indexStart] : elementIndexStart);
        indices.push(elementIndexEnd === -1 ? residueAtomSegments.offsets[indexEnd] : elementIndexEnd);
    }
    return int_1.SortedArray.ofSortedArray(indices);
}
function getCoarseGapElements(unit) {
    const indices = [];
    const { elements, model } = unit;
    const { spheres, gaussians } = model.coarseHierarchy;
    const gapRanges = structure_1.Unit.isSpheres(unit) ? spheres.gapRanges : gaussians.gapRanges;
    const gapIt = sorted_ranges_1.SortedRanges.transientSegments(gapRanges, elements);
    while (gapIt.hasNext) {
        const { start, end } = gapIt.move();
        indices.push(elements[start], elements[end - 1]);
    }
    return int_1.SortedArray.ofSortedArray(indices);
}
//
function getNucleotideElements(unit) {
    const indices = [];
    const { elements, model } = unit;
    const { chainAtomSegments, residueAtomSegments } = model.atomicHierarchy;
    const { moleculeType, traceElementIndex } = model.atomicHierarchy.derived.residue;
    const chainIt = int_1.Segmentation.transientSegments(chainAtomSegments, elements);
    const residueIt = int_1.Segmentation.transientSegments(residueAtomSegments, elements);
    while (chainIt.hasNext) {
        residueIt.setSegment(chainIt.move());
        while (residueIt.hasNext) {
            const { index } = residueIt.move();
            if ((0, types_1.isNucleic)(moleculeType[index])) {
                const elementIndex = traceElementIndex[index];
                indices.push(elementIndex === -1 ? residueAtomSegments.offsets[index] : elementIndex);
            }
        }
    }
    return int_1.SortedArray.ofSortedArray(indices);
}
function getProteinElements(unit) {
    const indices = [];
    const { elements, model } = unit;
    const { chainAtomSegments, residueAtomSegments } = model.atomicHierarchy;
    const { moleculeType, traceElementIndex } = model.atomicHierarchy.derived.residue;
    const chainIt = int_1.Segmentation.transientSegments(chainAtomSegments, elements);
    const residueIt = int_1.Segmentation.transientSegments(residueAtomSegments, elements);
    while (chainIt.hasNext) {
        residueIt.setSegment(chainIt.move());
        while (residueIt.hasNext) {
            const { index } = residueIt.move();
            if ((0, types_1.isProtein)(moleculeType[index])) {
                const elementIndex = traceElementIndex[index];
                indices.push(elementIndex === -1 ? residueAtomSegments.offsets[index] : elementIndex);
            }
        }
    }
    return int_1.SortedArray.ofSortedArray(indices);
}
