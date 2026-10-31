"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinimizeRmsd = void 0;
const mat4_1 = require("./mat4");
const evd_1 = require("../matrix/evd");
const centroid_helper_1 = require("../../../mol-math/geometry/centroid-helper");
const matrix_1 = require("../matrix/matrix");
const sphere3d_1 = require("../../geometry/primitives/sphere3d");
var MinimizeRmsd;
(function (MinimizeRmsd) {
    let Positions;
    (function (Positions) {
        function empty(n) {
            return { x: new Float64Array(n), y: new Float64Array(n), z: new Float64Array(n) };
        }
        Positions.empty = empty;
    })(Positions = MinimizeRmsd.Positions || (MinimizeRmsd.Positions = {}));
    function compute(data, result) {
        if (typeof result === 'undefined')
            result = { bTransform: mat4_1.Mat4.zero(), rmsd: 0.0 };
        findMinimalRmsdTransformImpl(new RmsdTransformState(data, result));
        return result;
    }
    MinimizeRmsd.compute = compute;
})(MinimizeRmsd || (exports.MinimizeRmsd = MinimizeRmsd = {}));
class RmsdTransformState {
    constructor(data, into) {
        this.evdCache = evd_1.EVD.createCache(4);
        this.translateB = mat4_1.Mat4.identity();
        this.rotateB = mat4_1.Mat4.identity();
        this.tempMatrix = mat4_1.Mat4.identity();
        this.a = data.a;
        this.b = data.b;
        if (data.centerA)
            this.centerA = data.centerA;
        else
            this.centerA = data.centerA = centroid_helper_1.CentroidHelper.fromArrays(data.a, (0, sphere3d_1.Sphere3D)()).center;
        if (data.centerB)
            this.centerB = data.centerB;
        else
            this.centerB = data.centerB = centroid_helper_1.CentroidHelper.fromArrays(data.b, (0, sphere3d_1.Sphere3D)()).center;
        this.result = into;
    }
}
function computeN(state) {
    const N = state.evdCache.matrix;
    matrix_1.Matrix.makeZero(N);
    const xsA = state.a.x, ysA = state.a.y, zsA = state.a.z;
    const xsB = state.b.x, ysB = state.b.y, zsB = state.b.z;
    const cA = state.centerA;
    const cB = state.centerB;
    let sizeSq = 0.0;
    const L = Math.min(state.a.x.length, state.b.x.length);
    for (let i = 0; i < L; i++) {
        const aX = xsA[i] - cA[0], aY = ysA[i] - cA[1], aZ = zsA[i] - cA[2];
        const bX = xsB[i] - cB[0], bY = ysB[i] - cB[1], bZ = zsB[i] - cB[2];
        sizeSq += aX * aX + aY * aY + aZ * aZ + bX * bX + bY * bY + bZ * bZ;
        matrix_1.Matrix.add(N, 0, 0, aX * bX + aY * bY + aZ * bZ);
        matrix_1.Matrix.add(N, 0, 1, -(aZ * bY) + aY * bZ);
        matrix_1.Matrix.add(N, 0, 2, aZ * bX - aX * bZ);
        matrix_1.Matrix.add(N, 0, 3, -(aY * bX) + aX * bY);
        matrix_1.Matrix.add(N, 1, 0, -(aZ * bY) + aY * bZ);
        matrix_1.Matrix.add(N, 1, 1, aX * bX - aY * bY - aZ * bZ);
        matrix_1.Matrix.add(N, 1, 2, aY * bX + aX * bY);
        matrix_1.Matrix.add(N, 1, 3, aZ * bX + aX * bZ);
        matrix_1.Matrix.add(N, 2, 0, aZ * bX - aX * bZ);
        matrix_1.Matrix.add(N, 2, 1, aY * bX + aX * bY);
        matrix_1.Matrix.add(N, 2, 2, -(aX * bX) + aY * bY - aZ * bZ);
        matrix_1.Matrix.add(N, 2, 3, aZ * bY + aY * bZ);
        matrix_1.Matrix.add(N, 3, 0, -(aY * bX) + aX * bY);
        matrix_1.Matrix.add(N, 3, 1, aZ * bX + aX * bZ);
        matrix_1.Matrix.add(N, 3, 2, aZ * bY + aY * bZ);
        matrix_1.Matrix.add(N, 3, 3, -(aX * bX) - aY * bY + aZ * bZ);
        // conjugate instead of transpose.
        // var l = new Quaternion(-a.X, -a.Y, -a.Z, 0).RightMultiplicationToMatrix();
        // l.Transpose();
        // var r = new Quaternion(b.X, b.Y, b.Z, 0).LeftMultiplicationToMatrix();
        // N += l * r;
    }
    return sizeSq;
}
function makeTransformMatrix(state) {
    const ev = state.evdCache.matrix;
    const qX = matrix_1.Matrix.get(ev, 1, 3);
    const qY = matrix_1.Matrix.get(ev, 2, 3);
    const qZ = matrix_1.Matrix.get(ev, 3, 3);
    const qW = matrix_1.Matrix.get(ev, 0, 3);
    const n1 = 2 * qY * qY;
    const n2 = 2 * qZ * qZ;
    const n3 = 2 * qX * qX;
    const n4 = 2 * qX * qY;
    const n5 = 2 * qW * qZ;
    const n6 = 2 * qX * qZ;
    const n7 = 2 * qW * qY;
    const n8 = 2 * qY * qZ;
    const n9 = 2 * qW * qX;
    let m = state.translateB;
    // translation to center
    mat4_1.Mat4.setValue(m, 0, 3, -state.centerB[0]);
    mat4_1.Mat4.setValue(m, 1, 3, -state.centerB[1]);
    mat4_1.Mat4.setValue(m, 2, 3, -state.centerB[2]);
    m = state.rotateB;
    // rotation
    mat4_1.Mat4.setValue(m, 0, 0, 1 - n1 - n2);
    mat4_1.Mat4.setValue(m, 0, 1, n4 + n5);
    mat4_1.Mat4.setValue(m, 0, 2, n6 - n7);
    mat4_1.Mat4.setValue(m, 1, 0, n4 - n5);
    mat4_1.Mat4.setValue(m, 1, 1, 1 - n3 - n2);
    mat4_1.Mat4.setValue(m, 1, 2, n8 + n9);
    mat4_1.Mat4.setValue(m, 2, 0, n6 + n7);
    mat4_1.Mat4.setValue(m, 2, 1, n8 - n9);
    mat4_1.Mat4.setValue(m, 2, 2, 1 - n3 - n1);
    mat4_1.Mat4.setValue(m, 3, 3, 1);
    mat4_1.Mat4.mul(state.tempMatrix, state.rotateB, state.translateB);
    m = state.translateB;
    // translation to center
    mat4_1.Mat4.setValue(m, 0, 3, state.centerA[0]);
    mat4_1.Mat4.setValue(m, 1, 3, state.centerA[1]);
    mat4_1.Mat4.setValue(m, 2, 3, state.centerA[2]);
    mat4_1.Mat4.mul(state.result.bTransform, state.translateB, state.tempMatrix);
}
function findMinimalRmsdTransformImpl(state) {
    const sizeSq = computeN(state);
    evd_1.EVD.compute(state.evdCache);
    let rmsd = sizeSq - 2.0 * state.evdCache.eigenValues[3];
    rmsd = rmsd < 0.0 ? 0.0 : Math.sqrt(rmsd / state.a.x.length);
    makeTransformMatrix(state);
    state.result.rmsd = rmsd;
}
