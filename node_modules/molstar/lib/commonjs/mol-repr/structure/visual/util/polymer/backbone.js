"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eachPolymerBackboneLink = eachPolymerBackboneLink;
exports.eachPolymerBackboneElement = eachPolymerBackboneElement;
exports.eachAtomicPolymerBackboneElement = eachAtomicPolymerBackboneElement;
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
const int_1 = require("../../../../../mol-data/int");
const sorted_ranges_1 = require("../../../../../mol-data/int/sorted-ranges");
const polymer_1 = require("../polymer");
function eachPolymerBackboneLink(unit, callback) {
    switch (unit.kind) {
        case 0 /* Unit.Kind.Atomic */: return eachAtomicPolymerBackboneLink(unit, callback);
        case 1 /* Unit.Kind.Spheres */:
        case 2 /* Unit.Kind.Gaussians */:
            return eachCoarsePolymerBackboneLink(unit, callback);
    }
}
function eachAtomicPolymerBackboneLink(unit, callback) {
    const cyclicPolymerMap = unit.model.atomicRanges.cyclicPolymerMap;
    const polymerIt = sorted_ranges_1.SortedRanges.transientSegments((0, polymer_1.getPolymerRanges)(unit), unit.elements);
    const residueIt = int_1.Segmentation.transientSegments(unit.model.atomicHierarchy.residueAtomSegments, unit.elements);
    const traceElementIndex = unit.model.atomicHierarchy.derived.residue.traceElementIndex; // can assume it won't be -1 for polymer residues
    const { moleculeType } = unit.model.atomicHierarchy.derived.residue;
    let indexA = -1;
    let indexB = -1;
    let isFirst = true;
    let firstGroup = -1;
    let i = 0;
    while (polymerIt.hasNext) {
        isFirst = true;
        firstGroup = i;
        residueIt.setSegment(polymerIt.move());
        while (residueIt.hasNext) {
            if (isFirst) {
                const index_1 = residueIt.move().index;
                ++i;
                if (!residueIt.hasNext)
                    continue;
                isFirst = false;
                indexB = index_1;
            }
            const index = residueIt.move().index;
            indexA = indexB;
            indexB = index;
            callback(traceElementIndex[indexA], traceElementIndex[indexB], i - 1, i, moleculeType[indexA]);
            ++i;
        }
        if (cyclicPolymerMap.has(indexB)) {
            indexA = indexB;
            indexB = cyclicPolymerMap.get(indexA);
            callback(traceElementIndex[indexA], traceElementIndex[indexB], i - 1, firstGroup, moleculeType[indexA]);
        }
    }
}
function eachCoarsePolymerBackboneLink(unit, callback) {
    const polymerIt = sorted_ranges_1.SortedRanges.transientSegments((0, polymer_1.getPolymerRanges)(unit), unit.elements);
    const { elements } = unit;
    let isFirst = true;
    let i = 0;
    while (polymerIt.hasNext) {
        isFirst = true;
        const _a = polymerIt.move(), start = _a.start, end = _a.end;
        for (let j = start, jl = end; j < jl; ++j) {
            if (isFirst) {
                ++j;
                ++i;
                if (j > jl)
                    continue;
                isFirst = false;
            }
            callback(elements[j - 1], elements[j], i - 1, i, 0 /* Unknown */);
            ++i;
        }
    }
}
function eachPolymerBackboneElement(unit, callback) {
    switch (unit.kind) {
        case 0 /* Unit.Kind.Atomic */: return eachAtomicPolymerBackboneElement(unit, callback);
        case 1 /* Unit.Kind.Spheres */:
        case 2 /* Unit.Kind.Gaussians */:
            return eachCoarsePolymerBackboneElement(unit, callback);
    }
}
function eachAtomicPolymerBackboneElement(unit, callback) {
    const polymerIt = sorted_ranges_1.SortedRanges.transientSegments((0, polymer_1.getPolymerRanges)(unit), unit.elements);
    const residueIt = int_1.Segmentation.transientSegments(unit.model.atomicHierarchy.residueAtomSegments, unit.elements);
    const traceElementIndex = unit.model.atomicHierarchy.derived.residue.traceElementIndex; // can assume it won't be -1 for polymer residues
    let i = 0;
    while (polymerIt.hasNext) {
        residueIt.setSegment(polymerIt.move());
        while (residueIt.hasNext) {
            const index = residueIt.move().index;
            callback(traceElementIndex[index], i);
            ++i;
        }
    }
}
function eachCoarsePolymerBackboneElement(unit, callback) {
    const polymerIt = sorted_ranges_1.SortedRanges.transientSegments((0, polymer_1.getPolymerRanges)(unit), unit.elements);
    const { elements } = unit;
    let i = 0;
    while (polymerIt.hasNext) {
        const _a = polymerIt.move(), start = _a.start, end = _a.end;
        for (let j = start, jl = end; j < jl; ++j) {
            callback(elements[j], i);
            ++i;
        }
    }
}
