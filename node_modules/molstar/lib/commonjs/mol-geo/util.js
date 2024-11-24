"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeVec3Array = normalizeVec3Array;
exports.transformPositionArray = transformPositionArray;
exports.transformDirectionArray = transformDirectionArray;
exports.appplyRadius = appplyRadius;
exports.computeIndexedVertexNormals = computeIndexedVertexNormals;
exports.computeVertexNormals = computeVertexNormals;
exports.createGroupMapping = createGroupMapping;
const linear_algebra_1 = require("../mol-math/linear-algebra");
const array_1 = require("../mol-util/array");
function normalizeVec3Array(a, count) {
    for (let i = 0, il = count * 3; i < il; i += 3) {
        const x = a[i];
        const y = a[i + 1];
        const z = a[i + 2];
        const s = 1 / Math.sqrt(x * x + y * y + z * z);
        a[i] = x * s;
        a[i + 1] = y * s;
        a[i + 2] = z * s;
    }
    return a;
}
const tmpV3 = (0, linear_algebra_1.Vec3)();
function transformPositionArray(t, array, offset, count) {
    for (let i = 0, il = count * 3; i < il; i += 3) {
        linear_algebra_1.Vec3.fromArray(tmpV3, array, offset + i);
        linear_algebra_1.Vec3.transformMat4(tmpV3, tmpV3, t);
        linear_algebra_1.Vec3.toArray(tmpV3, array, offset + i);
    }
}
function transformDirectionArray(n, array, offset, count) {
    for (let i = 0, il = count * 3; i < il; i += 3) {
        linear_algebra_1.Vec3.fromArray(tmpV3, array, offset + i);
        linear_algebra_1.Vec3.transformMat3(tmpV3, tmpV3, n);
        linear_algebra_1.Vec3.toArray(tmpV3, array, offset + i);
    }
}
/** iterate over the entire array and apply the radius to each vertex */
function appplyRadius(vertices, radius) {
    for (let i = 0, il = vertices.length; i < il; i += 3) {
        linear_algebra_1.Vec3.fromArray(tmpV3, vertices, i);
        linear_algebra_1.Vec3.normalize(tmpV3, tmpV3);
        linear_algebra_1.Vec3.scale(tmpV3, tmpV3, radius);
        linear_algebra_1.Vec3.toArray(tmpV3, vertices, i);
    }
}
const a = (0, linear_algebra_1.Vec3)();
const b = (0, linear_algebra_1.Vec3)();
const c = (0, linear_algebra_1.Vec3)();
const cb = (0, linear_algebra_1.Vec3)();
const ab = (0, linear_algebra_1.Vec3)();
/**
 * indexed vertex normals weighted by triangle areas
 *      http://www.iquilezles.org/www/articles/normals/normals.htm
 * - normals array must contain only zeros
 */
function computeIndexedVertexNormals(vertices, indices, normals, vertexCount, triangleCount) {
    for (let i = 0, il = triangleCount * 3; i < il; i += 3) {
        const ai = indices[i] * 3;
        const bi = indices[i + 1] * 3;
        const ci = indices[i + 2] * 3;
        linear_algebra_1.Vec3.fromArray(a, vertices, ai);
        linear_algebra_1.Vec3.fromArray(b, vertices, bi);
        linear_algebra_1.Vec3.fromArray(c, vertices, ci);
        linear_algebra_1.Vec3.sub(cb, c, b);
        linear_algebra_1.Vec3.sub(ab, a, b);
        linear_algebra_1.Vec3.cross(cb, cb, ab);
        normals[ai] += cb[0];
        normals[ai + 1] += cb[1];
        normals[ai + 2] += cb[2];
        normals[bi] += cb[0];
        normals[bi + 1] += cb[1];
        normals[bi + 2] += cb[2];
        normals[ci] += cb[0];
        normals[ci + 1] += cb[1];
        normals[ci + 2] += cb[2];
    }
    return normalizeVec3Array(normals, vertexCount);
}
/**
 * vertex normals for unindexed triangle soup
 * - normals array must contain only zeros
 */
function computeVertexNormals(vertices, normals, vertexCount) {
    for (let i = 0, il = vertexCount * 3; i < il; i += 9) {
        linear_algebra_1.Vec3.fromArray(a, vertices, i);
        linear_algebra_1.Vec3.fromArray(b, vertices, i + 3);
        linear_algebra_1.Vec3.fromArray(c, vertices, i + 6);
        linear_algebra_1.Vec3.sub(cb, c, b);
        linear_algebra_1.Vec3.sub(ab, a, b);
        linear_algebra_1.Vec3.cross(cb, cb, ab);
        normals[i] = cb[0];
        normals[i + 1] = cb[1];
        normals[i + 2] = cb[2];
        normals[i + 3] = cb[0];
        normals[i + 4] = cb[1];
        normals[i + 5] = cb[2];
        normals[i + 6] = cb[0];
        normals[i + 7] = cb[1];
        normals[i + 8] = cb[2];
    }
    return normalizeVec3Array(normals, vertexCount);
}
/**
 * The `step` parameter allows to skip over repeated values in `groups`
 */
function createGroupMapping(groups, dataCount, step = 1) {
    const maxId = (0, array_1.arrayMax)(groups);
    const offsets = new Int32Array(maxId + 2);
    const bucketFill = new Int32Array(dataCount);
    const bucketSizes = new Int32Array(dataCount);
    for (let i = 0, il = dataCount * step; i < il; i += step)
        ++bucketSizes[groups[i]];
    let offset = 0;
    for (let i = 0; i < dataCount; i++) {
        offsets[i] = offset;
        offset += bucketSizes[i];
    }
    offsets[dataCount] = offset;
    const indices = new Int32Array(offset);
    for (let i = 0, il = dataCount * step; i < il; i += step) {
        const g = groups[i];
        const og = offsets[g] + bucketFill[g];
        indices[og] = i;
        ++bucketFill[g];
    }
    return { indices, offsets };
}
