"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dodecahedronFaces = exports.dodecahedronVertices = void 0;
exports.Dodecahedron = Dodecahedron;
exports.DodecahedronCage = DodecahedronCage;
const primitive_1 = require("./primitive");
const cage_1 = require("./cage");
const t = (1 + Math.sqrt(5)) / 2;
const a = 1;
const b = 1 / t;
const c = 2 - t;
exports.dodecahedronVertices = [
    c, 0, a, -c, 0, a, -b, b, b, 0, a, c, b, b, b,
    b, -b, b, 0, -a, c, -b, -b, b, c, 0, -a, -c, 0, -a,
    -b, -b, -b, 0, -a, -c, b, -b, -b, b, b, -b, 0, a, -c,
    -b, b, -b, a, c, 0, -a, c, 0, -a, -c, 0, a, -c, 0
];
/** indices of pentagonal faces, groups of five  */
exports.dodecahedronFaces = [
    4, 3, 2, 1, 0,
    7, 6, 5, 0, 1,
    12, 11, 10, 9, 8,
    15, 14, 13, 8, 9,
    14, 3, 4, 16, 13,
    3, 14, 15, 17, 2,
    11, 6, 7, 18, 10,
    6, 11, 12, 19, 5,
    4, 0, 5, 19, 16,
    12, 8, 13, 16, 19,
    15, 9, 10, 18, 17,
    7, 1, 2, 17, 18
];
const dodecahedronIndices = [
    4, 3, 2, 2, 1, 0, 4, 2, 0, // 4, 3, 2, 1, 0
    7, 6, 5, 5, 0, 1, 7, 5, 1, // 7, 6, 5, 0, 1
    12, 11, 10, 10, 9, 8, 12, 10, 8, // 12, 11, 10, 9, 8
    15, 14, 13, 13, 8, 9, 15, 13, 9, // 15, 14, 13, 8, 9
    14, 3, 4, 4, 16, 13, 14, 4, 13, // 14, 3, 4, 16, 13
    3, 14, 15, 15, 17, 2, 3, 15, 2, // 3, 14, 15, 17, 2
    11, 6, 7, 7, 18, 10, 11, 7, 10, // 11, 6, 7, 18, 10
    6, 11, 12, 12, 19, 5, 6, 12, 5, // 6, 11, 12, 19, 5
    4, 0, 5, 5, 19, 16, 4, 5, 16, // 4, 0, 5, 19, 16
    12, 8, 13, 13, 16, 19, 12, 13, 19, // 12, 8, 13, 16, 19
    15, 9, 10, 10, 18, 17, 15, 10, 17, // 15, 9, 10, 18, 17
    7, 1, 2, 2, 17, 18, 7, 2, 18, // 7, 1, 2, 17, 18
];
const dodecahedronEdges = [
    0, 1, 0, 4, 0, 5, 1, 2, 1, 7, 2, 3, 2, 17, 3, 4, 3, 14, 4, 16,
    5, 6, 5, 19, 6, 7, 6, 11, 7, 18, 8, 9, 8, 12, 8, 13, 9, 10, 9, 15,
    10, 11, 10, 18, 11, 12, 12, 19, 13, 14, 13, 16, 14, 15, 15, 17, 16, 19, 17, 18,
];
let dodecahedron;
function Dodecahedron() {
    if (!dodecahedron)
        dodecahedron = (0, primitive_1.createPrimitive)(exports.dodecahedronVertices, dodecahedronIndices);
    return dodecahedron;
}
const dodecahedronCage = (0, cage_1.createCage)(exports.dodecahedronVertices, dodecahedronEdges);
function DodecahedronCage() {
    return dodecahedronCage;
}
