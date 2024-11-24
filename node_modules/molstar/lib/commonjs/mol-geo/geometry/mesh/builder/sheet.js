"use strict";
/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSheet = addSheet;
const linear_algebra_1 = require("../../../../mol-math/linear-algebra");
const util_1 = require("../../../../mol-data/util");
const tA = (0, linear_algebra_1.Vec3)();
const tB = (0, linear_algebra_1.Vec3)();
const tV = (0, linear_algebra_1.Vec3)();
const horizontalVector = (0, linear_algebra_1.Vec3)();
const verticalVector = (0, linear_algebra_1.Vec3)();
const verticalRightVector = (0, linear_algebra_1.Vec3)();
const verticalLeftVector = (0, linear_algebra_1.Vec3)();
const normalOffset = (0, linear_algebra_1.Vec3)();
const positionVector = (0, linear_algebra_1.Vec3)();
const normalVector = (0, linear_algebra_1.Vec3)();
const torsionVector = (0, linear_algebra_1.Vec3)();
const p1 = (0, linear_algebra_1.Vec3)();
const p2 = (0, linear_algebra_1.Vec3)();
const p3 = (0, linear_algebra_1.Vec3)();
const p4 = (0, linear_algebra_1.Vec3)();
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
const v3fromArray = linear_algebra_1.Vec3.fromArray;
const v3scale = linear_algebra_1.Vec3.scale;
const v3add = linear_algebra_1.Vec3.add;
const v3sub = linear_algebra_1.Vec3.sub;
const v3magnitude = linear_algebra_1.Vec3.magnitude;
const v3negate = linear_algebra_1.Vec3.negate;
const v3copy = linear_algebra_1.Vec3.copy;
const v3cross = linear_algebra_1.Vec3.cross;
const v3set = linear_algebra_1.Vec3.set;
const caAdd3 = util_1.ChunkedArray.add3;
const caAdd = util_1.ChunkedArray.add;
function addCap(offset, state, controlPoints, normalVectors, binormalVectors, width, leftHeight, rightHeight, flip) {
    const { vertices, normals, indices } = state;
    const vertexCount = vertices.elementCount;
    v3fromArray(tA, normalVectors, offset);
    v3scale(verticalLeftVector, tA, leftHeight);
    v3scale(verticalRightVector, tA, rightHeight);
    v3fromArray(tB, binormalVectors, offset);
    v3scale(horizontalVector, tB, width);
    v3cross(normalVector, tB, tA);
    v3fromArray(positionVector, controlPoints, offset);
    v3add(p1, v3add(p1, positionVector, horizontalVector), verticalRightVector);
    v3sub(p2, v3add(p2, positionVector, horizontalVector), verticalLeftVector);
    v3sub(p3, v3sub(p3, positionVector, horizontalVector), verticalLeftVector);
    v3add(p4, v3sub(p4, positionVector, horizontalVector), verticalRightVector);
    if (leftHeight < rightHeight) {
        caAdd3(vertices, p4[0], p4[1], p4[2]);
        caAdd3(vertices, p3[0], p3[1], p3[2]);
        caAdd3(vertices, p2[0], p2[1], p2[2]);
        caAdd3(vertices, p1[0], p1[1], p1[2]);
        v3copy(verticalVector, verticalRightVector);
    }
    else {
        caAdd3(vertices, p1[0], p1[1], p1[2]);
        caAdd3(vertices, p2[0], p2[1], p2[2]);
        caAdd3(vertices, p3[0], p3[1], p3[2]);
        caAdd3(vertices, p4[0], p4[1], p4[2]);
        v3copy(verticalVector, verticalLeftVector);
    }
    if (flip) {
        for (let i = 0; i < 4; ++i) {
            caAdd3(normals, -normalVector[0], -normalVector[1], -normalVector[2]);
        }
        caAdd3(indices, vertexCount, vertexCount + 1, vertexCount + 2);
        caAdd3(indices, vertexCount + 2, vertexCount + 3, vertexCount);
    }
    else {
        for (let i = 0; i < 4; ++i) {
            caAdd3(normals, normalVector[0], normalVector[1], normalVector[2]);
        }
        caAdd3(indices, vertexCount + 2, vertexCount + 1, vertexCount);
        caAdd3(indices, vertexCount, vertexCount + 3, vertexCount + 2);
    }
}
/** set arrowHeight = 0 for no arrow */
function addSheet(state, controlPoints, normalVectors, binormalVectors, linearSegments, widthValues, heightValues, arrowHeight, startCap, endCap) {
    const { currentGroup, vertices, normals, indices, groups } = state;
    const vertexCount = vertices.elementCount;
    let offsetLength = 0;
    if (arrowHeight > 0) {
        v3fromArray(tA, controlPoints, 0);
        v3fromArray(tB, controlPoints, linearSegments * 3);
        offsetLength = arrowHeight / v3magnitude(v3sub(tV, tB, tA));
    }
    else {
        v3set(normalOffset, 0, 0, 0);
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
        v3add(tA, v3add(tA, positionVector, horizontalVector), verticalVector);
        v3add(tB, normalVector, normalOffset);
        caAdd3(vertices, tA[0], tA[1], tA[2]);
        caAdd3(normals, tB[0], tB[1], tB[2]);
        v3add(tA, v3sub(tA, positionVector, horizontalVector), verticalVector);
        caAdd3(vertices, tA[0], tA[1], tA[2]);
        caAdd3(normals, tB[0], tB[1], tB[2]);
        // v3add(tA, v3sub(tA, positionVector, horizontalVector), verticalVector) // reuse tA
        v3negate(tB, torsionVector);
        caAdd3(vertices, tA[0], tA[1], tA[2]);
        caAdd3(normals, tB[0], tB[1], tB[2]);
        v3sub(tA, v3sub(tA, positionVector, horizontalVector), verticalVector);
        caAdd3(vertices, tA[0], tA[1], tA[2]);
        caAdd3(normals, tB[0], tB[1], tB[2]);
        // v3sub(tA, v3sub(tA, positionVector, horizontalVector), verticalVector) // reuse tA
        v3add(tB, v3negate(tB, normalVector), normalOffset);
        caAdd3(vertices, tA[0], tA[1], tA[2]);
        caAdd3(normals, tB[0], tB[1], tB[2]);
        v3sub(tA, v3add(tA, positionVector, horizontalVector), verticalVector);
        caAdd3(vertices, tA[0], tA[1], tA[2]);
        caAdd3(normals, tB[0], tB[1], tB[2]);
        // v3sub(tA, v3add(tA, positionVector, horizontalVector), verticalVector) // reuse tA
        v3copy(tB, torsionVector);
        caAdd3(vertices, tA[0], tA[1], tA[2]);
        caAdd3(normals, tB[0], tB[1], tB[2]);
        v3add(tA, v3add(tA, positionVector, horizontalVector), verticalVector);
        caAdd3(vertices, tA[0], tA[1], tA[2]);
        caAdd3(normals, tB[0], tB[1], tB[2]);
    }
    for (let i = 0; i < linearSegments; ++i) {
        // the triangles are arranged such that opposing triangles of the sheet align
        // which prevents triangle intersection within tight curves
        for (let j = 0; j < 2; j++) {
            caAdd3(indices, vertexCount + i * 8 + 2 * j, // a
            vertexCount + (i + 1) * 8 + 2 * j + 1, // c
            vertexCount + i * 8 + 2 * j + 1 // b
            );
            caAdd3(indices, vertexCount + i * 8 + 2 * j, // a
            vertexCount + (i + 1) * 8 + 2 * j, // d
            vertexCount + (i + 1) * 8 + 2 * j + 1 // c
            );
        }
        for (let j = 2; j < 4; j++) {
            caAdd3(indices, vertexCount + i * 8 + 2 * j, // a
            vertexCount + (i + 1) * 8 + 2 * j, // d
            vertexCount + i * 8 + 2 * j + 1);
            caAdd3(indices, vertexCount + (i + 1) * 8 + 2 * j, // d
            vertexCount + (i + 1) * 8 + 2 * j + 1, // c
            vertexCount + i * 8 + 2 * j + 1);
        }
    }
    if (startCap) {
        const width = widthValues[0];
        const height = heightValues[0];
        const h = arrowHeight === 0 ? height : arrowHeight;
        addCap(0, state, controlPoints, normalVectors, binormalVectors, width, h, h, false);
    }
    else if (arrowHeight > 0) {
        const width = widthValues[0];
        const height = heightValues[0];
        addCap(0, state, controlPoints, normalVectors, binormalVectors, width, arrowHeight, -height, false);
        addCap(0, state, controlPoints, normalVectors, binormalVectors, width, -arrowHeight, height, false);
    }
    if (endCap && arrowHeight === 0) {
        const width = widthValues[linearSegments];
        const height = heightValues[linearSegments];
        addCap(linearSegments * 3, state, controlPoints, normalVectors, binormalVectors, width, height, height, true);
    }
    const addedVertexCount = (linearSegments + 1) * 8 +
        (startCap ? 4 : (arrowHeight > 0 ? 8 : 0)) +
        (endCap && arrowHeight === 0 ? 4 : 0);
    for (let i = 0, il = addedVertexCount; i < il; ++i)
        caAdd(groups, currentGroup);
}
