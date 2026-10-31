/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { StructureElement } from '../../../../../mol-model/structure';
import { SortedRanges } from '../../../../../mol-data/int/sorted-ranges';
import { getGapRanges } from '../polymer';
/** Iterates over gaps, i.e. the stem residues/coarse elements adjacent to gaps */
export function PolymerGapIterator(structure, unit) {
    switch (unit.kind) {
        case 0 /* Unit.Kind.Atomic */: return new AtomicPolymerGapIterator(structure, unit);
        case 1 /* Unit.Kind.Spheres */:
        case 2 /* Unit.Kind.Gaussians */:
            return new CoarsePolymerGapIterator(structure, unit);
    }
}
function createPolymerGapPair(structure, unit) {
    return {
        centerA: StructureElement.Location.create(structure, unit),
        centerB: StructureElement.Location.create(structure, unit),
    };
}
export class AtomicPolymerGapIterator {
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
        this.gapIt = SortedRanges.transientSegments(getGapRanges(unit), unit.elements);
        this.value = createPolymerGapPair(structure, unit);
        this.hasNext = this.gapIt.hasNext;
    }
}
export class CoarsePolymerGapIterator {
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
        this.gapIt = SortedRanges.transientSegments(getGapRanges(unit), unit.elements);
        this.value = createPolymerGapPair(structure, unit);
        this.hasNext = this.gapIt.hasNext;
    }
}
