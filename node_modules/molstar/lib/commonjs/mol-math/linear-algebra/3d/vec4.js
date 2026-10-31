"use strict";
/**
 * Copyright (c) 2017-2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vec4 = Vec4;
const common_1 = require("./common");
function Vec4() {
    return Vec4.zero();
}
(function (Vec4) {
    function zero() {
        // force double backing array by 0.1.
        const ret = [0.1, 0, 0, 0];
        ret[0] = 0.0;
        return ret;
    }
    Vec4.zero = zero;
    function clone(a) {
        const out = zero();
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        return out;
    }
    Vec4.clone = clone;
    function create(x, y, z, w) {
        const out = zero();
        out[0] = x;
        out[1] = y;
        out[2] = z;
        out[3] = w;
        return out;
    }
    Vec4.create = create;
    function fromSphere(out, sphere) {
        out[0] = sphere.center[0];
        out[1] = sphere.center[1];
        out[2] = sphere.center[2];
        out[3] = sphere.radius;
        return out;
    }
    Vec4.fromSphere = fromSphere;
    function ofSphere(sphere) {
        return fromSphere(zero(), sphere);
    }
    Vec4.ofSphere = ofSphere;
    function hasNaN(a) {
        return isNaN(a[0]) || isNaN(a[1]) || isNaN(a[2]) || isNaN(a[3]);
    }
    Vec4.hasNaN = hasNaN;
    function toArray(a, out, offset) {
        out[offset + 0] = a[0];
        out[offset + 1] = a[1];
        out[offset + 2] = a[2];
        out[offset + 3] = a[3];
        return out;
    }
    Vec4.toArray = toArray;
    function fromArray(a, array, offset) {
        a[0] = array[offset + 0];
        a[1] = array[offset + 1];
        a[2] = array[offset + 2];
        a[3] = array[offset + 3];
        return a;
    }
    Vec4.fromArray = fromArray;
    function toVec3Array(a, out, offset) {
        out[offset + 0] = a[0];
        out[offset + 1] = a[1];
        out[offset + 2] = a[2];
    }
    Vec4.toVec3Array = toVec3Array;
    function fromVec3Array(a, array, offset) {
        a[0] = array[offset + 0];
        a[1] = array[offset + 1];
        a[2] = array[offset + 2];
        a[3] = 0;
        return a;
    }
    Vec4.fromVec3Array = fromVec3Array;
    function copy(out, a) {
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        return out;
    }
    Vec4.copy = copy;
    function set(out, x, y, z, w) {
        out[0] = x;
        out[1] = y;
        out[2] = z;
        out[3] = w;
        return out;
    }
    Vec4.set = set;
    function add(out, a, b) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        out[3] = a[3] + b[3];
        return out;
    }
    Vec4.add = add;
    function distance(a, b) {
        const x = b[0] - a[0], y = b[1] - a[1], z = b[2] - a[2], w = b[3] - a[3];
        return Math.sqrt(x * x + y * y + z * z + w * w);
    }
    Vec4.distance = distance;
    function scale(out, a, b) {
        out[0] = a[0] * b;
        out[1] = a[1] * b;
        out[2] = a[2] * b;
        out[4] = a[4] * b;
        return out;
    }
    Vec4.scale = scale;
    /**
     * Math.round the components of a Vec4
     */
    function round(out, a) {
        out[0] = Math.round(a[0]);
        out[1] = Math.round(a[1]);
        out[2] = Math.round(a[2]);
        out[3] = Math.round(a[3]);
        return out;
    }
    Vec4.round = round;
    /**
     * Math.ceil the components of a Vec4
     */
    function ceil(out, a) {
        out[0] = Math.ceil(a[0]);
        out[1] = Math.ceil(a[1]);
        out[2] = Math.ceil(a[2]);
        out[3] = Math.ceil(a[3]);
        return out;
    }
    Vec4.ceil = ceil;
    /**
     * Math.floor the components of a Vec3
     */
    function floor(out, a) {
        out[0] = Math.floor(a[0]);
        out[1] = Math.floor(a[1]);
        out[2] = Math.floor(a[2]);
        out[3] = Math.floor(a[3]);
        return out;
    }
    Vec4.floor = floor;
    function squaredDistance(a, b) {
        const x = b[0] - a[0], y = b[1] - a[1], z = b[2] - a[2], w = b[3] - a[3];
        return x * x + y * y + z * z + w * w;
    }
    Vec4.squaredDistance = squaredDistance;
    function norm(a) {
        const x = a[0], y = a[1], z = a[2], w = a[3];
        return Math.sqrt(x * x + y * y + z * z + w * w);
    }
    Vec4.norm = norm;
    function squaredNorm(a) {
        const x = a[0], y = a[1], z = a[2], w = a[3];
        return x * x + y * y + z * z + w * w;
    }
    Vec4.squaredNorm = squaredNorm;
    function transformMat4(out, a, m) {
        const x = a[0], y = a[1], z = a[2], w = a[3];
        out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
        out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
        out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
        out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
        return out;
    }
    Vec4.transformMat4 = transformMat4;
    function dot(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
    }
    Vec4.dot = dot;
    /**
     * Returns the inverse of the components of a Vec4
     */
    function inverse(out, a) {
        out[0] = 1.0 / a[0];
        out[1] = 1.0 / a[1];
        out[2] = 1.0 / a[2];
        out[3] = 1.0 / a[3];
        return out;
    }
    Vec4.inverse = inverse;
    /**
     * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
     */
    function exactEquals(a, b) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
    }
    Vec4.exactEquals = exactEquals;
    /**
     * Returns whether or not the vectors have approximately the same elements in the same position.
     */
    function equals(a, b) {
        const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
        const b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
        return (Math.abs(a0 - b0) <= common_1.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <= common_1.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
            Math.abs(a2 - b2) <= common_1.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
            Math.abs(a3 - b3) <= common_1.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)));
    }
    Vec4.equals = equals;
    function toString(a, precision) {
        return `[${a[0].toPrecision(precision)} ${a[1].toPrecision(precision)} ${a[2].toPrecision(precision)}  ${a[3].toPrecision(precision)}]`;
    }
    Vec4.toString = toString;
})(Vec4 || (exports.Vec4 = Vec4 = {}));
