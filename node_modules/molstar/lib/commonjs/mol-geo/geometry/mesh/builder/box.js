"use strict";
/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.addBoundingBox = addBoundingBox;
exports.addOrientedBox = addOrientedBox;
const linear_algebra_1 = require("../../../../mol-math/linear-algebra");
const geometry_1 = require("../../../../mol-math/geometry");
const mesh_builder_1 = require("../mesh-builder");
const cylinder_1 = require("./cylinder");
const sphere_1 = require("./sphere");
const cage_1 = require("../../../primitive/cage");
const tmpStart = linear_algebra_1.Vec3.zero();
const tmpEnd = linear_algebra_1.Vec3.zero();
const cylinderProps = {};
function addBoundingBox(state, box, radius, detail, radialSegments) {
    const { min, max } = box;
    cylinderProps.radiusTop = radius;
    cylinderProps.radiusBottom = radius;
    cylinderProps.radialSegments = radialSegments;
    linear_algebra_1.Vec3.set(tmpStart, max[0], max[1], max[2]);
    (0, sphere_1.addSphere)(state, tmpStart, radius, detail);
    linear_algebra_1.Vec3.set(tmpEnd, max[0], max[1], min[2]);
    (0, cylinder_1.addCylinder)(state, tmpStart, tmpEnd, 1, cylinderProps);
    linear_algebra_1.Vec3.set(tmpEnd, max[0], min[1], max[2]);
    (0, cylinder_1.addCylinder)(state, tmpStart, tmpEnd, 1, cylinderProps);
    linear_algebra_1.Vec3.set(tmpEnd, min[0], max[1], max[2]);
    (0, cylinder_1.addCylinder)(state, tmpStart, tmpEnd, 1, cylinderProps);
    linear_algebra_1.Vec3.set(tmpStart, min[0], min[1], min[2]);
    (0, sphere_1.addSphere)(state, tmpStart, radius, detail);
    linear_algebra_1.Vec3.set(tmpEnd, min[0], min[1], max[2]);
    (0, cylinder_1.addCylinder)(state, tmpStart, tmpEnd, 1, cylinderProps);
    linear_algebra_1.Vec3.set(tmpEnd, min[0], max[1], min[2]);
    (0, cylinder_1.addCylinder)(state, tmpStart, tmpEnd, 1, cylinderProps);
    linear_algebra_1.Vec3.set(tmpEnd, max[0], min[1], min[2]);
    (0, cylinder_1.addCylinder)(state, tmpStart, tmpEnd, 1, cylinderProps);
    linear_algebra_1.Vec3.set(tmpStart, max[0], min[1], min[2]);
    (0, sphere_1.addSphere)(state, tmpStart, radius, detail);
    linear_algebra_1.Vec3.set(tmpEnd, max[0], min[1], max[2]);
    (0, cylinder_1.addCylinder)(state, tmpStart, tmpEnd, 1, cylinderProps);
    linear_algebra_1.Vec3.set(tmpEnd, max[0], max[1], min[2]);
    (0, cylinder_1.addCylinder)(state, tmpStart, tmpEnd, 1, cylinderProps);
    linear_algebra_1.Vec3.set(tmpStart, min[0], min[1], max[2]);
    (0, sphere_1.addSphere)(state, tmpStart, radius, detail);
    linear_algebra_1.Vec3.set(tmpEnd, min[0], max[1], max[2]);
    (0, cylinder_1.addCylinder)(state, tmpStart, tmpEnd, 1, cylinderProps);
    linear_algebra_1.Vec3.set(tmpEnd, max[0], min[1], max[2]);
    (0, cylinder_1.addCylinder)(state, tmpStart, tmpEnd, 1, cylinderProps);
    linear_algebra_1.Vec3.set(tmpStart, min[0], max[1], min[2]);
    (0, sphere_1.addSphere)(state, tmpStart, radius, detail);
    linear_algebra_1.Vec3.set(tmpEnd, max[0], max[1], min[2]);
    (0, sphere_1.addSphere)(state, tmpEnd, radius, detail);
    (0, cylinder_1.addCylinder)(state, tmpStart, tmpEnd, 1, cylinderProps);
    linear_algebra_1.Vec3.set(tmpEnd, min[0], max[1], max[2]);
    (0, sphere_1.addSphere)(state, tmpEnd, radius, detail);
    (0, cylinder_1.addCylinder)(state, tmpStart, tmpEnd, 1, cylinderProps);
}
//
const tmpBoxVecCorner = (0, linear_algebra_1.Vec3)();
const tmpBoxVecA = (0, linear_algebra_1.Vec3)();
const tmpBoxVecB = (0, linear_algebra_1.Vec3)();
const tmpBoxVecC = (0, linear_algebra_1.Vec3)();
const tmpMatrix = linear_algebra_1.Mat4.identity();
const tmpVertices = new Float32Array(8 * 3);
const tmpEdges = new Uint8Array([
    0, 1, 0, 3, 0, 6, 1, 2, 1, 7, 2, 3,
    2, 4, 3, 5, 4, 5, 4, 7, 5, 6, 6, 7
]);
function addOrientedBox(state, axes, radiusScale, detail, radialSegments) {
    const { origin, dirA, dirB, dirC } = axes;
    const negDirA = linear_algebra_1.Vec3.negate(tmpBoxVecA, dirA);
    const negDirB = linear_algebra_1.Vec3.negate(tmpBoxVecB, dirB);
    const negDirC = linear_algebra_1.Vec3.negate(tmpBoxVecC, dirC);
    let offset = 0;
    const addCornerHelper = function (v1, v2, v3) {
        linear_algebra_1.Vec3.copy(tmpBoxVecCorner, origin);
        linear_algebra_1.Vec3.add(tmpBoxVecCorner, tmpBoxVecCorner, v1);
        linear_algebra_1.Vec3.add(tmpBoxVecCorner, tmpBoxVecCorner, v2);
        linear_algebra_1.Vec3.add(tmpBoxVecCorner, tmpBoxVecCorner, v3);
        linear_algebra_1.Vec3.toArray(tmpBoxVecCorner, tmpVertices, offset);
        offset += 3;
    };
    addCornerHelper(dirA, dirB, dirC);
    addCornerHelper(dirA, dirB, negDirC);
    addCornerHelper(dirA, negDirB, negDirC);
    addCornerHelper(dirA, negDirB, dirC);
    addCornerHelper(negDirA, negDirB, negDirC);
    addCornerHelper(negDirA, negDirB, dirC);
    addCornerHelper(negDirA, dirB, dirC);
    addCornerHelper(negDirA, dirB, negDirC);
    const cage = (0, cage_1.createCage)(tmpVertices, tmpEdges);
    const volume = geometry_1.Axes3D.volume(axes);
    const radius = (Math.cbrt(volume) / 300) * radiusScale;
    mesh_builder_1.MeshBuilder.addCage(state, tmpMatrix, cage, radius, detail, radialSegments);
}
