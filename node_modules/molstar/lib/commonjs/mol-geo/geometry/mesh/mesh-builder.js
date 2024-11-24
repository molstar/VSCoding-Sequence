"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeshBuilder = void 0;
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const util_1 = require("../../../mol-data/util");
const mesh_1 = require("./mesh");
const sphere_1 = require("./builder/sphere");
const cylinder_1 = require("./builder/cylinder");
const tmpV = (0, linear_algebra_1.Vec3)();
const tmpMat3 = (0, linear_algebra_1.Mat3)();
const tmpVecA = (0, linear_algebra_1.Vec3)();
const tmpVecB = (0, linear_algebra_1.Vec3)();
const tmpVecC = (0, linear_algebra_1.Vec3)();
const tmpVecD = (0, linear_algebra_1.Vec3)();
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
const v3fromArray = linear_algebra_1.Vec3.fromArray;
const v3triangleNormal = linear_algebra_1.Vec3.triangleNormal;
const v3copy = linear_algebra_1.Vec3.copy;
const v3transformMat4 = linear_algebra_1.Vec3.transformMat4;
const v3transformMat3 = linear_algebra_1.Vec3.transformMat3;
const mat3directionTransform = linear_algebra_1.Mat3.directionTransform;
const caAdd3 = util_1.ChunkedArray.add3;
const caAdd = util_1.ChunkedArray.add;
var MeshBuilder;
(function (MeshBuilder) {
    function createState(initialCount = 2048, chunkSize = 1024, mesh) {
        return {
            currentGroup: -1,
            vertices: util_1.ChunkedArray.create(Float32Array, 3, chunkSize, mesh ? mesh.vertexBuffer.ref.value : initialCount),
            normals: util_1.ChunkedArray.create(Float32Array, 3, chunkSize, mesh ? mesh.normalBuffer.ref.value : initialCount),
            indices: util_1.ChunkedArray.create(Uint32Array, 3, chunkSize * 3, mesh ? mesh.indexBuffer.ref.value : initialCount * 3),
            groups: util_1.ChunkedArray.create(Float32Array, 1, chunkSize, mesh ? mesh.groupBuffer.ref.value : initialCount),
            mesh
        };
    }
    MeshBuilder.createState = createState;
    function addTriangle(state, a, b, c) {
        const { vertices, normals, indices, groups, currentGroup } = state;
        const offset = vertices.elementCount;
        // positions
        caAdd3(vertices, a[0], a[1], a[2]);
        caAdd3(vertices, b[0], b[1], b[2]);
        caAdd3(vertices, c[0], c[1], c[2]);
        v3triangleNormal(tmpV, a, b, c);
        for (let i = 0; i < 3; ++i) {
            caAdd3(normals, tmpV[0], tmpV[1], tmpV[2]); // normal
            caAdd(groups, currentGroup); // group
        }
        caAdd3(indices, offset, offset + 1, offset + 2);
    }
    MeshBuilder.addTriangle = addTriangle;
    function addTriangleWithNormal(state, a, b, c, n) {
        const { vertices, normals, indices, groups, currentGroup } = state;
        const offset = vertices.elementCount;
        // positions
        caAdd3(vertices, a[0], a[1], a[2]);
        caAdd3(vertices, b[0], b[1], b[2]);
        caAdd3(vertices, c[0], c[1], c[2]);
        for (let i = 0; i < 3; ++i) {
            caAdd3(normals, n[0], n[1], n[2]); // normal
            caAdd(groups, currentGroup); // group
        }
        caAdd3(indices, offset, offset + 1, offset + 2);
    }
    MeshBuilder.addTriangleWithNormal = addTriangleWithNormal;
    function addTriangleStrip(state, vertices, indices) {
        v3fromArray(tmpVecC, vertices, indices[0] * 3);
        v3fromArray(tmpVecD, vertices, indices[1] * 3);
        for (let i = 2, il = indices.length; i < il; i += 2) {
            v3copy(tmpVecA, tmpVecC);
            v3copy(tmpVecB, tmpVecD);
            v3fromArray(tmpVecC, vertices, indices[i] * 3);
            v3fromArray(tmpVecD, vertices, indices[i + 1] * 3);
            addTriangle(state, tmpVecA, tmpVecB, tmpVecC);
            addTriangle(state, tmpVecB, tmpVecD, tmpVecC);
        }
    }
    MeshBuilder.addTriangleStrip = addTriangleStrip;
    function addTriangleFan(state, vertices, indices) {
        v3fromArray(tmpVecA, vertices, indices[0] * 3);
        for (let i = 2, il = indices.length; i < il; ++i) {
            v3fromArray(tmpVecB, vertices, indices[i - 1] * 3);
            v3fromArray(tmpVecC, vertices, indices[i] * 3);
            addTriangle(state, tmpVecA, tmpVecC, tmpVecB);
        }
    }
    MeshBuilder.addTriangleFan = addTriangleFan;
    function addTriangleFanWithNormal(state, vertices, indices, normal) {
        v3fromArray(tmpVecA, vertices, indices[0] * 3);
        for (let i = 2, il = indices.length; i < il; ++i) {
            v3fromArray(tmpVecB, vertices, indices[i - 1] * 3);
            v3fromArray(tmpVecC, vertices, indices[i] * 3);
            addTriangleWithNormal(state, tmpVecA, tmpVecC, tmpVecB, normal);
        }
    }
    MeshBuilder.addTriangleFanWithNormal = addTriangleFanWithNormal;
    function addPrimitive(state, t, primitive) {
        const { vertices: va, normals: na, indices: ia } = primitive;
        const { vertices, normals, indices, groups, currentGroup } = state;
        const offset = vertices.elementCount;
        const n = mat3directionTransform(tmpMat3, t);
        for (let i = 0, il = va.length; i < il; i += 3) {
            // position
            v3transformMat4(tmpV, v3fromArray(tmpV, va, i), t);
            caAdd3(vertices, tmpV[0], tmpV[1], tmpV[2]);
            // normal
            v3transformMat3(tmpV, v3fromArray(tmpV, na, i), n);
            caAdd3(normals, tmpV[0], tmpV[1], tmpV[2]);
            // group
            caAdd(groups, currentGroup);
        }
        for (let i = 0, il = ia.length; i < il; i += 3) {
            caAdd3(indices, ia[i] + offset, ia[i + 1] + offset, ia[i + 2] + offset);
        }
    }
    MeshBuilder.addPrimitive = addPrimitive;
    /** Flips triangle normals and winding order */
    function addPrimitiveFlipped(state, t, primitive) {
        const { vertices: va, normals: na, indices: ia } = primitive;
        const { vertices, normals, indices, groups, currentGroup } = state;
        const offset = vertices.elementCount;
        const n = mat3directionTransform(tmpMat3, t);
        for (let i = 0, il = va.length; i < il; i += 3) {
            // position
            v3transformMat4(tmpV, v3fromArray(tmpV, va, i), t);
            caAdd3(vertices, tmpV[0], tmpV[1], tmpV[2]);
            // normal
            v3transformMat3(tmpV, v3fromArray(tmpV, na, i), n);
            caAdd3(normals, -tmpV[0], -tmpV[1], -tmpV[2]);
            // group
            caAdd(groups, currentGroup);
        }
        for (let i = 0, il = ia.length; i < il; i += 3) {
            caAdd3(indices, ia[i + 2] + offset, ia[i + 1] + offset, ia[i] + offset);
        }
    }
    MeshBuilder.addPrimitiveFlipped = addPrimitiveFlipped;
    function addCage(state, t, cage, radius, detail, radialSegments) {
        const { vertices: va, edges: ea } = cage;
        const cylinderProps = { radiusTop: radius, radiusBottom: radius, radialSegments };
        for (let i = 0, il = ea.length; i < il; i += 2) {
            v3fromArray(tmpVecA, va, ea[i] * 3);
            v3fromArray(tmpVecB, va, ea[i + 1] * 3);
            v3transformMat4(tmpVecA, tmpVecA, t);
            v3transformMat4(tmpVecB, tmpVecB, t);
            (0, sphere_1.addSphere)(state, tmpVecA, radius, detail);
            (0, sphere_1.addSphere)(state, tmpVecB, radius, detail);
            (0, cylinder_1.addCylinder)(state, tmpVecA, tmpVecB, 1, cylinderProps);
        }
    }
    MeshBuilder.addCage = addCage;
    function addMesh(state, t, mesh) {
        addPrimitive(state, t, {
            vertices: mesh.vertexBuffer.ref.value.subarray(0, mesh.vertexCount * 3),
            normals: mesh.normalBuffer.ref.value.subarray(0, mesh.vertexCount * 3),
            indices: mesh.indexBuffer.ref.value.subarray(0, mesh.triangleCount * 3),
        });
    }
    MeshBuilder.addMesh = addMesh;
    function getMesh(state) {
        const { vertices, normals, indices, groups, mesh } = state;
        const vb = util_1.ChunkedArray.compact(vertices, true);
        const ib = util_1.ChunkedArray.compact(indices, true);
        const nb = util_1.ChunkedArray.compact(normals, true);
        const gb = util_1.ChunkedArray.compact(groups, true);
        return mesh_1.Mesh.create(vb, ib, nb, gb, state.vertices.elementCount, state.indices.elementCount, mesh);
    }
    MeshBuilder.getMesh = getMesh;
})(MeshBuilder || (exports.MeshBuilder = MeshBuilder = {}));
