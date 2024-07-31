"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sorting = exports.IndicesAndSortings = void 0;
const db_1 = require("../../../mol-data/db");
const int_1 = require("../../../mol-data/int");
const array_1 = require("../../../mol-util/array");
const utils_1 = require("./utils");
exports.IndicesAndSortings = {
    /** Get `IndicesAndSortings` for a model (use a cached value or create if not available yet) */
    get(model) {
        var _a;
        var _b;
        return (_a = (_b = model._dynamicPropertyData)['indices-and-sortings']) !== null && _a !== void 0 ? _a : (_b['indices-and-sortings'] = exports.IndicesAndSortings.create(model));
    },
    /** Create `IndicesAndSortings` for a model */
    create(model) {
        const h = model.atomicHierarchy;
        const nAtoms = h.atoms._rowCount;
        const nChains = h.chains._rowCount;
        const { label_entity_id, label_asym_id, auth_asym_id } = h.chains;
        const { label_seq_id, auth_seq_id, pdbx_PDB_ins_code } = h.residues;
        const { Present } = db_1.Column.ValueKind;
        const chainsByLabelEntityId = new utils_1.MultiMap();
        const chainsByLabelAsymId = new utils_1.MultiMap();
        const chainsByAuthAsymId = new utils_1.MultiMap();
        const residuesSortedByLabelSeqId = new Map();
        const residuesSortedByAuthSeqId = new Map();
        const residuesByInsCode = new Map();
        const atomsById = new utils_1.NumberMap(nAtoms + 1);
        const atomsByIndex = new utils_1.NumberMap(nAtoms);
        for (let iChain = 0; iChain < nChains; iChain++) {
            chainsByLabelEntityId.add(label_entity_id.value(iChain), iChain);
            chainsByLabelAsymId.add(label_asym_id.value(iChain), iChain);
            chainsByAuthAsymId.add(auth_asym_id.value(iChain), iChain);
            const iResFrom = h.residueAtomSegments.index[h.chainAtomSegments.offsets[iChain]];
            const iResTo = h.residueAtomSegments.index[h.chainAtomSegments.offsets[iChain + 1] - 1] + 1;
            const residuesWithLabelSeqId = (0, array_1.filterInPlace)((0, array_1.range)(iResFrom, iResTo), iRes => label_seq_id.valueKind(iRes) === Present);
            residuesSortedByLabelSeqId.set(iChain, exports.Sorting.create(residuesWithLabelSeqId, label_seq_id.value));
            const residuesWithAuthSeqId = (0, array_1.filterInPlace)((0, array_1.range)(iResFrom, iResTo), iRes => auth_seq_id.valueKind(iRes) === Present);
            residuesSortedByAuthSeqId.set(iChain, exports.Sorting.create(residuesWithAuthSeqId, auth_seq_id.value));
            const residuesHereByInsCode = new utils_1.MultiMap();
            for (let iRes = iResFrom; iRes < iResTo; iRes++) {
                if (pdbx_PDB_ins_code.valueKind(iRes) === Present) {
                    residuesHereByInsCode.add(pdbx_PDB_ins_code.value(iRes), iRes);
                }
            }
            residuesByInsCode.set(iChain, residuesHereByInsCode);
        }
        const atomId = model.atomicConformation.atomId.value;
        const atomIndex = h.atomSourceIndex.value;
        for (let iAtom = 0; iAtom < nAtoms; iAtom++) {
            atomsById.set(atomId(iAtom), iAtom);
            atomsByIndex.set(atomIndex(iAtom), iAtom);
        }
        return {
            chainsByLabelEntityId, chainsByLabelAsymId, chainsByAuthAsymId,
            residuesSortedByLabelSeqId, residuesSortedByAuthSeqId, residuesByInsCode,
            atomsById, atomsByIndex,
        };
    },
};
exports.Sorting = {
    /** Create a `Sorting` from an array of keys and a function returning their corresponding values.
     * If two keys have the same value, the smaller key will come first.
     * This function modifies `keys` - create a copy if you need the original order! */
    create(keys, valueFunction) {
        (0, array_1.sortIfNeeded)(keys, (a, b) => valueFunction(a) - valueFunction(b) || a - b);
        const values = int_1.SortedArray.ofSortedArray(keys.map(valueFunction));
        return { keys, values };
    },
    /** Return a newly allocated array of keys which have value equal to `target`.
     * The returned keys are sorted by their value. */
    getKeysWithValue(sorting, target) {
        return exports.Sorting.getKeysWithValueInRange(sorting, target, target);
    },
    /** Return a newly allocated array of keys which have value within interval `[min, max]` (inclusive).
     * The returned keys are sorted by their value.
     * Undefined `min` is interpreted as negative infitity, undefined `max` is interpreted as positive infinity. */
    getKeysWithValueInRange(sorting, min, max) {
        const { keys, values } = sorting;
        if (!keys)
            return [];
        const n = keys.length;
        const from = (min !== undefined) ? int_1.SortedArray.findPredecessorIndex(values, min) : 0;
        let to;
        if (max !== undefined) {
            to = from;
            while (to < n && values[to] <= max)
                to++;
        }
        else {
            to = n;
        }
        return keys.slice(from, to);
    },
};
