/**
 * Copyright (c) 2022-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * This code has been modified from https://github.com/mrdoob/three.js/,
 * copyright (c) 2010-2022 three.js authors. MIT License
 */
import { Vec3 } from '../../linear-algebra/3d/vec3';
function Plane3D() {
    return Plane3D.create(Vec3.create(1, 0, 0), 0);
}
(function (Plane3D) {
    function create(normal, constant) { return { normal, constant }; }
    Plane3D.create = create;
    function copy(out, p) {
        Vec3.copy(out.normal, p.normal);
        out.constant = p.constant;
        return out;
    }
    Plane3D.copy = copy;
    function clone(p) {
        return copy(Plane3D(), p);
    }
    Plane3D.clone = clone;
    function normalize(out, p) {
        // Note: will lead to a divide by zero if the plane is invalid.
        const inverseNormalLength = 1.0 / Vec3.magnitude(p.normal);
        Vec3.scale(out.normal, p.normal, inverseNormalLength);
        out.constant = p.constant * inverseNormalLength;
        return out;
    }
    Plane3D.normalize = normalize;
    function negate(out, p) {
        Vec3.negate(out.normal, p.normal);
        out.constant = -p.constant;
        return out;
    }
    Plane3D.negate = negate;
    function toArray(p, out, offset) {
        Vec3.toArray(p.normal, out, offset);
        out[offset + 3] = p.constant;
        return out;
    }
    Plane3D.toArray = toArray;
    function fromArray(out, array, offset) {
        Vec3.fromArray(out.normal, array, offset);
        out.constant = array[offset + 3];
        return out;
    }
    Plane3D.fromArray = fromArray;
    function fromNormalAndCoplanarPoint(out, normal, point) {
        Vec3.copy(out.normal, normal);
        out.constant = -Vec3.dot(out.normal, point);
        return out;
    }
    Plane3D.fromNormalAndCoplanarPoint = fromNormalAndCoplanarPoint;
    function fromCoplanarPoints(out, a, b, c) {
        const normal = Vec3.triangleNormal(Vec3(), a, b, c);
        fromNormalAndCoplanarPoint(out, normal, a);
        return out;
    }
    Plane3D.fromCoplanarPoints = fromCoplanarPoints;
    const unnormTmpV = Vec3();
    function setUnnormalized(out, nx, ny, nz, constant) {
        Vec3.set(unnormTmpV, nx, ny, nz);
        const inverseNormalLength = 1.0 / Vec3.magnitude(unnormTmpV);
        Vec3.scale(out.normal, unnormTmpV, inverseNormalLength);
        out.constant = constant * inverseNormalLength;
        return out;
    }
    Plane3D.setUnnormalized = setUnnormalized;
    function distanceToPoint(plane, point) {
        return Vec3.dot(plane.normal, point) + plane.constant;
    }
    Plane3D.distanceToPoint = distanceToPoint;
    function distanceToSpher3D(plane, sphere) {
        return distanceToPoint(plane, sphere.center) - sphere.radius;
    }
    Plane3D.distanceToSpher3D = distanceToSpher3D;
    function projectPoint(out, plane, point) {
        return Vec3.scaleAndAdd(out, out, plane.normal, -distanceToPoint(plane, point));
    }
    Plane3D.projectPoint = projectPoint;
})(Plane3D || (Plane3D = {}));
export { Plane3D };
