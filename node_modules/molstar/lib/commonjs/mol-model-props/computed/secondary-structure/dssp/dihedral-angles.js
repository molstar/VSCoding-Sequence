"use strict";
/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateUnitDihedralAngles = calculateUnitDihedralAngles;
const linear_algebra_1 = require("../../../../mol-math/linear-algebra");
const misc_1 = require("../../../../mol-math/misc");
function calculateUnitDihedralAngles(unit, proteinInfo) {
    const { cIndices, nIndices, residueIndices } = proteinInfo;
    const c = unit.conformation;
    const { index } = unit.model.atomicHierarchy;
    const { traceElementIndex } = unit.model.atomicHierarchy.derived.residue;
    const residueCount = residueIndices.length;
    const p = (i, v) => i === -1 ? linear_algebra_1.Vec3.setNaN(v) : c.position(i, v);
    let cPosPrev = (0, linear_algebra_1.Vec3)(), caPosPrev = (0, linear_algebra_1.Vec3)(), nPosPrev = (0, linear_algebra_1.Vec3)();
    let cPos = (0, linear_algebra_1.Vec3)(), caPos = (0, linear_algebra_1.Vec3)(), nPos = (0, linear_algebra_1.Vec3)();
    const cPosNext = (0, linear_algebra_1.Vec3)(), caPosNext = (0, linear_algebra_1.Vec3)(), nPosNext = (0, linear_algebra_1.Vec3)();
    if (residueCount === 0)
        return { phi: new Float32Array(0), psi: new Float32Array(0) };
    const phi = new Float32Array(residueCount - 1);
    const psi = new Float32Array(residueCount - 1);
    p(-1, cPosPrev);
    p(-1, caPosPrev);
    p(-1, nPosPrev);
    p(cIndices[0], cPos);
    p(traceElementIndex[residueIndices[0]], caPos);
    p(nIndices[0], nPos);
    p(cIndices[1], cPosNext);
    p(traceElementIndex[residueIndices[1]], caPosNext);
    p(nIndices[1], nPosNext);
    for (let i = 0; i < residueCount - 1; ++i) {
        // ignore C-terminal residue as acceptor
        if (index.findAtomOnResidue(residueIndices[i], 'OXT') !== -1)
            continue;
        // returns NaN for missing atoms
        phi[i] = (0, misc_1.radToDeg)(linear_algebra_1.Vec3.dihedralAngle(cPosPrev, nPos, caPos, cPos));
        psi[i] = (0, misc_1.radToDeg)(linear_algebra_1.Vec3.dihedralAngle(nPos, caPos, cPos, nPosNext));
        cPosPrev = cPos, caPosPrev = caPos, nPosPrev = nPos;
        cPos = cPosNext, caPos = caPosNext, nPos = nPosNext;
        p(cIndices[i + 1], cPosNext);
        p(traceElementIndex[residueIndices[i + 1]], caPosNext);
        p(nIndices[i + 1], nPosNext);
    }
    return { phi, psi };
}
