"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlignSequences = void 0;
exports.entityKey = entityKey;
exports.getSequence = getSequence;
const structure_1 = require("../../structure/structure");
const alignment_1 = require("./alignment");
const int_1 = require("../../../mol-data/int");
var AlignSequences;
(function (AlignSequences) {
    function createSeqIdIndicesMap(element) {
        const seqIds = new Map();
        if (structure_1.Unit.isAtomic(element.unit)) {
            const { label_seq_id } = element.unit.model.atomicHierarchy.residues;
            const { residueIndex } = element.unit;
            for (let i = 0, il = int_1.OrderedSet.size(element.indices); i < il; ++i) {
                const uI = int_1.OrderedSet.getAt(element.indices, i);
                const eI = element.unit.elements[uI];
                const seqId = label_seq_id.value(residueIndex[eI]);
                if (seqIds.has(seqId))
                    seqIds.get(seqId).push(uI);
                else
                    seqIds.set(seqId, [uI]);
            }
        }
        else if (structure_1.Unit.isCoarse(element.unit)) {
            const { seq_id_begin } = structure_1.Unit.isSpheres(element.unit)
                ? element.unit.model.coarseHierarchy.spheres
                : element.unit.model.coarseHierarchy.gaussians;
            for (let i = 0, il = int_1.OrderedSet.size(element.indices); i < il; ++i) {
                const uI = int_1.OrderedSet.getAt(element.indices, i);
                const eI = element.unit.elements[uI];
                const seqId = seq_id_begin.value(eI);
                seqIds.set(seqId, [uI]);
            }
        }
        return seqIds;
    }
    AlignSequences.createSeqIdIndicesMap = createSeqIdIndicesMap;
    function compute(input, options = {}) {
        const seqA = getSequence(input.a.unit);
        const seqB = getSequence(input.b.unit);
        const seqIdIndicesA = createSeqIdIndicesMap(input.a);
        const seqIdIndicesB = createSeqIdIndicesMap(input.b);
        const indicesA = [];
        const indicesB = [];
        const { aliA, aliB, score } = (0, alignment_1.align)(seqA.code.toArray(), seqB.code.toArray(), options);
        let seqIdxA = 0, seqIdxB = 0;
        for (let i = 0, il = aliA.length; i < il; ++i) {
            if (aliA[i] === '-' || aliB[i] === '-') {
                if (aliA[i] !== '-')
                    seqIdxA += 1;
                if (aliB[i] !== '-')
                    seqIdxB += 1;
                continue;
            }
            const seqIdA = seqA.seqId.value(seqIdxA);
            const seqIdB = seqB.seqId.value(seqIdxB);
            if (seqIdIndicesA.has(seqIdA) && seqIdIndicesB.has(seqIdB)) {
                const iA = seqIdIndicesA.get(seqIdA);
                const iB = seqIdIndicesB.get(seqIdB);
                // use min length to guard against alternate locations
                for (let j = 0, jl = Math.min(iA.length, iB.length); j < jl; ++j) {
                    indicesA.push(iA[j]);
                    indicesB.push(iB[j]);
                }
            }
            seqIdxA += 1, seqIdxB += 1;
        }
        const outA = int_1.OrderedSet.intersect(int_1.OrderedSet.ofSortedArray(indicesA), input.a.indices);
        const outB = int_1.OrderedSet.intersect(int_1.OrderedSet.ofSortedArray(indicesB), input.b.indices);
        return {
            a: { unit: input.a.unit, indices: outA },
            b: { unit: input.b.unit, indices: outB },
            score
        };
    }
    AlignSequences.compute = compute;
})(AlignSequences || (exports.AlignSequences = AlignSequences = {}));
function entityKey(unit) {
    switch (unit.kind) {
        case 0 /* Unit.Kind.Atomic */:
            return unit.model.atomicHierarchy.index.getEntityFromChain(unit.chainIndex[unit.elements[0]]);
        case 1 /* Unit.Kind.Spheres */:
            return unit.model.coarseHierarchy.spheres.entityKey[unit.elements[0]];
        case 2 /* Unit.Kind.Gaussians */:
            return unit.model.coarseHierarchy.gaussians.entityKey[unit.elements[0]];
    }
}
function getSequence(unit) {
    return unit.model.sequence.byEntityKey[entityKey(unit)].sequence;
}
