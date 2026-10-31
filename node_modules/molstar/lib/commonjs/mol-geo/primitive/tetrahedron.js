"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.tetrahedronIndices = exports.tetrahedronVertices = void 0;
exports.Tetrahedron = Tetrahedron;
exports.TetrahedronCage = TetrahedronCage;
const primitive_1 = require("./primitive");
const cage_1 = require("./cage");
exports.tetrahedronVertices = [
    0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5
];
exports.tetrahedronIndices = [
    2, 1, 0, 0, 3, 2, 1, 3, 0, 2, 3, 1
];
const tetrahedronEdges = [
    0, 1, 1, 2, 2, 0,
    0, 3, 1, 3, 2, 3,
];
let tetrahedron;
function Tetrahedron() {
    if (!tetrahedron)
        tetrahedron = (0, primitive_1.createPrimitive)(exports.tetrahedronVertices, exports.tetrahedronIndices);
    return tetrahedron;
}
const tetrahedronCage = (0, cage_1.createCage)(exports.tetrahedronVertices, tetrahedronEdges);
function TetrahedronCage() {
    return tetrahedronCage;
}
