/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * This code has been modified from https://github.com/mrdoob/three.js/,
 * copyright (c) 2010-2023 three.js authors. MIT License
 */
import { Mat4 } from './mat4';
import { assertUnreachable } from '../../../mol-util/type-helpers';
import { clamp } from '../../interpolate';
function Euler() {
    return Euler.zero();
}
(function (Euler) {
    function zero() {
        // force double backing array by 0.1.
        const ret = [0.1, 0, 0];
        ret[0] = 0.0;
        return ret;
    }
    Euler.zero = zero;
    function create(x, y, z) {
        const out = zero();
        out[0] = x;
        out[1] = y;
        out[2] = z;
        return out;
    }
    Euler.create = create;
    function set(out, x, y, z) {
        out[0] = x;
        out[0] = y;
        out[0] = z;
        return out;
    }
    Euler.set = set;
    function clone(a) {
        const out = zero();
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        return out;
    }
    Euler.clone = clone;
    function copy(out, a) {
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        return out;
    }
    Euler.copy = copy;
    /**
     * Assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
     */
    function fromMat4(out, m, order) {
        const m11 = m[0], m12 = m[4], m13 = m[8];
        const m21 = m[1], m22 = m[5], m23 = m[9];
        const m31 = m[2], m32 = m[6], m33 = m[10];
        switch (order) {
            case 'XYZ':
                out[1] = Math.asin(clamp(m13, -1, 1));
                if (Math.abs(m13) < 0.9999999) {
                    out[0] = Math.atan2(-m23, m33);
                    out[2] = Math.atan2(-m12, m11);
                }
                else {
                    out[0] = Math.atan2(m32, m22);
                    out[2] = 0;
                }
                break;
            case 'YXZ':
                out[0] = Math.asin(-clamp(m23, -1, 1));
                if (Math.abs(m23) < 0.9999999) {
                    out[1] = Math.atan2(m13, m33);
                    out[2] = Math.atan2(m21, m22);
                }
                else {
                    out[1] = Math.atan2(-m31, m11);
                    out[2] = 0;
                }
                break;
            case 'ZXY':
                out[0] = Math.asin(clamp(m32, -1, 1));
                if (Math.abs(m32) < 0.9999999) {
                    out[1] = Math.atan2(-m31, m33);
                    out[2] = Math.atan2(-m12, m22);
                }
                else {
                    out[1] = 0;
                    out[2] = Math.atan2(m21, m11);
                }
                break;
            case 'ZYX':
                out[1] = Math.asin(-clamp(m31, -1, 1));
                if (Math.abs(m31) < 0.9999999) {
                    out[0] = Math.atan2(m32, m33);
                    out[2] = Math.atan2(m21, m11);
                }
                else {
                    out[0] = 0;
                    out[2] = Math.atan2(-m12, m22);
                }
                break;
            case 'YZX':
                out[2] = Math.asin(clamp(m21, -1, 1));
                if (Math.abs(m21) < 0.9999999) {
                    out[0] = Math.atan2(-m23, m22);
                    out[1] = Math.atan2(-m31, m11);
                }
                else {
                    out[0] = 0;
                    out[1] = Math.atan2(m13, m33);
                }
                break;
            case 'XZY':
                out[2] = Math.asin(-clamp(m12, -1, 1));
                if (Math.abs(m12) < 0.9999999) {
                    out[0] = Math.atan2(m32, m22);
                    out[1] = Math.atan2(m13, m11);
                }
                else {
                    out[0] = Math.atan2(-m23, m33);
                    out[1] = 0;
                }
                break;
            default:
                assertUnreachable(order);
        }
        return out;
    }
    Euler.fromMat4 = fromMat4;
    const _mat4 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    function fromQuat(out, q, order) {
        Mat4.fromQuat(_mat4, q);
        return fromMat4(out, _mat4, order);
    }
    Euler.fromQuat = fromQuat;
    function fromVec3(out, v) {
        return set(out, v[0], v[1], v[2]);
    }
    Euler.fromVec3 = fromVec3;
    function exactEquals(a, b) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
    }
    Euler.exactEquals = exactEquals;
    function fromArray(e, array, offset) {
        e[0] = array[offset + 0];
        e[1] = array[offset + 1];
        e[2] = array[offset + 2];
        return e;
    }
    Euler.fromArray = fromArray;
    function toArray(e, out, offset) {
        out[offset + 0] = e[0];
        out[offset + 1] = e[1];
        out[offset + 2] = e[2];
        return out;
    }
    Euler.toArray = toArray;
})(Euler || (Euler = {}));
export { Euler };
