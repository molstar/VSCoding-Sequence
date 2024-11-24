"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRibbon = addRibbon;
const linear_algebra_1 = require("../../../../mol-math/linear-algebra");
const util_1 = require("../../../../mol-data/util");
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
const v3fromArray = linear_algebra_1.Vec3.fromArray;
const v3magnitude = linear_algebra_1.Vec3.magnitude;
const v3sub = linear_algebra_1.Vec3.sub;
const v3add = linear_algebra_1.Vec3.add;
const v3scale = linear_algebra_1.Vec3.scale;
const v3negate = linear_algebra_1.Vec3.negate;
const v3copy = linear_algebra_1.Vec3.copy;
const v3cross = linear_algebra_1.Vec3.cross;
const caAdd3 = util_1.ChunkedArray.add3;
const caAdd = util_1.ChunkedArray.add;
const tA = (0, linear_algebra_1.Vec3)();
const tB = (0, linear_algebra_1.Vec3)();
const tV = (0, linear_algebra_1.Vec3)();
const horizontalVector = (0, linear_algebra_1.Vec3)();
const verticalVector = (0, linear_algebra_1.Vec3)();
const normalOffset = (0, linear_algebra_1.Vec3)();
const positionVector = (0, linear_algebra_1.Vec3)();
const normalVector = (0, linear_algebra_1.Vec3)();
const torsionVector = (0, linear_algebra_1.Vec3)();
/** set arrowHeight = 0 for no arrow */
function addRibbon(state, controlPoints, normalVectors, binormalVectors, linearSegments, widthValues, heightValues, arrowHeight) {
    const { currentGroup, vertices, normals, indices, groups } = state;
    const vertexCount = vertices.elementCount;
    let offsetLength = 0;
    if (arrowHeight > 0) {
        v3fromArray(tA, controlPoints, 0);
        v3fromArray(tB, controlPoints, linearSegments * 3);
        offsetLength = arrowHeight / v3magnitude(v3sub(tV, tB, tA));
    }
    for (let i = 0; i <= linearSegments; ++i) {
        const width = widthValues[i];
        const height = heightValues[i];
        const actualHeight = arrowHeight === 0 ? height : arrowHeight * (1 - i / linearSegments);
        const i3 = i * 3;
        v3fromArray(verticalVector, normalVectors, i3);
        v3scale(verticalVector, verticalVector, actualHeight);
        v3fromArray(horizontalVector, binormalVectors, i3);
        v3scale(horizontalVector, horizontalVector, width);
        if (arrowHeight > 0) {
            v3fromArray(tA, normalVectors, i3);
            v3fromArray(tB, binormalVectors, i3);
            v3scale(normalOffset, v3cross(normalOffset, tA, tB), offsetLength);
        }
        v3fromArray(positionVector, controlPoints, i3);
        v3fromArray(normalVector, normalVectors, i3);
        v3fromArray(torsionVector, binormalVectors, i3);
        v3add(tA, positionVector, verticalVector);
        v3negate(tB, torsionVector);
        caAdd3(vertices, tA[0], tA[1], tA[2]);
        caAdd3(normals, tB[0], tB[1], tB[2]);
        v3sub(tA, positionVector, verticalVector);
        caAdd3(vertices, tA[0], tA[1], tA[2]);
        caAdd3(normals, tB[0], tB[1], tB[2]);
        v3add(tA, positionVector, verticalVector);
        v3copy(tB, torsionVector);
        caAdd3(vertices, tA[0], tA[1], tA[2]);
        caAdd3(normals, tB[0], tB[1], tB[2]);
        v3sub(tA, positionVector, verticalVector);
        caAdd3(vertices, tA[0], tA[1], tA[2]);
        caAdd3(normals, tB[0], tB[1], tB[2]);
    }
    for (let i = 0; i < linearSegments; ++i) {
        caAdd3(indices, vertexCount + i * 4, vertexCount + (i + 1) * 4 + 1, vertexCount + i * 4 + 1);
        caAdd3(indices, vertexCount + i * 4, vertexCount + (i + 1) * 4, vertexCount + (i + 1) * 4 + 1);
        caAdd3(indices, vertexCount + i * 4 + 2 + 1, vertexCount + (i + 1) * 4 + 2 + 1, vertexCount + i * 4 + 2);
        caAdd3(indices, vertexCount + i * 4 + 2, vertexCount + (i + 1) * 4 + 2 + 1, vertexCount + (i + 1) * 4 + 2);
    }
    const addedVertexCount = (linearSegments + 1) * 4;
    for (let i = 0, il = addedVertexCount; i < il; ++i)
        caAdd(groups, currentGroup);
}
