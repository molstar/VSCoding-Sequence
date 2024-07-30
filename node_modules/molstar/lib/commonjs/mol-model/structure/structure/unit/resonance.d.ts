/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { SortedArray } from '../../../../mol-data/int/sorted-array';
import { StructureElement } from '../element';
import { Unit } from '../unit';
export type UnitResonance = {
    /**
     * Lookup for triplets of atoms in delocalized bonds.
     *
     * Does not include triplets that are part of aromatic rings.
     */
    readonly delocalizedTriplets: {
        /** Return 3rd element in triplet or undefined if `a` and `b` are not part of a triplet */
        readonly getThirdElement: (a: StructureElement.UnitIndex, b: StructureElement.UnitIndex) => StructureElement.UnitIndex | undefined;
        /** Return index into `triplets` or undefined if `a` is not part of any triplet */
        readonly getTripletIndices: (a: StructureElement.UnitIndex) => number[] | undefined;
        readonly triplets: SortedArray<StructureElement.UnitIndex>[];
    };
};
export declare function getResonance(unit: Unit.Atomic): UnitResonance;
