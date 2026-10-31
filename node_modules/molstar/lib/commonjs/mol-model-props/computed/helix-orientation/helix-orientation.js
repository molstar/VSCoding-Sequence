"use strict";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcHelixOrientation = calcHelixOrientation;
const segmentation_1 = require("../../../mol-data/int/segmentation");
const sorted_ranges_1 = require("../../../mol-data/int/sorted-ranges");
const int_1 = require("../../../mol-data/int");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
/** Usees same definition as GROMACS' helixorient */
function calcHelixOrientation(model) {
    const { x, y, z } = model.atomicConformation;
    const { polymerType, traceElementIndex } = model.atomicHierarchy.derived.residue;
    const n = polymerType.length;
    const elements = int_1.OrderedSet.ofBounds(0, model.atomicConformation.atomId.rowCount);
    const polymerIt = sorted_ranges_1.SortedRanges.transientSegments(model.atomicRanges.polymerRanges, elements);
    const residueIt = segmentation_1.Segmentation.transientSegments(model.atomicHierarchy.residueAtomSegments, elements);
    const centers = new Float32Array(n * 3);
    const axes = new Float32Array(n * 3);
    let i = 0;
    let j = -1;
    let s = -1;
    const a1 = (0, linear_algebra_1.Vec3)();
    const a2 = (0, linear_algebra_1.Vec3)();
    const a3 = (0, linear_algebra_1.Vec3)();
    const a4 = (0, linear_algebra_1.Vec3)();
    const r12 = (0, linear_algebra_1.Vec3)();
    const r23 = (0, linear_algebra_1.Vec3)();
    const r34 = (0, linear_algebra_1.Vec3)();
    const v1 = (0, linear_algebra_1.Vec3)();
    const v2 = (0, linear_algebra_1.Vec3)();
    const vt = (0, linear_algebra_1.Vec3)();
    const diff13 = (0, linear_algebra_1.Vec3)();
    const diff24 = (0, linear_algebra_1.Vec3)();
    const axis = (0, linear_algebra_1.Vec3)();
    const prevAxis = (0, linear_algebra_1.Vec3)();
    while (polymerIt.hasNext) {
        const ps = polymerIt.move();
        residueIt.setSegment(ps);
        i = -1;
        s = -1;
        while (residueIt.hasNext) {
            i += 1;
            const { index } = residueIt.move();
            if (i === 0)
                s = index;
            j = (index - 2);
            const j3 = j * 3;
            linear_algebra_1.Vec3.copy(a1, a2);
            linear_algebra_1.Vec3.copy(a2, a3);
            linear_algebra_1.Vec3.copy(a3, a4);
            const eI = traceElementIndex[index];
            linear_algebra_1.Vec3.set(a4, x[eI], y[eI], z[eI]);
            if (i < 3)
                continue;
            linear_algebra_1.Vec3.sub(r12, a2, a1);
            linear_algebra_1.Vec3.sub(r23, a3, a2);
            linear_algebra_1.Vec3.sub(r34, a4, a3);
            linear_algebra_1.Vec3.sub(diff13, r12, r23);
            linear_algebra_1.Vec3.sub(diff24, r23, r34);
            linear_algebra_1.Vec3.cross(axis, diff13, diff24);
            linear_algebra_1.Vec3.normalize(axis, axis);
            linear_algebra_1.Vec3.toArray(axis, axes, j3);
            const tmp = Math.cos(linear_algebra_1.Vec3.angle(diff13, diff24));
            const diff13Length = linear_algebra_1.Vec3.magnitude(diff13);
            const diff24Length = linear_algebra_1.Vec3.magnitude(diff24);
            const r = (Math.sqrt(diff24Length * diff13Length) /
                // clamp, to avoid numerical instabilities for when
                // angle between diff13 and diff24 is close to 0
                Math.max(2.0, 2.0 * (1.0 - tmp)));
            linear_algebra_1.Vec3.scale(v1, diff13, r / diff13Length);
            linear_algebra_1.Vec3.sub(v1, a2, v1);
            linear_algebra_1.Vec3.toArray(v1, centers, j3);
            linear_algebra_1.Vec3.scale(v2, diff24, r / diff24Length);
            linear_algebra_1.Vec3.sub(v2, a3, v2);
            linear_algebra_1.Vec3.toArray(v2, centers, j3 + 3);
            linear_algebra_1.Vec3.copy(prevAxis, axis);
        }
        // calc axis as dir of second and third center pos
        // project first trace atom onto axis to get first center pos
        const s3 = s * 3;
        linear_algebra_1.Vec3.fromArray(v1, centers, s3 + 3);
        linear_algebra_1.Vec3.fromArray(v2, centers, s3 + 6);
        linear_algebra_1.Vec3.normalize(axis, linear_algebra_1.Vec3.sub(axis, v1, v2));
        const sI = traceElementIndex[s];
        linear_algebra_1.Vec3.set(a1, x[sI], y[sI], z[sI]);
        linear_algebra_1.Vec3.copy(vt, a1);
        linear_algebra_1.Vec3.projectPointOnVector(vt, vt, axis, v1);
        linear_algebra_1.Vec3.toArray(vt, centers, s3);
        // calc axis as dir of n-1 and n-2 center pos
        // project last traceAtom onto axis to get last center pos
        const e = j + 2;
        const e3 = e * 3;
        linear_algebra_1.Vec3.fromArray(v1, centers, e3 - 3);
        linear_algebra_1.Vec3.fromArray(v2, centers, e3 - 6);
        linear_algebra_1.Vec3.normalize(axis, linear_algebra_1.Vec3.sub(axis, v1, v2));
        const eI = traceElementIndex[e];
        linear_algebra_1.Vec3.set(a1, x[eI], y[eI], z[eI]);
        linear_algebra_1.Vec3.copy(vt, a1);
        linear_algebra_1.Vec3.projectPointOnVector(vt, vt, axis, v1);
        linear_algebra_1.Vec3.toArray(vt, centers, e3);
    }
    return {
        centers
    };
}
