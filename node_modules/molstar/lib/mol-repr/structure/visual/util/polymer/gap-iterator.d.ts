/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Unit, StructureElement, Structure } from '../../../../../mol-model/structure';
import { Iterator } from '../../../../../mol-data/iterator';
/** Iterates over gaps, i.e. the stem residues/coarse elements adjacent to gaps */
export declare function PolymerGapIterator(structure: Structure, unit: Unit): Iterator<PolymerGapPair>;
interface PolymerGapPair {
    centerA: StructureElement.Location;
    centerB: StructureElement.Location;
}
export declare class AtomicPolymerGapIterator implements Iterator<PolymerGapPair> {
    private unit;
    private traceElementIndex;
    private value;
    private gapIt;
    hasNext: boolean;
    move(): PolymerGapPair;
    constructor(structure: Structure, unit: Unit.Atomic);
}
export declare class CoarsePolymerGapIterator implements Iterator<PolymerGapPair> {
    private unit;
    private value;
    private gapIt;
    hasNext: boolean;
    move(): PolymerGapPair;
    constructor(structure: Structure, unit: Unit.Spheres | Unit.Gaussians);
}
export {};
