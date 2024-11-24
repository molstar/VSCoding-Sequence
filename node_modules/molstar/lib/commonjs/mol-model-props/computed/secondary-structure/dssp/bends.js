"use strict";
/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignBends = assignBends;
const linear_algebra_1 = require("../../../../mol-math/linear-algebra");
const misc_1 = require("../../../../mol-math/misc");
/**
 * Bend(i) =: [angle ((CW - Ca(i - 2)),(C"(i + 2) - C"(i))) > 70"]
 *
 * Type: S
 */
function assignBends(ctx) {
    const { unit, flags, proteinInfo } = ctx;
    const c = unit.conformation;
    const { traceElementIndex } = unit.model.atomicHierarchy.derived.residue;
    const { residueIndices, nIndices } = proteinInfo;
    const residueCount = residueIndices.length;
    // const position = (i: number, v: Vec3) => Vec3.set(v, x[i], y[i], z[i])
    const p = (i, v) => i === -1 ? linear_algebra_1.Vec3.setNaN(v) : c.position(i, v);
    const caPosPrev2 = (0, linear_algebra_1.Vec3)();
    const caPos = (0, linear_algebra_1.Vec3)();
    const caPosNext2 = (0, linear_algebra_1.Vec3)();
    const cPos = (0, linear_algebra_1.Vec3)();
    const nPosNext = (0, linear_algebra_1.Vec3)();
    const caMinus2 = (0, linear_algebra_1.Vec3)();
    const caPlus2 = (0, linear_algebra_1.Vec3)();
    f1: for (let i = 2; i < residueCount - 2; i++) {
        // check for peptide bond
        for (let k = 0; k < 4; k++) {
            const index = i + k - 2;
            p(traceElementIndex[index], cPos);
            p(nIndices[index + 1], nPosNext);
            if (linear_algebra_1.Vec3.squaredDistance(cPos, nPosNext) > 6.25 /* max squared peptide bond distance allowed */) {
                continue f1;
            }
        }
        const oRIprev2 = residueIndices[i - 2];
        const oRI = residueIndices[i];
        const oRInext2 = residueIndices[i + 2];
        const caAtomPrev2 = traceElementIndex[oRIprev2];
        const caAtom = traceElementIndex[oRI];
        const caAtomNext2 = traceElementIndex[oRInext2];
        p(caAtomPrev2, caPosPrev2);
        p(caAtom, caPos);
        p(caAtomNext2, caPosNext2);
        linear_algebra_1.Vec3.sub(caMinus2, caPosPrev2, caPos);
        linear_algebra_1.Vec3.sub(caPlus2, caPos, caPosNext2);
        const angle = (0, misc_1.radToDeg)(linear_algebra_1.Vec3.angle(caMinus2, caPlus2));
        if (angle && angle > 70.00) {
            flags[i] |= 32 /* DSSPType.Flag.S */;
        }
    }
}
