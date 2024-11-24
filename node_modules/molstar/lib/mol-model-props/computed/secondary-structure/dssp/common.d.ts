/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { BitFlags } from '../../../../mol-util';
import { SecondaryStructureType } from '../../../../mol-model/structure/model/types';
import { IntAdjacencyGraph } from '../../../../mol-math/graph';
import { Unit } from '../../../../mol-model/structure/structure';
import { ProteinInfo } from './protein-info';
export interface DSSPContext {
    params: {
        oldDefinition: boolean;
        oldOrdering: boolean;
    };
    getResidueFlag: (f: DSSPType) => SecondaryStructureType;
    getFlagName: (f: DSSPType) => string;
    unit: Unit.Atomic;
    proteinInfo: ProteinInfo;
    /** flags for each residue */
    flags: Uint32Array;
    hbonds: DsspHbonds;
    torsionAngles: {
        phi: Float32Array;
        psi: Float32Array;
    };
    ladders: Ladder[];
    bridges: Bridge[];
}
export { DSSPType };
type DSSPType = BitFlags<DSSPType.Flag>;
declare namespace DSSPType {
    const is: (t: DSSPType, f: Flag) => boolean;
    const create: (f: Flag) => DSSPType;
    const enum Flag {
        _ = 0,
        H = 1,
        B = 2,
        E = 4,
        G = 8,
        I = 16,
        S = 32,
        T = 64,
        T3 = 128,
        T4 = 256,
        T5 = 512,
        T3S = 1024,// marks 3-turn start
        T4S = 2048,
        T5S = 4096
    }
}
export type DsspHbonds = IntAdjacencyGraph<number, {
    readonly energies: ArrayLike<number>;
}>;
export interface Ladder {
    previousLadder: number;
    nextLadder: number;
    firstStart: number;
    secondStart: number;
    secondEnd: number;
    firstEnd: number;
    type: BridgeType;
}
export declare const enum BridgeType {
    PARALLEL = 0,
    ANTI_PARALLEL = 1
}
export declare class Bridge {
    partner1: number;
    partner2: number;
    type: BridgeType;
    constructor(p1: number, p2: number, type: BridgeType);
}
