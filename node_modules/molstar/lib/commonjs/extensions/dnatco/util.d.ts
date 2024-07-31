/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
import { DnatcoTypes } from './types';
import { Segmentation } from '../../mol-data/int';
import { ElementIndex, ResidueIndex, Structure, StructureElement, Unit } from '../../mol-model/structure';
export declare namespace DnatcoUtil {
    type Residue = Segmentation.Segment<ResidueIndex>;
    function copyResidue(r?: Residue): {
        index: ResidueIndex;
        start: number;
        end: number;
    } | undefined;
    function getAtomIndex(loc: StructureElement.Location, residue: Residue, names: string[], altId: string, insCode: string): ElementIndex;
    function getStepIndices(data: DnatcoTypes.Steps, loc: StructureElement.Location, r: DnatcoUtil.Residue): number[];
    function residueAltIds(structure: Structure, unit: Unit, residue: Residue): string[];
    function residueToLoci(asymId: string, seqId: number, altId: string | undefined, insCode: string, loci: StructureElement.Loci, source: 'label' | 'auth'): StructureElement.Loci | {
        kind: "empty-loci";
    };
}
