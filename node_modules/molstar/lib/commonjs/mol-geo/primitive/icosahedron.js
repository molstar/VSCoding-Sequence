"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Icosahedron = Icosahedron;
exports.IcosahedronCage = IcosahedronCage;
const primitive_1 = require("./primitive");
const cage_1 = require("./cage");
const t = (1 + Math.sqrt(5)) / 2;
const icosahedronVertices = [
    -1, t, 0, 1, t, 0, -1, -t, 0, 1, -t, 0,
    0, -1, t, 0, 1, t, 0, -1, -t, 0, 1, -t,
    t, 0, -1, t, 0, 1, -t, 0, -1, -t, 0, 1
];
const icosahedronIndices = [
    0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11,
    1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8,
    3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9,
    4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1
];
const icosahedronEdges = [
    0, 11, 5, 11, 0, 5, 1, 5, 0, 1, 1, 7, 0, 7, 7, 10, 0, 10, 10, 11,
    5, 9, 4, 11, 2, 10, 6, 7, 1, 8, 3, 9, 4, 9, 3, 4, 2, 4, 2, 3,
    2, 6, 3, 6, 6, 8, 3, 8, 8, 9, 4, 5, 2, 11, 6, 10, 7, 8, 1, 9
];
let icosahedron;
function Icosahedron() {
    if (!icosahedron)
        icosahedron = (0, primitive_1.createPrimitive)(icosahedronVertices, icosahedronIndices);
    return icosahedron;
}
const icosahedronCage = (0, cage_1.createCage)(icosahedronVertices, icosahedronEdges);
function IcosahedronCage() {
    return icosahedronCage;
}
