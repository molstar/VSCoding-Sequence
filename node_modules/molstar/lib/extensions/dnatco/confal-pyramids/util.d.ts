/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
import { ElementIndex, Structure, Unit } from '../../../mol-model/structure';
export type Pyramid = {
    O3: ElementIndex;
    P: ElementIndex;
    OP1: ElementIndex;
    OP2: ElementIndex;
    O5: ElementIndex;
    confalScore: number;
    stepIdx: number;
};
export declare class ConfalPyramidsIterator {
    private chainIt;
    private residueIt;
    private residueOne?;
    private residueTwo;
    private data?;
    private loc;
    private moveStep;
    private toPyramids;
    constructor(structure: Structure, unit: Unit);
    get hasNext(): boolean;
    move(): Pyramid[] | undefined;
}
