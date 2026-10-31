"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultPrismProps = void 0;
exports.Prism = Prism;
exports.DiamondPrism = DiamondPrism;
exports.PentagonalPrism = PentagonalPrism;
exports.HexagonalPrism = HexagonalPrism;
exports.ShiftedHexagonalPrism = ShiftedHexagonalPrism;
exports.HeptagonalPrism = HeptagonalPrism;
exports.PrismCage = PrismCage;
exports.DiamondPrismCage = DiamondPrismCage;
exports.PentagonalPrismCage = PentagonalPrismCage;
exports.HexagonalPrismCage = HexagonalPrismCage;
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const primitive_1 = require("./primitive");
const polygon_1 = require("./polygon");
const on = (0, linear_algebra_1.Vec3)(), op = (0, linear_algebra_1.Vec3)();
const a = (0, linear_algebra_1.Vec3)(), b = (0, linear_algebra_1.Vec3)(), c = (0, linear_algebra_1.Vec3)(), d = (0, linear_algebra_1.Vec3)();
exports.DefaultPrismProps = {
    height: 1,
    topCap: true,
    bottomCap: true,
};
/**
 * Create a prism with a base of 3 or more points
 */
function Prism(points, props) {
    const sideCount = points.length / 3;
    if (sideCount < 3)
        throw new Error('need at least 3 points to build a prism');
    const { height, topCap, bottomCap } = { ...exports.DefaultPrismProps, ...props };
    let triangleCount = sideCount * 2;
    let vertexCount = sideCount * 4;
    const capCount = (topCap ? 1 : 0) + (bottomCap ? 1 : 0);
    if (sideCount === 3) {
        triangleCount += capCount;
        vertexCount += capCount * 3;
    }
    else if (sideCount === 4) {
        triangleCount += capCount * 2;
        vertexCount += capCount * 4;
    }
    else {
        triangleCount += capCount * sideCount;
        vertexCount += capCount * sideCount * 3;
    }
    const builder = (0, primitive_1.PrimitiveBuilder)(triangleCount, vertexCount);
    const halfHeight = height * 0.5;
    linear_algebra_1.Vec3.set(on, 0, 0, -halfHeight);
    linear_algebra_1.Vec3.set(op, 0, 0, halfHeight);
    // create sides
    for (let i = 0; i < sideCount; ++i) {
        const ni = (i + 1) % sideCount;
        linear_algebra_1.Vec3.set(a, points[i * 3], points[i * 3 + 1], -halfHeight);
        linear_algebra_1.Vec3.set(b, points[ni * 3], points[ni * 3 + 1], -halfHeight);
        linear_algebra_1.Vec3.set(c, points[ni * 3], points[ni * 3 + 1], halfHeight);
        linear_algebra_1.Vec3.set(d, points[i * 3], points[i * 3 + 1], halfHeight);
        builder.addQuad(a, b, c, d);
    }
    // create bases
    if (sideCount === 3) {
        if (topCap) {
            linear_algebra_1.Vec3.set(a, points[0], points[1], -halfHeight);
            linear_algebra_1.Vec3.set(b, points[3], points[4], -halfHeight);
            linear_algebra_1.Vec3.set(c, points[6], points[7], -halfHeight);
            builder.add(c, b, a);
        }
        if (bottomCap) {
            linear_algebra_1.Vec3.set(a, points[0], points[1], halfHeight);
            linear_algebra_1.Vec3.set(b, points[3], points[4], halfHeight);
            linear_algebra_1.Vec3.set(c, points[6], points[7], halfHeight);
            builder.add(a, b, c);
        }
    }
    else if (sideCount === 4) {
        if (topCap) {
            linear_algebra_1.Vec3.set(a, points[0], points[1], -halfHeight);
            linear_algebra_1.Vec3.set(b, points[3], points[4], -halfHeight);
            linear_algebra_1.Vec3.set(c, points[6], points[7], -halfHeight);
            linear_algebra_1.Vec3.set(d, points[9], points[10], -halfHeight);
            builder.addQuad(d, c, b, a);
        }
        if (bottomCap) {
            linear_algebra_1.Vec3.set(a, points[0], points[1], halfHeight);
            linear_algebra_1.Vec3.set(b, points[3], points[4], halfHeight);
            linear_algebra_1.Vec3.set(c, points[6], points[7], halfHeight);
            linear_algebra_1.Vec3.set(d, points[9], points[10], halfHeight);
            builder.addQuad(a, b, c, d);
        }
    }
    else {
        for (let i = 0; i < sideCount; ++i) {
            const ni = (i + 1) % sideCount;
            if (topCap) {
                linear_algebra_1.Vec3.set(a, points[i * 3], points[i * 3 + 1], -halfHeight);
                linear_algebra_1.Vec3.set(b, points[ni * 3], points[ni * 3 + 1], -halfHeight);
                builder.add(on, b, a);
            }
            if (bottomCap) {
                linear_algebra_1.Vec3.set(a, points[i * 3], points[i * 3 + 1], halfHeight);
                linear_algebra_1.Vec3.set(b, points[ni * 3], points[ni * 3 + 1], halfHeight);
                builder.add(a, b, op);
            }
        }
    }
    return builder.getPrimitive();
}
let diamond;
function DiamondPrism() {
    if (!diamond)
        diamond = Prism((0, polygon_1.polygon)(4, false));
    return diamond;
}
let pentagonalPrism;
function PentagonalPrism() {
    if (!pentagonalPrism)
        pentagonalPrism = Prism((0, polygon_1.polygon)(5, false));
    return pentagonalPrism;
}
let hexagonalPrism;
function HexagonalPrism() {
    if (!hexagonalPrism)
        hexagonalPrism = Prism((0, polygon_1.polygon)(6, false));
    return hexagonalPrism;
}
let shiftedHexagonalPrism;
function ShiftedHexagonalPrism() {
    if (!shiftedHexagonalPrism)
        shiftedHexagonalPrism = Prism((0, polygon_1.polygon)(6, true));
    return shiftedHexagonalPrism;
}
let heptagonalPrism;
function HeptagonalPrism() {
    if (!heptagonalPrism)
        heptagonalPrism = Prism((0, polygon_1.polygon)(7, false));
    return heptagonalPrism;
}
//
/**
 * Create a prism cage
 */
function PrismCage(points, height = 1) {
    const sideCount = points.length / 3;
    const vertices = [];
    const edges = [];
    const halfHeight = height * 0.5;
    let offset = 0;
    // vertices and side edges
    for (let i = 0; i < sideCount; ++i) {
        vertices.push(points[i * 3], points[i * 3 + 1], -halfHeight, points[i * 3], points[i * 3 + 1], halfHeight);
        edges.push(offset, offset + 1);
        offset += 2;
    }
    // bases edges
    for (let i = 0; i < sideCount; ++i) {
        const ni = (i + 1) % sideCount;
        edges.push(i * 2, ni * 2, i * 2 + 1, ni * 2 + 1);
    }
    return { vertices, edges };
}
let diamondCage;
function DiamondPrismCage() {
    if (!diamondCage)
        diamondCage = PrismCage((0, polygon_1.polygon)(4, false));
    return diamondCage;
}
let pentagonalPrismCage;
function PentagonalPrismCage() {
    if (!pentagonalPrismCage)
        pentagonalPrismCage = PrismCage((0, polygon_1.polygon)(5, false));
    return pentagonalPrismCage;
}
let hexagonalPrismCage;
function HexagonalPrismCage() {
    if (!hexagonalPrismCage)
        hexagonalPrismCage = PrismCage((0, polygon_1.polygon)(6, false));
    return hexagonalPrismCage;
}
