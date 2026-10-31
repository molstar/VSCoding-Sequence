"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoarsePolymerGapIterator = exports.AtomicPolymerGapIterator = void 0;
exports.PolymerGapIterator = PolymerGapIterator;
const structure_1 = require("../../../../../mol-model/structure");
const sorted_ranges_1 = require("../../../../../mol-data/int/sorted-ranges");
const polymer_1 = require("../polymer");
/** Iterates over gaps, i.e. the stem residues/coarse elements adjacent to gaps */
function PolymerGapIterator(structure, unit) {
    switch (unit.kind) {
        case 0 /* Unit.Kind.Atomic */: return new AtomicPolymerGapIterator(structure, unit);
        case 1 /* Unit.Kind.Spheres */:
        case 2 /* Unit.Kind.Gaussians */:
            return new CoarsePolymerGapIterator(structure, unit);
    }
}
function createPolymerGapPair(structure, unit) {
    return {
        centerA: structure_1.StructureElement.Location.create(structure, unit),
        centerB: structure_1.StructureElement.Location.create(structure, unit),
    };
}
class AtomicPolymerGapIterator {
    move() {
        const { elements, residueIndex } = this.unit;
        const gapSegment = this.gapIt.move();
        this.value.centerA.element = this.traceElementIndex[residueIndex[elements[gapSegment.start]]];
        this.value.centerB.element = this.traceElementIndex[residueIndex[elements[gapSegment.end - 1]]];
        this.hasNext = this.gapIt.hasNext;
        return this.value;
    }
    constructor(structure, unit) {
        this.unit = unit;
        this.hasNext = false;
        this.traceElementIndex = unit.model.atomicHierarchy.derived.residue.traceElementIndex; // can assume it won't be -1 for polymer residues
        this.gapIt = sorted_ranges_1.SortedRanges.transientSegments((0, polymer_1.getGapRanges)(unit), unit.elements);
        this.value = createPolymerGapPair(structure, unit);
        this.hasNext = this.gapIt.hasNext;
    }
}
exports.AtomicPolymerGapIterator = AtomicPolymerGapIterator;
class CoarsePolymerGapIterator {
    move() {
        const gapSegment = this.gapIt.move();
        this.value.centerA.element = this.unit.elements[gapSegment.start];
        this.value.centerB.element = this.unit.elements[gapSegment.end - 1];
        this.hasNext = this.gapIt.hasNext;
        return this.value;
    }
    constructor(structure, unit) {
        this.unit = unit;
        this.hasNext = false;
        this.gapIt = sorted_ranges_1.SortedRanges.transientSegments((0, polymer_1.getGapRanges)(unit), unit.elements);
        this.value = createPolymerGapPair(structure, unit);
        this.hasNext = this.gapIt.hasNext;
    }
}
exports.CoarsePolymerGapIterator = CoarsePolymerGapIterator;
