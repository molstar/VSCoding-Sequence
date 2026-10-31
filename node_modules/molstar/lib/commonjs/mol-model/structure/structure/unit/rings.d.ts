/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Unit } from '../unit';
import { StructureElement } from '../element';
import { SortedArray } from '../../../../mol-data/int';
import { ResidueIndex } from '../../model';
import { ElementSymbol } from '../../model/types';
type UnitRing = SortedArray<StructureElement.UnitIndex>;
declare class UnitRings {
    unit: Unit.Atomic;
    /** Each ring is specified as an array of indices in Unit.elements. */
    readonly all: ReadonlyArray<UnitRing>;
    private _byFingerprint?;
    private _index?;
    private _aromaticRings?;
    private get index();
    get byFingerprint(): ReadonlyMap<UnitRing.Fingerprint, readonly UnitRings.Index[]>;
    /** Maps atom index inside a Unit to ring indices (an atom can be part of more than one ring) */
    get elementRingIndices(): ReadonlyMap<StructureElement.UnitIndex, UnitRings.Index[]>;
    get elementAromaticRingIndices(): ReadonlyMap<StructureElement.UnitIndex, UnitRings.Index[]>;
    /** Maps UnitRings.Index to index to ringComponents */
    get ringComponentIndex(): readonly UnitRings.ComponentIndex[];
    get ringComponents(): readonly (readonly UnitRings.Index[])[];
    get aromaticRings(): readonly UnitRings.Index[];
    constructor(all: ReadonlyArray<UnitRing>, unit: Unit.Atomic);
}
declare namespace UnitRing {
    type Fingerprint = {
        readonly '@type': 'unit-ring-fingerprint';
    } & string;
    function fingerprint(unit: Unit.Atomic, ring: UnitRing): Fingerprint;
    function elementFingerprint(elements: ArrayLike<ElementSymbol>): Fingerprint;
    function isAromatic(unit: Unit.Atomic, ring: UnitRing): boolean;
    /** Get the alternate location of the 1st non '' alt loc atom. */
    function getAltId(unit: Unit.Atomic, ring: UnitRing): string;
}
declare namespace UnitRings {
    /** Index into UnitRings.all */
    type Index = {
        readonly '@type': 'unit-ring-index';
    } & number;
    type ComponentIndex = {
        readonly '@type': 'unit-ring-component-index';
    } & number;
    function create(unit: Unit.Atomic): UnitRings;
    /** Creates a mapping ResidueIndex -> list or rings that are on that residue and have one of the specified fingerprints. */
    function byFingerprintAndResidue(rings: UnitRings, fingerprints: ReadonlyArray<UnitRing.Fingerprint>): Map<ResidueIndex, Index[]>;
}
export { UnitRing, UnitRings };
