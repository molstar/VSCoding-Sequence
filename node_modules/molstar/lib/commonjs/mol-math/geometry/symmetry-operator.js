"use strict";
/**
 * Copyright (c) 2017-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymmetryOperator = void 0;
const interpolate_1 = require("../../mol-math/interpolate");
const mat3_1 = require("../linear-algebra/3d/mat3");
const mat4_1 = require("../linear-algebra/3d/mat4");
const quat_1 = require("../linear-algebra/3d/quat");
const vec3_1 = require("../linear-algebra/3d/vec3");
var SymmetryOperator;
(function (SymmetryOperator) {
    SymmetryOperator.DefaultName = '1_555';
    SymmetryOperator.Default = create(SymmetryOperator.DefaultName, mat4_1.Mat4.identity());
    SymmetryOperator.RotationTranslationEpsilon = 0.005;
    function create(name, matrix, info) {
        let { assembly, ncsId, hkl, spgrOp, key } = info || {};
        const _hkl = hkl ? vec3_1.Vec3.clone(hkl) : (0, vec3_1.Vec3)();
        spgrOp = spgrOp !== null && spgrOp !== void 0 ? spgrOp : -1;
        key = key !== null && key !== void 0 ? key : -1;
        ncsId = ncsId || -1;
        const isIdentity = mat4_1.Mat4.isIdentity(matrix);
        const suffix = getSuffix(info, isIdentity);
        if (isIdentity)
            return { name, assembly, matrix, inverse: mat4_1.Mat4.identity(), isIdentity: true, hkl: _hkl, spgrOp, ncsId, suffix, key };
        if (!mat4_1.Mat4.isRotationAndTranslation(matrix, SymmetryOperator.RotationTranslationEpsilon)) {
            console.warn(`Symmetry operator (${name}) should be a composition of rotation and translation.`);
        }
        return { name, assembly, matrix, inverse: mat4_1.Mat4.invert((0, mat4_1.Mat4)(), matrix), isIdentity: false, hkl: _hkl, spgrOp, key, ncsId, suffix };
    }
    SymmetryOperator.create = create;
    function isSymmetryOperator(x) {
        return !!x && !!x.matrix && !!x.inverse && typeof x.name === 'string';
    }
    function getSuffix(info, isIdentity) {
        if (!info)
            return '';
        if (info.assembly) {
            if (isSymmetryOperator(info))
                return info.suffix;
            return isIdentity ? '' : `_${info.assembly.operId}`;
        }
        if (typeof info.spgrOp !== 'undefined' && typeof info.hkl !== 'undefined' && info.spgrOp !== -1) {
            const [i, j, k] = info.hkl;
            return `-${info.spgrOp + 1}_${5 + i}${5 + j}${5 + k}`;
        }
        if (info.ncsId !== -1) {
            return `_${info.ncsId}`;
        }
        return '';
    }
    const _m = (0, mat4_1.Mat4)();
    function checkIfRotationAndTranslation(rot, offset) {
        mat4_1.Mat4.setIdentity(_m);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                mat4_1.Mat4.setValue(_m, i, j, mat3_1.Mat3.getValue(rot, i, j));
            }
        }
        mat4_1.Mat4.setTranslation(_m, offset);
        return mat4_1.Mat4.isRotationAndTranslation(_m, SymmetryOperator.RotationTranslationEpsilon);
    }
    SymmetryOperator.checkIfRotationAndTranslation = checkIfRotationAndTranslation;
    function ofRotationAndOffset(name, rot, offset, ncsId) {
        const t = mat4_1.Mat4.identity();
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                mat4_1.Mat4.setValue(t, i, j, mat3_1.Mat3.getValue(rot, i, j));
            }
        }
        mat4_1.Mat4.setTranslation(t, offset);
        return create(name, t, { ncsId });
    }
    SymmetryOperator.ofRotationAndOffset = ofRotationAndOffset;
    const _q1 = quat_1.Quat.identity(), _q2 = (0, quat_1.Quat)(), _q3 = (0, quat_1.Quat)(), _axis = (0, vec3_1.Vec3)();
    function lerpFromIdentity(out, op, t) {
        const m = op.inverse;
        if (op.isIdentity)
            return mat4_1.Mat4.copy(out, m);
        const _t = 1 - t;
        // interpolate rotation
        mat4_1.Mat4.getRotation(_q2, m);
        quat_1.Quat.slerp(_q2, _q1, _q2, _t);
        const angle = quat_1.Quat.getAxisAngle(_axis, _q2);
        mat4_1.Mat4.fromRotation(out, angle, _axis);
        // interpolate translation
        mat4_1.Mat4.setValue(out, 0, 3, _t * mat4_1.Mat4.getValue(m, 0, 3));
        mat4_1.Mat4.setValue(out, 1, 3, _t * mat4_1.Mat4.getValue(m, 1, 3));
        mat4_1.Mat4.setValue(out, 2, 3, _t * mat4_1.Mat4.getValue(m, 2, 3));
        return out;
    }
    SymmetryOperator.lerpFromIdentity = lerpFromIdentity;
    function slerp(out, src, tar, t) {
        if (Math.abs(t) <= 0.00001)
            return mat4_1.Mat4.copy(out, src);
        if (Math.abs(t - 1) <= 0.00001)
            return mat4_1.Mat4.copy(out, tar);
        // interpolate rotation
        mat4_1.Mat4.getRotation(_q2, src);
        mat4_1.Mat4.getRotation(_q3, tar);
        quat_1.Quat.slerp(_q3, _q2, _q3, t);
        const angle = quat_1.Quat.getAxisAngle(_axis, _q3);
        mat4_1.Mat4.fromRotation(out, angle, _axis);
        // interpolate translation
        mat4_1.Mat4.setValue(out, 0, 3, (0, interpolate_1.lerp)(mat4_1.Mat4.getValue(src, 0, 3), mat4_1.Mat4.getValue(tar, 0, 3), t));
        mat4_1.Mat4.setValue(out, 1, 3, (0, interpolate_1.lerp)(mat4_1.Mat4.getValue(src, 1, 3), mat4_1.Mat4.getValue(tar, 1, 3), t));
        mat4_1.Mat4.setValue(out, 2, 3, (0, interpolate_1.lerp)(mat4_1.Mat4.getValue(src, 2, 3), mat4_1.Mat4.getValue(tar, 2, 3), t));
        return out;
    }
    SymmetryOperator.slerp = slerp;
    /**
     * Apply the 1st and then 2nd operator. ( = second.matrix * first.matrix).
     * Keep `name`, `assembly`, `ncsId`, `hkl` and `spgrOpId` properties from second.
     */
    function compose(first, second) {
        const matrix = mat4_1.Mat4.mul((0, mat4_1.Mat4)(), second.matrix, first.matrix);
        return create(second.name, matrix, second);
    }
    SymmetryOperator.compose = compose;
    class _ArrayMapping {
        constructor(operator, coordinates, r = _zeroRadius) {
            this.operator = operator;
            this.coordinates = coordinates;
            this.r = r;
            this._x = coordinates.x;
            this._y = coordinates.y;
            this._z = coordinates.z;
            this._m = operator.matrix;
        }
        invariantPosition(i, s) {
            s[0] = this._x[i];
            s[1] = this._y[i];
            s[2] = this._z[i];
            return s;
        }
        position(i, s) {
            s[0] = this._x[i];
            s[1] = this._y[i];
            s[2] = this._z[i];
            vec3_1.Vec3.transformMat4(s, s, this._m);
            return s;
        }
        x(i) {
            const m = this._m;
            const xx = m[0], yy = m[4], zz = m[8], tx = m[12];
            const x = this._x[i], y = this._y[i], z = this._z[i], w = (m[3] * x + m[7] * y + m[11] * z + m[15]) || 1.0;
            return (xx * x + yy * y + zz * z + tx) / w;
        }
        y(i) {
            const m = this._m;
            const xx = m[1], yy = m[5], zz = m[9], ty = m[13];
            const x = this._x[i], y = this._y[i], z = this._z[i], w = (m[3] * x + m[7] * y + m[11] * z + m[15]) || 1.0;
            return (xx * x + yy * y + zz * z + ty) / w;
        }
        z(i) {
            const m = this._m;
            const xx = m[2], yy = m[6], zz = m[10], tz = m[14];
            const x = this._x[i], y = this._y[i], z = this._z[i], w = (m[3] * x + m[7] * y + m[11] * z + m[15]) || 1.0;
            return (xx * x + yy * y + zz * z + tz) / w;
        }
    }
    class _ArrayMappingW1 {
        constructor(operator, coordinates, r = _zeroRadius) {
            this.operator = operator;
            this.coordinates = coordinates;
            this.r = r;
            this._x = coordinates.x;
            this._y = coordinates.y;
            this._z = coordinates.z;
            this._m = operator.matrix;
        }
        invariantPosition(i, s) {
            s[0] = this._x[i];
            s[1] = this._y[i];
            s[2] = this._z[i];
            return s;
        }
        position(i, s) {
            s[0] = this.x(i);
            s[1] = this.y(i);
            s[2] = this.z(i);
            return s;
        }
        x(i) {
            const m = this._m;
            return m[0] * this._x[i] + m[4] * this._y[i] + m[8] * this._z[i] + m[12];
        }
        y(i) {
            const m = this._m;
            return m[1] * this._x[i] + m[5] * this._y[i] + m[9] * this._z[i] + m[13];
        }
        z(i) {
            const m = this._m;
            return m[2] * this._x[i] + m[6] * this._y[i] + m[10] * this._z[i] + m[14];
        }
    }
    class _ArrayMappingIdentity {
        constructor(operator, coordinates, r = _zeroRadius) {
            this.operator = operator;
            this.coordinates = coordinates;
            this.r = r;
            this._x = coordinates.x;
            this._y = coordinates.y;
            this._z = coordinates.z;
        }
        invariantPosition(i, s) {
            s[0] = this._x[i];
            s[1] = this._y[i];
            s[2] = this._z[i];
            return s;
        }
        position(i, s) {
            s[0] = this._x[i];
            s[1] = this._y[i];
            s[2] = this._z[i];
            return s;
        }
        x(i) {
            return this._x[i];
        }
        y(i) {
            return this._y[i];
        }
        z(i) {
            return this._z[i];
        }
    }
    function createMapping(operator, coords, radius = _zeroRadius) {
        return mat4_1.Mat4.isIdentity(operator.matrix)
            ? new _ArrayMappingIdentity(operator, coords, radius)
            : isW1(operator.matrix)
                ? new _ArrayMappingW1(operator, coords, radius)
                : new _ArrayMapping(operator, coords, radius);
    }
    SymmetryOperator.createMapping = createMapping;
})(SymmetryOperator || (exports.SymmetryOperator = SymmetryOperator = {}));
function _zeroRadius(_i) { return 0; }
function isW1(m) {
    return m[3] === 0 && m[7] === 0 && m[11] === 0 && m[15] === 1;
}
