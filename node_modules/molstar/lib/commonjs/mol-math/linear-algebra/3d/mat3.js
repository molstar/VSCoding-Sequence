"use strict";
/**
 * Copyright (c) 2017-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mat3 = Mat3;
const common_1 = require("./common");
const mat4_1 = require("./mat4");
const vec3_1 = require("./vec3");
function Mat3() {
    return Mat3.zero();
}
(function (Mat3) {
    function zero() {
        // force double backing array by 0.1.
        const ret = [0.1, 0, 0, 0, 0, 0, 0, 0, 0];
        ret[0] = 0.0;
        return ret;
    }
    Mat3.zero = zero;
    function identity() {
        const out = zero();
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 1;
        out[5] = 0;
        out[6] = 0;
        out[7] = 0;
        out[8] = 1;
        return out;
    }
    Mat3.identity = identity;
    function setIdentity(mat) {
        mat[0] = 1;
        mat[1] = 0;
        mat[2] = 0;
        mat[3] = 0;
        mat[4] = 1;
        mat[5] = 0;
        mat[6] = 0;
        mat[7] = 0;
        mat[8] = 1;
        return mat;
    }
    Mat3.setIdentity = setIdentity;
    function toArray(a, out, offset) {
        out[offset + 0] = a[0];
        out[offset + 1] = a[1];
        out[offset + 2] = a[2];
        out[offset + 3] = a[3];
        out[offset + 4] = a[4];
        out[offset + 5] = a[5];
        out[offset + 6] = a[6];
        out[offset + 7] = a[7];
        out[offset + 8] = a[8];
        return out;
    }
    Mat3.toArray = toArray;
    function fromArray(a, array, offset) {
        a[0] = array[offset + 0];
        a[1] = array[offset + 1];
        a[2] = array[offset + 2];
        a[3] = array[offset + 3];
        a[4] = array[offset + 4];
        a[5] = array[offset + 5];
        a[6] = array[offset + 6];
        a[7] = array[offset + 7];
        a[8] = array[offset + 8];
        return a;
    }
    Mat3.fromArray = fromArray;
    function fromColumns(out, left, middle, right) {
        out[0] = left[0];
        out[1] = left[1];
        out[2] = left[2];
        out[3] = middle[0];
        out[4] = middle[1];
        out[5] = middle[2];
        out[6] = right[0];
        out[7] = right[1];
        out[8] = right[2];
        return out;
    }
    Mat3.fromColumns = fromColumns;
    /**
     * Copies the upper-left 3x3 values into the given mat3.
     */
    function fromMat4(out, a) {
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[4];
        out[4] = a[5];
        out[5] = a[6];
        out[6] = a[8];
        out[7] = a[9];
        out[8] = a[10];
        return out;
    }
    Mat3.fromMat4 = fromMat4;
    const _m4 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    function fromEuler(out, euler, order) {
        mat4_1.Mat4.fromEuler(_m4, euler, order);
        return fromMat4(out, _m4);
    }
    Mat3.fromEuler = fromEuler;
    function create(a00, a01, a02, a10, a11, a12, a20, a21, a22) {
        const out = zero();
        out[0] = a00;
        out[1] = a01;
        out[2] = a02;
        out[3] = a10;
        out[4] = a11;
        out[5] = a12;
        out[6] = a20;
        out[7] = a21;
        out[8] = a22;
        return out;
    }
    Mat3.create = create;
    const _id = identity();
    function isIdentity(m, eps) {
        return areEqual(m, _id, typeof eps === 'undefined' ? common_1.EPSILON : eps);
    }
    Mat3.isIdentity = isIdentity;
    function hasNaN(m) {
        for (let i = 0; i < 9; i++)
            if (isNaN(m[i]))
                return true;
        return false;
    }
    Mat3.hasNaN = hasNaN;
    /**
     * Creates a new Mat3 initialized with values from an existing matrix
     */
    function clone(a) {
        return copy(zero(), a);
    }
    Mat3.clone = clone;
    function areEqual(a, b, eps) {
        for (let i = 0; i < 9; i++) {
            if (Math.abs(a[i] - b[i]) > eps)
                return false;
        }
        return true;
    }
    Mat3.areEqual = areEqual;
    function setValue(a, i, j, value) {
        a[3 * j + i] = value;
    }
    Mat3.setValue = setValue;
    function getValue(a, i, j) {
        return a[3 * j + i];
    }
    Mat3.getValue = getValue;
    /**
     * Copy the values from one Mat3 to another
     */
    function copy(out, a) {
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        out[4] = a[4];
        out[5] = a[5];
        out[6] = a[6];
        out[7] = a[7];
        out[8] = a[8];
        return out;
    }
    Mat3.copy = copy;
    /**
     * Transpose the values of a Mat3
     */
    function transpose(out, a) {
        // If we are transposing ourselves we can skip a few steps but have to cache some values
        if (out === a) {
            const a01 = a[1], a02 = a[2], a12 = a[5];
            out[1] = a[3];
            out[2] = a[6];
            out[3] = a01;
            out[5] = a[7];
            out[6] = a02;
            out[7] = a12;
        }
        else {
            out[0] = a[0];
            out[1] = a[3];
            out[2] = a[6];
            out[3] = a[1];
            out[4] = a[4];
            out[5] = a[7];
            out[6] = a[2];
            out[7] = a[5];
            out[8] = a[8];
        }
        return out;
    }
    Mat3.transpose = transpose;
    /**
     * Inverts a Mat3
     */
    function invert(out, a) {
        const a00 = a[0], a01 = a[1], a02 = a[2];
        const a10 = a[3], a11 = a[4], a12 = a[5];
        const a20 = a[6], a21 = a[7], a22 = a[8];
        const b01 = a22 * a11 - a12 * a21;
        const b11 = -a22 * a10 + a12 * a20;
        const b21 = a21 * a10 - a11 * a20;
        // Calculate the determinant
        let det = a00 * b01 + a01 * b11 + a02 * b21;
        if (!det) {
            console.warn('non-invertible matrix.', a);
            return out;
        }
        det = 1.0 / det;
        out[0] = b01 * det;
        out[1] = (-a22 * a01 + a02 * a21) * det;
        out[2] = (a12 * a01 - a02 * a11) * det;
        out[3] = b11 * det;
        out[4] = (a22 * a00 - a02 * a20) * det;
        out[5] = (-a12 * a00 + a02 * a10) * det;
        out[6] = b21 * det;
        out[7] = (-a21 * a00 + a01 * a20) * det;
        out[8] = (a11 * a00 - a01 * a10) * det;
        return out;
    }
    Mat3.invert = invert;
    function symmtricFromUpper(out, a) {
        if (out === a) {
            out[3] = a[1];
            out[6] = a[2];
            out[7] = a[5];
        }
        else {
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[1];
            out[4] = a[4];
            out[5] = a[5];
            out[6] = a[2];
            out[7] = a[5];
            out[8] = a[8];
        }
        return out;
    }
    Mat3.symmtricFromUpper = symmtricFromUpper;
    function symmtricFromLower(out, a) {
        if (out === a) {
            out[1] = a[3];
            out[2] = a[6];
            out[5] = a[7];
        }
        else {
            out[0] = a[0];
            out[1] = a[3];
            out[2] = a[6];
            out[3] = a[3];
            out[4] = a[4];
            out[5] = a[7];
            out[6] = a[6];
            out[7] = a[7];
            out[8] = a[8];
        }
        return out;
    }
    Mat3.symmtricFromLower = symmtricFromLower;
    function determinant(a) {
        const a00 = a[0], a01 = a[1], a02 = a[2];
        const a10 = a[3], a11 = a[4], a12 = a[5];
        const a20 = a[6], a21 = a[7], a22 = a[8];
        const b01 = a22 * a11 - a12 * a21;
        const b11 = -a22 * a10 + a12 * a20;
        const b21 = a21 * a10 - a11 * a20;
        // Calculate the determinant
        return a00 * b01 + a01 * b11 + a02 * b21;
    }
    Mat3.determinant = determinant;
    function trace(a) {
        return a[0] + a[4] + a[8];
    }
    Mat3.trace = trace;
    function sub(out, a, b) {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        out[2] = a[2] - b[2];
        out[3] = a[3] - b[3];
        out[4] = a[4] - b[4];
        out[5] = a[5] - b[5];
        out[6] = a[6] - b[6];
        out[7] = a[7] - b[7];
        out[8] = a[8] - b[8];
        return out;
    }
    Mat3.sub = sub;
    function add(out, a, b) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        out[3] = a[3] + b[3];
        out[4] = a[4] + b[4];
        out[5] = a[5] + b[5];
        out[6] = a[6] + b[6];
        out[7] = a[7] + b[7];
        out[8] = a[8] + b[8];
        return out;
    }
    Mat3.add = add;
    function mul(out, a, b) {
        const a00 = a[0], a01 = a[1], a02 = a[2], a10 = a[3], a11 = a[4], a12 = a[5], a20 = a[6], a21 = a[7], a22 = a[8];
        const b00 = b[0], b01 = b[1], b02 = b[2], b10 = b[3], b11 = b[4], b12 = b[5], b20 = b[6], b21 = b[7], b22 = b[8];
        out[0] = b00 * a00 + b01 * a10 + b02 * a20;
        out[1] = b00 * a01 + b01 * a11 + b02 * a21;
        out[2] = b00 * a02 + b01 * a12 + b02 * a22;
        out[3] = b10 * a00 + b11 * a10 + b12 * a20;
        out[4] = b10 * a01 + b11 * a11 + b12 * a21;
        out[5] = b10 * a02 + b11 * a12 + b12 * a22;
        out[6] = b20 * a00 + b21 * a10 + b22 * a20;
        out[7] = b20 * a01 + b21 * a11 + b22 * a21;
        out[8] = b20 * a02 + b21 * a12 + b22 * a22;
        return out;
    }
    Mat3.mul = mul;
    function subScalar(out, a, s) {
        out[0] = a[0] - s;
        out[1] = a[1] - s;
        out[2] = a[2] - s;
        out[3] = a[3] - s;
        out[4] = a[4] - s;
        out[5] = a[5] - s;
        out[6] = a[6] - s;
        out[7] = a[7] - s;
        out[8] = a[8] - s;
        return out;
    }
    Mat3.subScalar = subScalar;
    function addScalar(out, a, s) {
        out[0] = a[0] + s;
        out[1] = a[1] + s;
        out[2] = a[2] + s;
        out[3] = a[3] + s;
        out[4] = a[4] + s;
        out[5] = a[5] + s;
        out[6] = a[6] + s;
        out[7] = a[7] + s;
        out[8] = a[8] + s;
        return out;
    }
    Mat3.addScalar = addScalar;
    function mulScalar(out, a, s) {
        out[0] = a[0] * s;
        out[1] = a[1] * s;
        out[2] = a[2] * s;
        out[3] = a[3] * s;
        out[4] = a[4] * s;
        out[5] = a[5] * s;
        out[6] = a[6] * s;
        out[7] = a[7] * s;
        out[8] = a[8] * s;
        return out;
    }
    Mat3.mulScalar = mulScalar;
    const piThird = Math.PI / 3;
    const tmpB = zero();
    /**
     * Given a real symmetric 3x3 matrix A, compute the eigenvalues
     *
     * From https://en.wikipedia.org/wiki/Eigenvalue_algorithm#3.C3.973_matrices
     */
    function symmetricEigenvalues(out, a) {
        const p1 = a[1] * a[1] + a[2] * a[2] + a[5] * a[5];
        if (p1 === 0) {
            out[0] = a[0];
            out[1] = a[4];
            out[2] = a[8];
        }
        else {
            const q = trace(a) / 3;
            const a1 = a[0] - q;
            const a2 = a[4] - q;
            const a3 = a[8] - q;
            const p2 = a1 * a1 + a2 * a2 + a3 * a3 + 2 * p1;
            const p = Math.sqrt(p2 / 6);
            mulScalar(tmpB, Mat3.Identity, q);
            sub(tmpB, a, tmpB);
            mulScalar(tmpB, tmpB, (1 / p));
            const r = determinant(tmpB) / 2;
            // In exact arithmetic for a symmetric matrix  -1 <= r <= 1
            // but computation error can leave it slightly outside this range.
            const phi = r <= -1 ? piThird : r >= 1 ?
                0 : Math.acos(r) / 3;
            // the eigenvalues satisfy eig3 <= eig2 <= eig1
            out[0] = q + 2 * p * Math.cos(phi);
            out[2] = q + 2 * p * Math.cos(phi + (2 * piThird));
            out[1] = 3 * q - out[0] - out[2]; // since trace(A) = eig1 + eig2 + eig3
        }
        return out;
    }
    Mat3.symmetricEigenvalues = symmetricEigenvalues;
    const tmpR0 = [0.1, 0.0, 0.0];
    const tmpR1 = [0.1, 0.0, 0.0];
    const tmpR2 = [0.1, 0.0, 0.0];
    const tmpR0xR1 = [0.1, 0.0, 0.0];
    const tmpR0xR2 = [0.1, 0.0, 0.0];
    const tmpR1xR2 = [0.1, 0.0, 0.0];
    /**
     * Calculates the eigenvector for the given eigenvalue `e` of matrix `a`
     */
    function eigenvector(out, a, e) {
        vec3_1.Vec3.set(tmpR0, a[0] - e, a[1], a[2]);
        vec3_1.Vec3.set(tmpR1, a[1], a[4] - e, a[5]);
        vec3_1.Vec3.set(tmpR2, a[2], a[5], a[8] - e);
        vec3_1.Vec3.cross(tmpR0xR1, tmpR0, tmpR1);
        vec3_1.Vec3.cross(tmpR0xR2, tmpR0, tmpR2);
        vec3_1.Vec3.cross(tmpR1xR2, tmpR1, tmpR2);
        const d0 = vec3_1.Vec3.dot(tmpR0xR1, tmpR0xR1);
        const d1 = vec3_1.Vec3.dot(tmpR0xR2, tmpR0xR2);
        const d2 = vec3_1.Vec3.dot(tmpR1xR2, tmpR1xR2);
        let dmax = d0;
        let imax = 0;
        if (d1 > dmax) {
            dmax = d1;
            imax = 1;
        }
        if (d2 > dmax)
            imax = 2;
        if (imax === 0) {
            vec3_1.Vec3.scale(out, tmpR0xR1, 1 / Math.sqrt(d0));
        }
        else if (imax === 1) {
            vec3_1.Vec3.scale(out, tmpR0xR2, 1 / Math.sqrt(d1));
        }
        else {
            vec3_1.Vec3.scale(out, tmpR1xR2, 1 / Math.sqrt(d2));
        }
        return out;
    }
    Mat3.eigenvector = eigenvector;
    /**
     * Get matrix to transform directions, e.g. normals
     */
    function directionTransform(out, t) {
        fromMat4(out, t);
        invert(out, out);
        transpose(out, out);
        return out;
    }
    Mat3.directionTransform = directionTransform;
    Mat3.Identity = identity();
    /** Return the Frobenius inner product of two matrices (= dot product of the flattened matrices).
     * Can be used as a measure of similarity between two rotation matrices. */
    function innerProduct(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
            + a[3] * b[3] + a[4] * b[4] + a[5] * b[5]
            + a[6] * b[6] + a[7] * b[7] + a[8] * b[8];
    }
    Mat3.innerProduct = innerProduct;
})(Mat3 || (exports.Mat3 = Mat3 = {}));
