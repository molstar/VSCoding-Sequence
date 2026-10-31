"use strict";
/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcUnitBackboneHbonds = calcUnitBackboneHbonds;
const graph_1 = require("../../../../mol-math/graph");
const linear_algebra_1 = require("../../../../mol-math/linear-algebra");
/** max distance between two C-alpha atoms to check for hbond */
const caMaxDist = 9.0;
/**
 * Constant for electrostatic energy in kcal/mol
 *      f  *  q1 *   q2
 * Q = -332 * 0.42 * 0.20
 *
 * f is the dimensional factor
 *
 * q1 and q2 are partial charges which are placed on the C,O
 * (+q1,-q1) and N,H (-q2,+q2)
 */
const Q = -27.888;
/** cutoff for hbonds in kcal/mol, must be lower to be consider as an hbond */
const hbondEnergyCutoff = -0.5;
/** prevent extremely low hbond energies */
const hbondEnergyMinimal = -9.9;
/**
 * E = Q * (1/r(ON) + l/r(CH) - l/r(OH) - l/r(CN))
 */
function calcHbondEnergy(oPos, cPos, nPos, hPos) {
    const distOH = linear_algebra_1.Vec3.distance(oPos, hPos);
    const distCH = linear_algebra_1.Vec3.distance(cPos, hPos);
    const distCN = linear_algebra_1.Vec3.distance(cPos, nPos);
    const distON = linear_algebra_1.Vec3.distance(oPos, nPos);
    const e1 = Q / distOH - Q / distCH;
    const e2 = Q / distCN - Q / distON;
    const e = e1 + e2;
    // cap lowest possible energy
    if (e < hbondEnergyMinimal)
        return hbondEnergyMinimal;
    return e;
}
function calcUnitBackboneHbonds(unit, proteinInfo, lookup3d) {
    const { residueIndices, cIndices, hIndices, nIndices, oIndices } = proteinInfo;
    const { index } = unit.model.atomicHierarchy;
    const c = unit.conformation;
    const { traceElementIndex } = unit.model.atomicHierarchy.derived.residue;
    const residueCount = residueIndices.length;
    const oAtomResidues = [];
    const nAtomResidues = [];
    const energies = [];
    const oPos = (0, linear_algebra_1.Vec3)();
    const cPos = (0, linear_algebra_1.Vec3)();
    const caPos = (0, linear_algebra_1.Vec3)();
    const nPos = (0, linear_algebra_1.Vec3)();
    const hPos = (0, linear_algebra_1.Vec3)();
    const cPosPrev = (0, linear_algebra_1.Vec3)();
    const oPosPrev = (0, linear_algebra_1.Vec3)();
    for (let i = 0, il = residueIndices.length; i < il; ++i) {
        const oPI = i;
        const oRI = residueIndices[i];
        const oAtom = oIndices[oPI];
        const cAtom = cIndices[oPI];
        const caAtom = traceElementIndex[oRI];
        // continue if residue is missing O or C atom
        if (oAtom === -1 || cAtom === -1)
            continue;
        // ignore C-terminal residue as acceptor
        if (index.findAtomOnResidue(oRI, 'OXT') !== -1)
            continue;
        c.invariantPosition(oAtom, oPos);
        c.invariantPosition(cAtom, cPos);
        c.invariantPosition(caAtom, caPos);
        const { indices, count } = lookup3d.find(caPos[0], caPos[1], caPos[2], caMaxDist);
        for (let j = 0; j < count; ++j) {
            const nPI = indices[j];
            // ignore bonds within a residue or to prev or next residue
            if (nPI === oPI || nPI - 1 === oPI || nPI + 1 === oPI)
                continue;
            const nAtom = nIndices[nPI];
            if (nAtom === -1)
                continue;
            c.invariantPosition(nAtom, nPos);
            const hAtom = hIndices[nPI];
            if (hAtom === -1) {
                // approximate calculation of H position, TODO factor out
                if (nPI === 0)
                    continue;
                const nPIprev = nPI - 1;
                const oAtomPrev = oIndices[nPIprev];
                const cAtomPrev = cIndices[nPIprev];
                if (oAtomPrev === -1 || cAtomPrev === -1)
                    continue;
                c.invariantPosition(oAtomPrev, oPosPrev);
                c.invariantPosition(cAtomPrev, cPosPrev);
                linear_algebra_1.Vec3.sub(hPos, cPosPrev, oPosPrev);
                const dist = linear_algebra_1.Vec3.distance(oPosPrev, cPosPrev);
                linear_algebra_1.Vec3.scaleAndAdd(hPos, nPos, hPos, 1 / dist);
            }
            else {
                c.invariantPosition(hAtom, hPos);
            }
            const e = calcHbondEnergy(oPos, cPos, nPos, hPos);
            if (e > hbondEnergyCutoff)
                continue;
            oAtomResidues[oAtomResidues.length] = oPI;
            nAtomResidues[nAtomResidues.length] = nPI;
            energies[energies.length] = e;
        }
    }
    return buildHbondGraph(residueCount, oAtomResidues, nAtomResidues, energies);
}
function buildHbondGraph(residueCount, oAtomResidues, nAtomResidues, energies) {
    const builder = new graph_1.IntAdjacencyGraph.DirectedEdgeBuilder(residueCount, oAtomResidues, nAtomResidues);
    const _energies = new Float32Array(builder.slotCount);
    for (let i = 0, _i = builder.edgeCount; i < _i; i++) {
        builder.addNextEdge();
        builder.assignProperty(_energies, energies[i]);
    }
    return builder.createGraph({ energies });
}
