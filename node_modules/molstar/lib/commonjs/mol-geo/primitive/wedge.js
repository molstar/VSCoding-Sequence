"use strict";
/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWedge = createWedge;
exports.Wedge = Wedge;
exports.WedgeCage = WedgeCage;
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const primitive_1 = require("./primitive");
const polygon_1 = require("./polygon");
const prism_1 = require("./prism");
const a = linear_algebra_1.Vec3.zero(), b = linear_algebra_1.Vec3.zero(), c = linear_algebra_1.Vec3.zero(), d = linear_algebra_1.Vec3.zero();
const points = (0, polygon_1.polygon)(3, false);
/**
 * Create a prism with a triangular base
 */
function createWedge() {
    const builder = (0, primitive_1.PrimitiveBuilder)(8);
    // create sides
    for (let i = 0; i < 3; ++i) {
        const ni = (i + 1) % 3;
        linear_algebra_1.Vec3.set(a, points[i * 3], points[i * 3 + 1], -0.5);
        linear_algebra_1.Vec3.set(b, points[ni * 3], points[ni * 3 + 1], -0.5);
        linear_algebra_1.Vec3.set(c, points[ni * 3], points[ni * 3 + 1], 0.5);
        linear_algebra_1.Vec3.set(d, points[i * 3], points[i * 3 + 1], 0.5);
        builder.add(a, b, c);
        builder.add(c, d, a);
    }
    // create bases
    linear_algebra_1.Vec3.set(a, points[0], points[1], -0.5);
    linear_algebra_1.Vec3.set(b, points[3], points[4], -0.5);
    linear_algebra_1.Vec3.set(c, points[6], points[7], -0.5);
    builder.add(c, b, a);
    linear_algebra_1.Vec3.set(a, points[0], points[1], 0.5);
    linear_algebra_1.Vec3.set(b, points[3], points[4], 0.5);
    linear_algebra_1.Vec3.set(c, points[6], points[7], 0.5);
    builder.add(a, b, c);
    return builder.getPrimitive();
}
let wedge;
function Wedge() {
    if (!wedge)
        wedge = createWedge();
    return wedge;
}
let wedgeCage;
function WedgeCage() {
    if (!wedgeCage)
        wedgeCage = (0, prism_1.PrismCage)(points);
    return wedgeCage;
}
