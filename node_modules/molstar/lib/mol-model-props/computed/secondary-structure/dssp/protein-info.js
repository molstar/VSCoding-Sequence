/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { SortedArray } from '../../../../mol-data/int';
export function getUnitProteinInfo(unit) {
    const { index } = unit.model.atomicHierarchy;
    const { proteinElements, residueIndex } = unit;
    const residueCount = proteinElements.length;
    const unitProteinResidues = new Uint32Array(residueCount);
    const c = new Int32Array(residueCount);
    const h = new Int32Array(residueCount);
    const o = new Int32Array(residueCount);
    const n = new Int32Array(residueCount);
    for (let i = 0; i < residueCount; ++i) {
        const rI = residueIndex[proteinElements[i]];
        unitProteinResidues[i] = rI;
        c[i] = index.findAtomOnResidue(rI, 'C');
        h[i] = index.findAtomOnResidue(rI, 'H');
        o[i] = index.findAtomOnResidue(rI, 'O');
        n[i] = index.findAtomOnResidue(rI, 'N');
    }
    return {
        residueIndices: SortedArray.ofSortedArray(unitProteinResidues),
        cIndices: c,
        hIndices: h,
        oIndices: o,
        nIndices: n,
    };
}
