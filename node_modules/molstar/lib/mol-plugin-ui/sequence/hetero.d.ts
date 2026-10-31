/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { StructureElement } from '../../mol-model/structure';
import { SequenceWrapper, StructureUnit } from './wrapper';
import { Loci } from '../../mol-model/loci';
import { MarkerAction } from '../../mol-util/marker-action';
export declare class HeteroSequenceWrapper extends SequenceWrapper<StructureUnit> {
    private readonly unitMap;
    private readonly sequence;
    private readonly sequenceIndices;
    private readonly residueIndices;
    private readonly seqToUnit;
    residueLabel(seqIdx: number): string;
    residueColor(seqIdx: number): import("../../mol-util/color").Color;
    residueClass(seqIdx: number): string;
    mark(loci: Loci, action: MarkerAction): boolean;
    getLoci(seqIdx: number): StructureElement.Loci;
    constructor(data: StructureUnit);
}
