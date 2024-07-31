"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Box = Box;
exports.PerforatedBox = PerforatedBox;
exports.BoxCage = BoxCage;
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const primitive_1 = require("./primitive");
const polygon_1 = require("./polygon");
const cage_1 = require("./cage");
const a = (0, linear_algebra_1.Vec3)(), b = (0, linear_algebra_1.Vec3)(), c = (0, linear_algebra_1.Vec3)(), d = (0, linear_algebra_1.Vec3)();
const points = (0, polygon_1.polygon)(4, true);
/**
 * Create a box
 */
function createBox(perforated) {
    const triangleCount = 12;
    const vertexCount = perforated ? 12 * 3 : 6 * 4;
    const builder = (0, primitive_1.PrimitiveBuilder)(triangleCount, vertexCount);
    // create sides
    for (let i = 0; i < 4; ++i) {
        const ni = (i + 1) % 4;
        linear_algebra_1.Vec3.set(a, points[i * 3], points[i * 3 + 1], -0.5);
        linear_algebra_1.Vec3.set(b, points[ni * 3], points[ni * 3 + 1], -0.5);
        linear_algebra_1.Vec3.set(c, points[ni * 3], points[ni * 3 + 1], 0.5);
        linear_algebra_1.Vec3.set(d, points[i * 3], points[i * 3 + 1], 0.5);
        if (perforated) {
            builder.add(a, b, c);
        }
        else {
            builder.addQuad(a, b, c, d);
        }
    }
    // create bases
    linear_algebra_1.Vec3.set(a, points[0], points[1], -0.5);
    linear_algebra_1.Vec3.set(b, points[3], points[4], -0.5);
    linear_algebra_1.Vec3.set(c, points[6], points[7], -0.5);
    linear_algebra_1.Vec3.set(d, points[9], points[10], -0.5);
    if (perforated) {
        builder.add(c, b, a);
    }
    else {
        builder.addQuad(d, c, b, a);
    }
    linear_algebra_1.Vec3.set(a, points[0], points[1], 0.5);
    linear_algebra_1.Vec3.set(b, points[3], points[4], 0.5);
    linear_algebra_1.Vec3.set(c, points[6], points[7], 0.5);
    linear_algebra_1.Vec3.set(d, points[9], points[10], 0.5);
    if (perforated) {
        builder.add(a, b, c);
    }
    else {
        builder.addQuad(a, b, c, d);
    }
    return builder.getPrimitive();
}
let box;
function Box() {
    if (!box)
        box = createBox(false);
    return box;
}
let perforatedBox;
function PerforatedBox() {
    if (!perforatedBox)
        perforatedBox = createBox(true);
    return perforatedBox;
}
let boxCage;
function BoxCage() {
    if (!boxCage) {
        boxCage = (0, cage_1.createCage)([
            0.5, 0.5, -0.5, // bottom
            -0.5, 0.5, -0.5,
            -0.5, -0.5, -0.5,
            0.5, -0.5, -0.5,
            0.5, 0.5, 0.5, // top
            -0.5, 0.5, 0.5,
            -0.5, -0.5, 0.5,
            0.5, -0.5, 0.5
        ], [
            0, 4, 1, 5, 2, 6, 3, 7, // sides
            0, 1, 1, 2, 2, 3, 3, 0, // bottom base
            4, 5, 5, 6, 6, 7, 7, 4 // top base
        ]);
    }
    return boxCage;
}
