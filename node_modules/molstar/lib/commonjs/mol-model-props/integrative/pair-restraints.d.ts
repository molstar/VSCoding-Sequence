/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { StructureElement, Unit } from '../../mol-model/structure';
export interface PairRestraint {
    readonly unitA: Unit;
    readonly unitB: Unit;
    readonly indexA: StructureElement.UnitIndex;
    readonly indexB: StructureElement.UnitIndex;
}
export declare class PairRestraints<T extends PairRestraint> {
    pairs: ReadonlyArray<T>;
    readonly count: number;
    private readonly pairKeyIndices;
    /** Indices into this.pairs */
    getPairIndices(indexA: StructureElement.UnitIndex, unitA: Unit, indexB: StructureElement.UnitIndex, unitB: Unit): ReadonlyArray<number>;
    getPairs(indexA: StructureElement.UnitIndex, unitA: Unit, indexB: StructureElement.UnitIndex, unitB: Unit): T[];
    constructor(pairs: ReadonlyArray<T>);
}
