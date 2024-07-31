/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { SortedArray } from '../../../../mol-data/int/sorted-array';
import { sortedCantorPairing } from '../../../../mol-data/util';
import { BondType } from '../../model/types';
export function getResonance(unit) {
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
        triplets.push(SortedArray.ofUnsortedArray([a, b, c]));
        thirdElementMap.set(sortedCantorPairing(a, b), c);
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
            if (!BondType.is(f, 16 /* BondType.Flag.Aromatic */))
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
            return thirdElementMap.get(sortedCantorPairing(a, b));
        },
        getTripletIndices: (a) => {
            return indicesMap.get(a);
        },
        triplets,
    };
}
