"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PairRestraints = void 0;
const emptyArray = [];
function getPairKey(indexA, unitA, indexB, unitB) {
    return `${indexA}|${unitA.id}|${indexB}|${unitB.id}`;
}
class PairRestraints {
    /** Indices into this.pairs */
    getPairIndices(indexA, unitA, indexB, unitB) {
        const key = getPairKey(indexA, unitA, indexB, unitB);
        return this.pairKeyIndices.get(key) || emptyArray;
    }
    getPairs(indexA, unitA, indexB, unitB) {
        const indices = this.getPairIndices(indexA, unitA, indexB, unitB);
        return indices.map(idx => this.pairs[idx]);
    }
    constructor(pairs) {
        this.pairs = pairs;
        const pairKeyIndices = new Map();
        this.pairs.forEach((p, i) => {
            const key = getPairKey(p.indexA, p.unitA, p.indexB, p.unitB);
            const indices = pairKeyIndices.get(key);
            if (indices)
                indices.push(i);
            else
                pairKeyIndices.set(key, [i]);
        });
        this.count = pairs.length;
        this.pairKeyIndices = pairKeyIndices;
    }
}
exports.PairRestraints = PairRestraints;
