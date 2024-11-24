/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Unit, ElementIndex, StructureElement, Bond } from '../../../../mol-model/structure';
import { SortedRanges } from '../../../../mol-data/int/sorted-ranges';
import { Interval, SortedArray } from '../../../../mol-data/int';
import { Loci } from '../../../../mol-model/loci';
import { LocationIterator } from '../../../../mol-geo/util/location-iterator';
import { PickingId } from '../../../../mol-geo/geometry/picking';
import { StructureGroup } from './common';
export * from './polymer/backbone';
export * from './polymer/gap-iterator';
export * from './polymer/trace-iterator';
export * from './polymer/curve-segment';
export declare const StandardTension = 0.5;
export declare const HelixTension = 0.9;
export declare const StandardShift = 0.5;
export declare const NucleicShift = 0.3;
export declare const OverhangFactor = 2;
export declare function getPolymerRanges(unit: Unit): SortedRanges<ElementIndex>;
export declare function getGapRanges(unit: Unit): SortedRanges<ElementIndex>;
export declare namespace PolymerLocationIterator {
    function fromGroup(structureGroup: StructureGroup, options?: {
        asSecondary?: boolean;
    }): LocationIterator;
}
export declare namespace PolymerGapLocationIterator {
    function fromGroup(structureGroup: StructureGroup, options?: {
        asSecondary?: boolean;
    }): LocationIterator;
}
/** Return a Loci for the elements of the whole residue of a polymer element. */
export declare function getPolymerElementLoci(pickingId: PickingId, structureGroup: StructureGroup, id: number): Loci;
export declare function eachAtomicUnitTracedElement(offset: number, groupSize: number, elementsSelector: (u: Unit.Atomic) => SortedArray<ElementIndex>, apply: (interval: Interval) => boolean, e: StructureElement.Loci['elements'][0]): boolean;
/** Mark a polymer element (e.g. part of a cartoon trace) */
export declare function eachPolymerElement(loci: Loci, structureGroup: StructureGroup, apply: (interval: Interval) => boolean): boolean;
/** Return a Loci for both directions of the polymer gap element. */
export declare function getPolymerGapElementLoci(pickingId: PickingId, structureGroup: StructureGroup, id: number): Bond.Loci | {
    kind: "empty-loci";
};
export declare function eachPolymerGapElement(loci: Loci, structureGroup: StructureGroup, apply: (interval: Interval) => boolean): boolean;
