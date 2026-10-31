"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCage = createCage;
exports.cloneCage = cloneCage;
exports.transformCage = transformCage;
const linear_algebra_1 = require("../../mol-math/linear-algebra");
function createCage(vertices, edges) {
    return { vertices, edges };
}
function cloneCage(cage) {
    return {
        vertices: new Float32Array(cage.vertices),
        edges: new Uint32Array(cage.edges)
    };
}
const tmpV = linear_algebra_1.Vec3.zero();
/** Transform primitive in-place */
function transformCage(cage, t) {
    const { vertices } = cage;
    for (let i = 0, il = vertices.length; i < il; i += 3) {
        // position
        linear_algebra_1.Vec3.transformMat4(tmpV, linear_algebra_1.Vec3.fromArray(tmpV, vertices, i), t);
        linear_algebra_1.Vec3.toArray(tmpV, vertices, i);
    }
    return cage;
}
