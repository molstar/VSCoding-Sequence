"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpikedBall = SpikedBall;
const primitive_1 = require("./primitive");
const dodecahedron_1 = require("./dodecahedron");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
function calcCenter(out, ...vec3s) {
    linear_algebra_1.Vec3.set(out, 0, 0, 0);
    for (let i = 0, il = vec3s.length; i < il; ++i) {
        linear_algebra_1.Vec3.add(out, out, vec3s[i]);
    }
    linear_algebra_1.Vec3.scale(out, out, 1 / vec3s.length);
    return out;
}
const center = linear_algebra_1.Vec3.zero();
const dir = linear_algebra_1.Vec3.zero();
const tip = linear_algebra_1.Vec3.zero();
const vecA = linear_algebra_1.Vec3.zero();
const vecB = linear_algebra_1.Vec3.zero();
const vecC = linear_algebra_1.Vec3.zero();
const vecD = linear_algebra_1.Vec3.zero();
const vecE = linear_algebra_1.Vec3.zero();
/**
 * Create a spiked ball derived from a dodecahedron
 * @param radiusRatio ratio between inner radius (dodecahedron) and outher radius (spikes)
 */
function SpikedBall(radiusRatio = 1) {
    const vertices = dodecahedron_1.dodecahedronVertices.slice(0);
    const indices = [];
    let offset = vertices.length / 3;
    for (let i = 0, il = dodecahedron_1.dodecahedronFaces.length; i < il; i += 5) {
        linear_algebra_1.Vec3.fromArray(vecA, dodecahedron_1.dodecahedronVertices, dodecahedron_1.dodecahedronFaces[i] * 3);
        linear_algebra_1.Vec3.fromArray(vecB, dodecahedron_1.dodecahedronVertices, dodecahedron_1.dodecahedronFaces[i + 1] * 3);
        linear_algebra_1.Vec3.fromArray(vecC, dodecahedron_1.dodecahedronVertices, dodecahedron_1.dodecahedronFaces[i + 2] * 3);
        linear_algebra_1.Vec3.fromArray(vecD, dodecahedron_1.dodecahedronVertices, dodecahedron_1.dodecahedronFaces[i + 3] * 3);
        linear_algebra_1.Vec3.fromArray(vecE, dodecahedron_1.dodecahedronVertices, dodecahedron_1.dodecahedronFaces[i + 4] * 3);
        calcCenter(center, vecA, vecB, vecC, vecD, vecE);
        linear_algebra_1.Vec3.triangleNormal(dir, vecA, vecB, vecC);
        linear_algebra_1.Vec3.scaleAndAdd(tip, center, dir, radiusRatio);
        linear_algebra_1.Vec3.toArray(tip, vertices, offset * 3);
        indices.push(offset, dodecahedron_1.dodecahedronFaces[i], dodecahedron_1.dodecahedronFaces[i + 1]);
        indices.push(offset, dodecahedron_1.dodecahedronFaces[i + 1], dodecahedron_1.dodecahedronFaces[i + 2]);
        indices.push(offset, dodecahedron_1.dodecahedronFaces[i + 2], dodecahedron_1.dodecahedronFaces[i + 3]);
        indices.push(offset, dodecahedron_1.dodecahedronFaces[i + 3], dodecahedron_1.dodecahedronFaces[i + 4]);
        indices.push(offset, dodecahedron_1.dodecahedronFaces[i + 4], dodecahedron_1.dodecahedronFaces[i]);
        offset += 1;
    }
    return (0, primitive_1.createPrimitive)(vertices, indices);
}
