"use strict";
/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeUnitZhangSkolnik = computeUnitZhangSkolnik;
const secondary_structure_1 = require("../../../mol-model/structure/model/properties/secondary-structure");
const int_1 = require("../../../mol-data/int");
const vec3_1 = require("../../../mol-math/linear-algebra/3d/vec3");
const HelixDistances = [5.45, 5.18, 6.37];
const HelixDelta = 2.1;
const SheetDistances = [6.1, 10.4, 13.0];
const SheetDelta = 1.42;
const posA = (0, vec3_1.Vec3)();
const posB = (0, vec3_1.Vec3)();
function zhangSkolnickAtomicSS(unit, residueIndices, i, distances, delta) {
    const c = unit.conformation;
    const { traceElementIndex } = unit.model.atomicHierarchy.derived.residue;
    for (let j = Math.max(0, i - 2); j <= i; ++j) {
        for (let k = 2; k < 5; ++k) {
            if (j + k >= residueIndices.length)
                return false;
            const rA = residueIndices[j];
            const rB = residueIndices[j + k];
            const aA = traceElementIndex[rA];
            const aB = traceElementIndex[rB];
            if (aA === -1 || aB === -1)
                return false;
            c.invariantPosition(aA, posA);
            c.invariantPosition(aB, posB);
            const d = vec3_1.Vec3.distance(posA, posB);
            if (Math.abs(d - distances[k - 2]) >= delta)
                return false;
        }
    }
    return true;
}
/**
 * Secondary-structure assignment based on Zhang and Skolnick's TM-align paper.
 * TM-align: a protein structure alignment algorithm based on the Tm-score (2005) NAR, 33(7) 2302-2309.
 *
 * While not as accurate as DSSP, it is faster and works for coarse-grained/backbone-only models.
 */
async function computeUnitZhangSkolnik(unit) {
    const count = unit.proteinElements.length;
    const type = new Uint32Array(count);
    const keys = [];
    const elements = [];
    const { proteinElements, residueIndex } = unit;
    const residueCount = proteinElements.length;
    const unitProteinResidues = new Uint32Array(residueCount);
    for (let i = 0; i < residueCount; ++i) {
        const rI = residueIndex[proteinElements[i]];
        unitProteinResidues[i] = rI;
    }
    const residueIndices = int_1.SortedArray.ofSortedArray(unitProteinResidues);
    const getIndex = (rI) => int_1.SortedArray.indexOf(residueIndices, rI);
    for (let i = 0, il = residueIndices.length; i < il; ++i) {
        let flag = 0 /* SecondaryStructureType.Flag.None */;
        if (zhangSkolnickAtomicSS(unit, residueIndices, i, HelixDistances, HelixDelta)) {
            flag = 2 /* SecondaryStructureType.Flag.Helix */;
        }
        else if (zhangSkolnickAtomicSS(unit, residueIndices, i, SheetDistances, SheetDelta)) {
            flag = 4 /* SecondaryStructureType.Flag.Beta */;
        }
        type[i] = flag;
        if (elements.length === 0 || flag !== getFlag(elements[elements.length - 1])) {
            elements[elements.length] = createElement(mapToKind(flag), flag);
        }
        keys[i] = elements.length - 1;
    }
    return (0, secondary_structure_1.SecondaryStructure)(type, keys, elements, getIndex);
}
function createElement(kind, flag) {
    if (kind === 'helix') {
        return { kind: 'helix', flags: flag };
    }
    else if (kind === 'sheet') {
        return { kind: 'sheet', flags: flag };
    }
    else {
        return { kind: 'none' };
    }
}
function mapToKind(flag) {
    if (flag === 2 /* SecondaryStructureType.Flag.Helix */) {
        return 'helix';
    }
    else if (flag === 4 /* SecondaryStructureType.Flag.Beta */) {
        return 'sheet';
    }
    else {
        return 'none';
    }
}
function getFlag(element) {
    if (element.kind === 'helix') {
        return element.flags;
    }
    else if (element.kind === 'sheet') {
        return element.flags;
    }
    else {
        return 0 /* SecondaryStructureType.Flag.None */;
    }
}
