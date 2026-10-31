"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPrimitive = createPrimitive;
exports.copyPrimitive = copyPrimitive;
exports.PrimitiveBuilder = PrimitiveBuilder;
exports.transformPrimitive = transformPrimitive;
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const a = (0, linear_algebra_1.Vec3)(), b = (0, linear_algebra_1.Vec3)(), c = (0, linear_algebra_1.Vec3)();
/** Create primitive with face normals from vertices and indices */
function createPrimitive(vertices, indices) {
    const count = indices.length;
    const builder = PrimitiveBuilder(count / 3);
    for (let i = 0; i < count; i += 3) {
        linear_algebra_1.Vec3.fromArray(a, vertices, indices[i] * 3);
        linear_algebra_1.Vec3.fromArray(b, vertices, indices[i + 1] * 3);
        linear_algebra_1.Vec3.fromArray(c, vertices, indices[i + 2] * 3);
        builder.add(a, b, c);
    }
    return builder.getPrimitive();
}
function copyPrimitive(primitive) {
    return {
        vertices: new Float32Array(primitive.vertices),
        normals: new Float32Array(primitive.normals),
        indices: new Uint32Array(primitive.indices)
    };
}
const vn = (0, linear_algebra_1.Vec3)();
/** Builder to create primitive with face normals */
function PrimitiveBuilder(triangleCount, vertexCount) {
    if (vertexCount === undefined)
        vertexCount = triangleCount * 3;
    const vertices = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);
    const indices = new Uint32Array(triangleCount * 3);
    let vOffset = 0;
    let iOffset = 0;
    return {
        add: (a, b, c) => {
            linear_algebra_1.Vec3.toArray(a, vertices, vOffset);
            linear_algebra_1.Vec3.toArray(b, vertices, vOffset + 3);
            linear_algebra_1.Vec3.toArray(c, vertices, vOffset + 6);
            linear_algebra_1.Vec3.triangleNormal(vn, a, b, c);
            for (let j = 0; j < 3; ++j) {
                linear_algebra_1.Vec3.toArray(vn, normals, vOffset + 3 * j);
                indices[iOffset + j] = vOffset / 3 + j;
            }
            vOffset += 9;
            iOffset += 3;
        },
        addQuad: (a, b, c, d) => {
            linear_algebra_1.Vec3.toArray(a, vertices, vOffset);
            linear_algebra_1.Vec3.toArray(b, vertices, vOffset + 3);
            linear_algebra_1.Vec3.toArray(c, vertices, vOffset + 6);
            linear_algebra_1.Vec3.toArray(d, vertices, vOffset + 9);
            linear_algebra_1.Vec3.triangleNormal(vn, a, b, c);
            for (let j = 0; j < 4; ++j) {
                linear_algebra_1.Vec3.toArray(vn, normals, vOffset + 3 * j);
            }
            const vOffset3 = vOffset / 3;
            // a, b, c
            indices[iOffset] = vOffset3;
            indices[iOffset + 1] = vOffset3 + 1;
            indices[iOffset + 2] = vOffset3 + 2;
            // a, b, c
            indices[iOffset + 3] = vOffset3 + 2;
            indices[iOffset + 4] = vOffset3 + 3;
            indices[iOffset + 5] = vOffset3;
            vOffset += 12;
            iOffset += 6;
        },
        getPrimitive: () => ({ vertices, normals, indices })
    };
}
const tmpV = (0, linear_algebra_1.Vec3)();
const tmpMat3 = (0, linear_algebra_1.Mat3)();
/** Transform primitive in-place */
function transformPrimitive(primitive, t) {
    const { vertices, normals } = primitive;
    const n = linear_algebra_1.Mat3.directionTransform(tmpMat3, t);
    for (let i = 0, il = vertices.length; i < il; i += 3) {
        // position
        linear_algebra_1.Vec3.transformMat4(tmpV, linear_algebra_1.Vec3.fromArray(tmpV, vertices, i), t);
        linear_algebra_1.Vec3.toArray(tmpV, vertices, i);
        // normal
        linear_algebra_1.Vec3.transformMat3(tmpV, linear_algebra_1.Vec3.fromArray(tmpV, normals, i), n);
        linear_algebra_1.Vec3.toArray(tmpV, normals, i);
    }
    return primitive;
}
