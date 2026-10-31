/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { Unit, ResidueIndex, ElementIndex } from '../../../../mol-model/structure';
import { SortedArray } from '../../../../mol-data/int';
export interface ProteinInfo {
    readonly residueIndices: SortedArray<ResidueIndex>;
    readonly cIndices: ArrayLike<ElementIndex | -1>;
    readonly hIndices: ArrayLike<ElementIndex | -1>;
    readonly oIndices: ArrayLike<ElementIndex | -1>;
    readonly nIndices: ArrayLike<ElementIndex | -1>;
}
export declare function getUnitProteinInfo(unit: Unit.Atomic): ProteinInfo;
