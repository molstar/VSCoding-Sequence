/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Vec3, Mat3 } from '../../linear-algebra';
function Axes3D() {
    return Axes3D.empty();
}
(function (Axes3D) {
    function create(origin, dirA, dirB, dirC) { return { origin, dirA, dirB, dirC }; }
    Axes3D.create = create;
    function empty() { return { origin: Vec3(), dirA: Vec3(), dirB: Vec3(), dirC: Vec3() }; }
    Axes3D.empty = empty;
    function copy(out, a) {
        Vec3.copy(out.origin, a.origin);
        Vec3.copy(out.dirA, a.dirA);
        Vec3.copy(out.dirB, a.dirB);
        Vec3.copy(out.dirC, a.dirC);
        return out;
    }
    Axes3D.copy = copy;
    function clone(a) {
        return copy(empty(), a);
    }
    Axes3D.clone = clone;
    /** Get size of each direction */
    function size(size, axes) {
        return Vec3.set(size, Vec3.magnitude(axes.dirA) * 2, Vec3.magnitude(axes.dirB) * 2, Vec3.magnitude(axes.dirC) * 2);
    }
    Axes3D.size = size;
    const tmpSizeV = Vec3();
    /** Get volume of the oriented box wrapping the axes */
    function volume(axes) {
        size(tmpSizeV, axes);
        return tmpSizeV[0] * tmpSizeV[1] * tmpSizeV[2];
    }
    Axes3D.volume = volume;
    function normalize(out, a) {
        Vec3.copy(out.origin, a.origin);
        Vec3.normalize(out.dirA, a.dirA);
        Vec3.normalize(out.dirB, a.dirB);
        Vec3.normalize(out.dirC, a.dirC);
        return out;
    }
    Axes3D.normalize = normalize;
    const tmpTransformMat3 = Mat3();
    /** Transform axes with a Mat4 */
    function transform(out, a, m) {
        Vec3.transformMat4(out.origin, a.origin, m);
        const n = Mat3.directionTransform(tmpTransformMat3, m);
        Vec3.transformMat3(out.dirA, a.dirA, n);
        Vec3.transformMat3(out.dirB, a.dirB, n);
        Vec3.transformMat3(out.dirC, a.dirC, n);
        return out;
    }
    Axes3D.transform = transform;
    function scale(out, a, scale) {
        Vec3.scale(out.dirA, a.dirA, scale);
        Vec3.scale(out.dirB, a.dirB, scale);
        Vec3.scale(out.dirC, a.dirC, scale);
        return out;
    }
    Axes3D.scale = scale;
})(Axes3D || (Axes3D = {}));
export { Axes3D };
