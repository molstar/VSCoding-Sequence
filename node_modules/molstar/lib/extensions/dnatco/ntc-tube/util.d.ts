/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
import { Vec3 } from '../../../mol-math/linear-algebra';
import { Structure, Unit } from '../../../mol-model/structure';
export type NtCTubeSegment = {
    p_1: Vec3;
    p0: Vec3;
    p1: Vec3;
    p2: Vec3;
    p3: Vec3;
    p4: Vec3;
    pP: Vec3;
    stepIdx: number;
    followsGap: boolean;
    firstInChain: boolean;
    capEnd: boolean;
};
export declare class NtCTubeSegmentsIterator {
    private chainIt;
    private residueIt;
    private residuePrev?;
    private residueOne?;
    private residueTwo;
    private residueNext?;
    private data?;
    private altIdOne;
    private insCodeOne;
    private loc;
    private moveStep;
    private prime;
    private toSegment;
    constructor(structure: Structure, unit: Unit.Atomic);
    get hasNext(): boolean;
    move(): NtCTubeSegment | undefined;
}
