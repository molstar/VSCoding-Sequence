/**
 * Copyright (c) 2022-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * This code has been modified from https://github.com/mrdoob/three.js/,
 * copyright (c) 2010-2022 three.js authors. MIT License
 */
import { Vec3 } from '../../linear-algebra/3d/vec3';
import { Plane3D } from './plane3d';
function Frustum3D() {
    return Frustum3D.create(Plane3D(), Plane3D(), Plane3D(), Plane3D(), Plane3D(), Plane3D());
}
(function (Frustum3D) {
    ;
    function create(right, left, bottom, top, far, near) {
        return [right, left, bottom, top, far, near];
    }
    Frustum3D.create = create;
    function copy(out, f) {
        for (let i = 0; i < 6; ++i)
            Plane3D.copy(out[i], f[i]);
        return out;
    }
    Frustum3D.copy = copy;
    function clone(f) {
        return copy(Frustum3D(), f);
    }
    Frustum3D.clone = clone;
    function fromProjectionMatrix(out, m) {
        const a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3];
        const a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7];
        const a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11];
        const a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];
        Plane3D.setUnnormalized(out[0], a03 - a00, a13 - a10, a23 - a20, a33 - a30);
        Plane3D.setUnnormalized(out[1], a03 + a00, a13 + a10, a23 + a20, a33 + a30);
        Plane3D.setUnnormalized(out[2], a03 + a01, a13 + a11, a23 + a21, a33 + a31);
        Plane3D.setUnnormalized(out[3], a03 - a01, a13 - a11, a23 - a21, a33 - a31);
        Plane3D.setUnnormalized(out[4], a03 - a02, a13 - a12, a23 - a22, a33 - a32);
        Plane3D.setUnnormalized(out[5], a03 + a02, a13 + a12, a23 + a22, a33 + a32);
        return out;
    }
    Frustum3D.fromProjectionMatrix = fromProjectionMatrix;
    function intersectsSphere3D(frustum, sphere) {
        const center = sphere.center;
        const negRadius = -sphere.radius;
        for (let i = 0; i < 6; ++i) {
            const distance = Plane3D.distanceToPoint(frustum[i], center);
            if (distance < negRadius)
                return false;
        }
        return true;
    }
    Frustum3D.intersectsSphere3D = intersectsSphere3D;
    const boxTmpV = Vec3();
    function intersectsBox3D(frustum, box) {
        for (let i = 0; i < 6; ++i) {
            const plane = frustum[i];
            // corner at max distance
            boxTmpV[0] = plane.normal[0] > 0 ? box.max[0] : box.min[0];
            boxTmpV[1] = plane.normal[1] > 0 ? box.max[1] : box.min[1];
            boxTmpV[2] = plane.normal[2] > 0 ? box.max[2] : box.min[2];
            if (Plane3D.distanceToPoint(plane, boxTmpV) < 0) {
                return false;
            }
        }
        return true;
    }
    Frustum3D.intersectsBox3D = intersectsBox3D;
    function containsPoint(frustum, point) {
        for (let i = 0; i < 6; ++i) {
            if (Plane3D.distanceToPoint(frustum[i], point) < 0) {
                return false;
            }
        }
        return true;
    }
    Frustum3D.containsPoint = containsPoint;
})(Frustum3D || (Frustum3D = {}));
export { Frustum3D };
