"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sphereVertexCount = sphereVertexCount;
exports.Sphere = Sphere;
const polyhedron_1 = require("./polyhedron");
const icosahedron_1 = require("./icosahedron");
const { vertices, indices } = (0, icosahedron_1.Icosahedron)();
/** Calculate vertex count for subdived icosahedron */
function sphereVertexCount(detail) {
    return 10 * Math.pow(Math.pow(2, detail), 2) + 2;
}
/** Create sphere by subdividing an icosahedron */
function Sphere(detail) {
    return (0, polyhedron_1.Polyhedron)(vertices, indices, { detail, radius: 1 });
}
