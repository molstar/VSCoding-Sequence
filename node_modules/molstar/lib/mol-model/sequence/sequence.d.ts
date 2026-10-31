/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { AminoAlphabet, NuclecicAlphabet } from './constants';
import { Column } from '../../mol-data/db';
type Sequence = Sequence.Protein | Sequence.DNA | Sequence.RNA | Sequence.Generic;
declare namespace Sequence {
    enum Kind {
        Protein = "protein",
        RNA = "RNA",
        DNA = "DNA",
        Generic = "generic"
    }
    interface Base<K extends Kind, Alphabet extends string> {
        readonly kind: K;
        readonly length: number;
        /** One letter code */
        readonly code: Column<Alphabet>;
        readonly label: Column<string>;
        readonly seqId: Column<number>;
        /** Component id */
        readonly compId: Column<string>;
        /** returns index for given seqId */
        readonly index: (seqId: number) => number;
        /** maps seqId to list of compIds */
        readonly microHet: ReadonlyMap<number, string[]>;
    }
    interface Protein extends Base<Kind.Protein, AminoAlphabet> {
    }
    interface RNA extends Base<Kind.RNA, NuclecicAlphabet> {
    }
    interface DNA extends Base<Kind.DNA, NuclecicAlphabet> {
    }
    interface Generic extends Base<Kind.Generic, 'X' | '-'> {
    }
    function getSequenceString(seq: Sequence): string;
    function ofResidueNames(compId: Column<string>, seqId: Column<number>): Sequence;
    function ofSequenceRanges(seqIdBegin: Column<number>, seqIdEnd: Column<number>): Sequence;
}
export { Sequence };
