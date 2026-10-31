"use strict";
/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Axes3D = Axes3D;
const linear_algebra_1 = require("../../linear-algebra");
function Axes3D() {
    return Axes3D.empty();
}
(function (Axes3D) {
    function create(origin, dirA, dirB, dirC) { return { origin, dirA, dirB, dirC }; }
    Axes3D.create = create;
    function empty() { return { origin: (0, linear_algebra_1.Vec3)(), dirA: (0, linear_algebra_1.Vec3)(), dirB: (0, linear_algebra_1.Vec3)(), dirC: (0, linear_algebra_1.Vec3)() }; }
    Axes3D.empty = empty;
    function copy(out, a) {
        linear_algebra_1.Vec3.copy(out.origin, a.origin);
        linear_algebra_1.Vec3.copy(out.dirA, a.dirA);
        linear_algebra_1.Vec3.copy(out.dirB, a.dirB);
        linear_algebra_1.Vec3.copy(out.dirC, a.dirC);
        return out;
    }
    Axes3D.copy = copy;
    function clone(a) {
        return copy(empty(), a);
    }
    Axes3D.clone = clone;
    /** Get size of each direction */
    function size(size, axes) {
        return linear_algebra_1.Vec3.set(size, linear_algebra_1.Vec3.magnitude(axes.dirA) * 2, linear_algebra_1.Vec3.magnitude(axes.dirB) * 2, linear_algebra_1.Vec3.magnitude(axes.dirC) * 2);
    }
    Axes3D.size = size;
    const tmpSizeV = (0, linear_algebra_1.Vec3)();
    /** Get volume of the oriented box wrapping the axes */
    function volume(axes) {
        size(tmpSizeV, axes);
        return tmpSizeV[0] * tmpSizeV[1] * tmpSizeV[2];
    }
    Axes3D.volume = volume;
    function normalize(out, a) {
        linear_algebra_1.Vec3.copy(out.origin, a.origin);
        linear_algebra_1.Vec3.normalize(out.dirA, a.dirA);
        linear_algebra_1.Vec3.normalize(out.dirB, a.dirB);
        linear_algebra_1.Vec3.normalize(out.dirC, a.dirC);
        return out;
    }
    Axes3D.normalize = normalize;
    const tmpTransformMat3 = (0, linear_algebra_1.Mat3)();
    /** Transform axes with a Mat4 */
    function transform(out, a, m) {
        linear_algebra_1.Vec3.transformMat4(out.origin, a.origin, m);
        const n = linear_algebra_1.Mat3.directionTransform(tmpTransformMat3, m);
        linear_algebra_1.Vec3.transformMat3(out.dirA, a.dirA, n);
        linear_algebra_1.Vec3.transformMat3(out.dirB, a.dirB, n);
        linear_algebra_1.Vec3.transformMat3(out.dirC, a.dirC, n);
        return out;
    }
    Axes3D.transform = transform;
    function scale(out, a, scale) {
        linear_algebra_1.Vec3.scale(out.dirA, a.dirA, scale);
        linear_algebra_1.Vec3.scale(out.dirB, a.dirB, scale);
        linear_algebra_1.Vec3.scale(out.dirC, a.dirC, scale);
        return out;
    }
    Axes3D.scale = scale;
})(Axes3D || (exports.Axes3D = Axes3D = {}));
