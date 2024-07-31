"use strict";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResonance = getResonance;
const sorted_array_1 = require("../../../../mol-data/int/sorted-array");
const util_1 = require("../../../../mol-data/util");
const types_1 = require("../../model/types");
function getResonance(unit) {
    return {
        delocalizedTriplets: getDelocalizedTriplets(unit)
    };
}
function getDelocalizedTriplets(unit) {
    const bonds = unit.bonds;
    const { b, edgeProps, offset } = bonds;
    const { order: _order, flags: _flags } = edgeProps;
    const { elementAromaticRingIndices } = unit.rings;
    const triplets = [];
    const thirdElementMap = new Map();
    const indicesMap = new Map();
    const add = (a, b, c) => {
        const index = triplets.length;
        triplets.push(sorted_array_1.SortedArray.ofUnsortedArray([a, b, c]));
        thirdElementMap.set((0, util_1.sortedCantorPairing)(a, b), c);
        if (indicesMap.has(a))
            indicesMap.get(a).push(index);
        else
            indicesMap.set(a, [index]);
    };
    for (let i = 0; i < unit.elements.length; i++) {
        if (elementAromaticRingIndices.has(i))
            continue;
        const count = offset[i + 1] - offset[i] + 1;
        if (count < 2)
            continue;
        const deloBonds = [];
        for (let t = offset[i], _t = offset[i + 1]; t < _t; t++) {
            const f = _flags[t];
            if (!types_1.BondType.is(f, 16 /* BondType.Flag.Aromatic */))
                continue;
            deloBonds.push(b[t]);
        }
        if (deloBonds.length >= 2) {
            add(i, deloBonds[0], deloBonds[1]);
            for (let j = 1, jl = deloBonds.length; j < jl; j++) {
                add(i, deloBonds[j], deloBonds[0]);
            }
        }
    }
    return {
        getThirdElement: (a, b) => {
            return thirdElementMap.get((0, util_1.sortedCantorPairing)(a, b));
        },
        getTripletIndices: (a) => {
            return indicesMap.get(a);
        },
        triplets,
    };
}
