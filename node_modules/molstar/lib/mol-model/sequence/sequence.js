/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { getProteinOneLetterCode, getRnaOneLetterCode, getDnaOneLetterCode } from './constants';
import { Column } from '../../mol-data/db';
import { assertUnreachable } from '../../mol-util/type-helpers';
var Sequence;
(function (Sequence) {
    let Kind;
    (function (Kind) {
        Kind["Protein"] = "protein";
        Kind["RNA"] = "RNA";
        Kind["DNA"] = "DNA";
        Kind["Generic"] = "generic";
    })(Kind = Sequence.Kind || (Sequence.Kind = {}));
    function getSequenceString(seq) {
        const array = seq.code.toArray();
        return (array instanceof Array ? array : Array.from(array)).join('');
    }
    Sequence.getSequenceString = getSequenceString;
    function determineKind(names) {
        for (let i = 0, _i = Math.min(names.rowCount, 10); i < _i; i++) {
            const name = names.value(i) || '';
            if (getProteinOneLetterCode(name) !== 'X')
                return Kind.Protein;
            if (getRnaOneLetterCode(name) !== 'X')
                return Kind.RNA;
            if (getDnaOneLetterCode(name) !== 'X')
                return Kind.DNA;
        }
        return Kind.Generic;
    }
    function codeProvider(kind, map) {
        let code;
        switch (kind) {
            case Kind.Protein:
                code = getProteinOneLetterCode;
                break;
            case Kind.DNA:
                code = getDnaOneLetterCode;
                break;
            case Kind.RNA:
                code = getRnaOneLetterCode;
                break;
            case Kind.Generic:
                code = () => 'X';
                break;
            default: assertUnreachable(kind);
        }
        if (map && map.size > 0) {
            return (name) => {
                const ret = code(name);
                if (ret !== 'X' || !map.has(name))
                    return ret;
                return code(map.get(name));
            };
        }
        return code;
    }
    function ofResidueNames(compId, seqId) {
        if (seqId.rowCount === 0)
            throw new Error('cannot be empty');
        const kind = determineKind(compId);
        return new ResidueNamesImpl(kind, compId, seqId);
    }
    Sequence.ofResidueNames = ofResidueNames;
    class ResidueNamesImpl {
        index(seqId) {
            return this.indexMap.get(seqId);
        }
        constructor(kind, compId, seqId) {
            this.kind = kind;
            this.microHet = new Map();
            const codeFromName = codeProvider(kind);
            const codes = [];
            const compIds = [];
            const seqIds = [];
            const microHet = new Map();
            let idx = 0;
            const indexMap = new Map();
            for (let i = 0, il = seqId.rowCount; i < il; ++i) {
                const seq_id = seqId.value(i);
                if (!indexMap.has(seq_id)) {
                    indexMap.set(seq_id, idx);
                    const comp_id = compId.value(i);
                    compIds[idx] = comp_id;
                    seqIds[idx] = seq_id;
                    codes[idx] = codeFromName(comp_id);
                    idx += 1;
                }
                else {
                    // micro-heterogeneity
                    if (!microHet.has(seq_id)) {
                        microHet.set(seq_id, [compIds[indexMap.get(seq_id)], compId.value(i)]);
                    }
                    else {
                        microHet.get(seq_id).push(compId.value(i));
                    }
                }
            }
            const labels = [];
            for (let i = 0, il = idx; i < il; ++i) {
                const mh = microHet.get(seqIds[i]);
                if (mh) {
                    const l = mh.map(id => {
                        const c = codeFromName(id);
                        return c === 'X' ? id : c;
                    });
                    labels[i] = `(${l.join('|')})`;
                }
                else {
                    labels[i] = codes[i] === 'X' ? compIds[i] : codes[i];
                }
            }
            this.length = idx;
            this.code = Column.ofStringArray(codes);
            this.compId = Column.ofStringArray(compIds);
            this.seqId = Column.ofIntArray(seqIds);
            this.label = Column.ofStringArray(labels);
            this.microHet = microHet;
            this.indexMap = indexMap;
        }
    }
    function ofSequenceRanges(seqIdBegin, seqIdEnd) {
        const kind = Kind.Generic;
        return new SequenceRangesImpl(kind, seqIdBegin, seqIdEnd);
    }
    Sequence.ofSequenceRanges = ofSequenceRanges;
    class SequenceRangesImpl {
        index(seqId) {
            return seqId - this.minSeqId;
        }
        constructor(kind, seqIdStart, seqIdEnd) {
            this.kind = kind;
            this.seqIdStart = seqIdStart;
            this.seqIdEnd = seqIdEnd;
            this.microHet = new Map();
            let maxSeqId = 0, minSeqId = Number.MAX_SAFE_INTEGER;
            for (let i = 0, _i = this.seqIdStart.rowCount; i < _i; i++) {
                const idStart = this.seqIdStart.value(i);
                const idEnd = this.seqIdEnd.value(i);
                if (idStart < minSeqId)
                    minSeqId = idStart;
                if (maxSeqId < idEnd)
                    maxSeqId = idEnd;
            }
            const count = maxSeqId - minSeqId + 1;
            this.code = Column.ofConst('X', count, Column.Schema.str);
            this.label = Column.ofConst('', count, Column.Schema.str);
            this.seqId = Column.ofLambda({
                value: row => row + minSeqId + 1,
                rowCount: count,
                schema: Column.Schema.int
            });
            this.compId = Column.ofConst('', count, Column.Schema.str);
            this.length = count;
            this.minSeqId = minSeqId;
        }
    }
})(Sequence || (Sequence = {}));
export { Sequence };
