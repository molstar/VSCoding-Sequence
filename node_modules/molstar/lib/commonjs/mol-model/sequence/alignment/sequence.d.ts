/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { StructureElement, Unit } from '../../structure/structure';
import { AlignmentOptions } from './alignment';
export { AlignSequences };
declare namespace AlignSequences {
    type Input = {
        a: StructureElement.Loci.Element;
        b: StructureElement.Loci.Element;
    };
    /** `a` and `b` contain matching pairs, i.e. `a.indices[0]` aligns with `b.indices[0]` */
    type Result = {
        a: StructureElement.Loci.Element;
        b: StructureElement.Loci.Element;
        score: number;
    };
    function createSeqIdIndicesMap(element: StructureElement.Loci.Element): Map<number, StructureElement.UnitIndex[]>;
    function compute(input: Input, options?: Partial<AlignmentOptions>): Result;
}
export declare function entityKey(unit: Unit): import("../../structure").EntityIndex;
export declare function getSequence(unit: Unit): import("../sequence").Sequence;
