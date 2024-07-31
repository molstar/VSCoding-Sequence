"use strict";
/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.perforatedOctahedronIndices = exports.octahedronIndices = exports.octahedronVertices = void 0;
exports.Octahedron = Octahedron;
exports.PerforatedOctahedron = PerforatedOctahedron;
exports.OctahedronCage = OctahedronCage;
const primitive_1 = require("./primitive");
const cage_1 = require("./cage");
exports.octahedronVertices = [
    0.5, 0, 0, -0.5, 0, 0, 0, 0.5, 0,
    0, -0.5, 0, 0, 0, 0.5, 0, 0, -0.5
];
exports.octahedronIndices = [
    0, 2, 4, 0, 4, 3, 0, 3, 5,
    0, 5, 2, 1, 2, 5, 1, 5, 3,
    1, 3, 4, 1, 4, 2
];
exports.perforatedOctahedronIndices = [
    0, 2, 4, 0, 4, 3,
    // 0, 3, 5,   0, 5, 2,
    1, 2, 5, 1, 5, 3,
    // 1, 3, 4,   1, 4, 2
];
const octahedronEdges = [
    0, 2, 1, 3, 2, 1, 3, 0,
    0, 4, 1, 4, 2, 4, 3, 4,
    0, 5, 1, 5, 2, 5, 3, 5,
];
let octahedron;
function Octahedron() {
    if (!octahedron)
        octahedron = (0, primitive_1.createPrimitive)(exports.octahedronVertices, exports.octahedronIndices);
    return octahedron;
}
let perforatedOctahedron;
function PerforatedOctahedron() {
    if (!perforatedOctahedron)
        perforatedOctahedron = (0, primitive_1.createPrimitive)(exports.octahedronVertices, exports.perforatedOctahedronIndices);
    return perforatedOctahedron;
}
const octahedronCage = (0, cage_1.createCage)(exports.octahedronVertices, octahedronEdges);
function OctahedronCage() {
    return octahedronCage;
}
