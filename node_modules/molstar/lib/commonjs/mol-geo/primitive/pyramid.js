"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pyramid = Pyramid;
exports.TriangularPyramid = TriangularPyramid;
exports.OctagonalPyramid = OctagonalPyramid;
exports.PerforatedOctagonalPyramid = PerforatedOctagonalPyramid;
exports.PyramidCage = PyramidCage;
exports.OctagonalPyramidCage = OctagonalPyramidCage;
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const primitive_1 = require("./primitive");
const polygon_1 = require("./polygon");
const on = linear_algebra_1.Vec3.create(0, 0, -0.5), op = linear_algebra_1.Vec3.create(0, 0, 0.5);
const a = (0, linear_algebra_1.Vec3)(), b = (0, linear_algebra_1.Vec3)(), c = (0, linear_algebra_1.Vec3)(), d = (0, linear_algebra_1.Vec3)();
/**
 * Create a pyramid with a polygonal base
 */
function Pyramid(points) {
    const sideCount = points.length / 3;
    const baseCount = sideCount === 3 ? 1 : sideCount === 4 ? 2 : sideCount;
    const triangleCount = baseCount + sideCount;
    const vertexCount = sideCount === 4 ? (sideCount * 3 + 4) : triangleCount * 3;
    const builder = (0, primitive_1.PrimitiveBuilder)(triangleCount, vertexCount);
    // create sides
    for (let i = 0; i < sideCount; ++i) {
        const ni = (i + 1) % sideCount;
        linear_algebra_1.Vec3.set(a, points[i * 3], points[i * 3 + 1], -0.5);
        linear_algebra_1.Vec3.set(b, points[ni * 3], points[ni * 3 + 1], -0.5);
        builder.add(a, b, op);
    }
    // create base
    if (sideCount === 3) {
        linear_algebra_1.Vec3.set(a, points[0], points[1], -0.5);
        linear_algebra_1.Vec3.set(b, points[3], points[4], -0.5);
        linear_algebra_1.Vec3.set(c, points[6], points[7], -0.5);
        builder.add(c, b, a);
    }
    else if (sideCount === 4) {
        linear_algebra_1.Vec3.set(a, points[0], points[1], -0.5);
        linear_algebra_1.Vec3.set(b, points[3], points[4], -0.5);
        linear_algebra_1.Vec3.set(c, points[6], points[7], -0.5);
        linear_algebra_1.Vec3.set(d, points[9], points[10], -0.5);
        builder.addQuad(d, c, b, a);
    }
    else {
        for (let i = 0; i < sideCount; ++i) {
            const ni = (i + 1) % sideCount;
            linear_algebra_1.Vec3.set(a, points[i * 3], points[i * 3 + 1], -0.5);
            linear_algebra_1.Vec3.set(b, points[ni * 3], points[ni * 3 + 1], -0.5);
            builder.add(on, b, a);
        }
    }
    return builder.getPrimitive();
}
let triangularPyramid;
function TriangularPyramid() {
    if (!triangularPyramid)
        triangularPyramid = Pyramid((0, polygon_1.polygon)(3, true));
    return triangularPyramid;
}
let octagonalPyramid;
function OctagonalPyramid() {
    if (!octagonalPyramid)
        octagonalPyramid = Pyramid((0, polygon_1.polygon)(8, true));
    return octagonalPyramid;
}
let perforatedOctagonalPyramid;
function PerforatedOctagonalPyramid() {
    if (!perforatedOctagonalPyramid) {
        const points = (0, polygon_1.polygon)(8, true);
        const vertices = new Float32Array(8 * 3 + 6);
        for (let i = 0; i < 8; ++i) {
            vertices[i * 3] = points[i * 3];
            vertices[i * 3 + 1] = points[i * 3 + 1];
            vertices[i * 3 + 2] = -0.5;
        }
        vertices[8 * 3] = 0;
        vertices[8 * 3 + 1] = 0;
        vertices[8 * 3 + 2] = -0.5;
        vertices[8 * 3 + 3] = 0;
        vertices[8 * 3 + 4] = 0;
        vertices[8 * 3 + 5] = 0.5;
        const indices = [
            0, 1, 8, 1, 2, 8, 4, 5, 8, 5, 6, 8,
            2, 3, 9, 3, 4, 9, 6, 7, 9, 7, 0, 9
        ];
        perforatedOctagonalPyramid = (0, primitive_1.createPrimitive)(vertices, indices);
    }
    return perforatedOctagonalPyramid;
}
//
/**
 * Create a prism cage
 */
function PyramidCage(points) {
    const sideCount = points.length / 3;
    // const count = 4 * sideCount
    const vertices = [];
    const edges = [];
    let offset = 1;
    vertices.push(op[0], op[1], op[2]);
    // vertices and side edges
    for (let i = 0; i < sideCount; ++i) {
        vertices.push(points[i * 3], points[i * 3 + 1], -0.5);
        edges.push(0, offset);
        offset += 1;
    }
    // bases edges
    for (let i = 0; i < sideCount; ++i) {
        const ni = (i + 1) % sideCount;
        edges.push(i + 1, ni + 1);
    }
    return { vertices, edges };
}
let octagonalPyramidCage;
function OctagonalPyramidCage() {
    if (!octagonalPyramidCage)
        octagonalPyramidCage = PyramidCage((0, polygon_1.polygon)(8, true));
    return octagonalPyramidCage;
}
