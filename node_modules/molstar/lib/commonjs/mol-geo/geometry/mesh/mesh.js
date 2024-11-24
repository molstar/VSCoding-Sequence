"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mesh = void 0;
const mol_util_1 = require("../../../mol-util");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const geometry_1 = require("../../../mol-math/geometry");
const util_1 = require("../../util");
const marker_data_1 = require("../marker-data");
const location_iterator_1 = require("../../util/location-iterator");
const color_data_1 = require("../color-data");
const util_2 = require("../../../mol-data/util");
const param_definition_1 = require("../../../mol-util/param-definition");
const util_3 = require("../../../mol-gl/renderable/util");
const base_1 = require("../base");
const overpaint_data_1 = require("../overpaint-data");
const transparency_data_1 = require("../transparency-data");
const clipping_data_1 = require("../clipping-data");
const array_1 = require("../../../mol-util/array");
const misc_1 = require("../../../mol-math/misc");
const substance_data_1 = require("../substance-data");
const emissive_data_1 = require("../emissive-data");
var Mesh;
(function (Mesh) {
    function create(vertices, indices, normals, groups, vertexCount, triangleCount, mesh) {
        return mesh ?
            update(vertices, indices, normals, groups, vertexCount, triangleCount, mesh) :
            fromArrays(vertices, indices, normals, groups, vertexCount, triangleCount);
    }
    Mesh.create = create;
    function createEmpty(mesh) {
        const vb = mesh ? mesh.vertexBuffer.ref.value : new Float32Array(0);
        const ib = mesh ? mesh.indexBuffer.ref.value : new Uint32Array(0);
        const nb = mesh ? mesh.normalBuffer.ref.value : new Float32Array(0);
        const gb = mesh ? mesh.groupBuffer.ref.value : new Float32Array(0);
        return create(vb, ib, nb, gb, 0, 0, mesh);
    }
    Mesh.createEmpty = createEmpty;
    function hashCode(mesh) {
        return (0, util_2.hashFnv32a)([
            mesh.vertexCount, mesh.triangleCount,
            mesh.vertexBuffer.ref.version, mesh.indexBuffer.ref.version,
            mesh.normalBuffer.ref.version, mesh.groupBuffer.ref.version
        ]);
    }
    function fromArrays(vertices, indices, normals, groups, vertexCount, triangleCount) {
        const boundingSphere = (0, geometry_1.Sphere3D)();
        let groupMapping;
        let currentHash = -1;
        let currentGroup = -1;
        const mesh = {
            kind: 'mesh',
            vertexCount,
            triangleCount,
            vertexBuffer: mol_util_1.ValueCell.create(vertices),
            indexBuffer: mol_util_1.ValueCell.create(indices),
            normalBuffer: mol_util_1.ValueCell.create(normals),
            groupBuffer: mol_util_1.ValueCell.create(groups),
            varyingGroup: mol_util_1.ValueCell.create(false),
            get boundingSphere() {
                const newHash = hashCode(mesh);
                if (newHash !== currentHash) {
                    const b = (0, util_3.calculateInvariantBoundingSphere)(mesh.vertexBuffer.ref.value, mesh.vertexCount, 1);
                    geometry_1.Sphere3D.copy(boundingSphere, b);
                    currentHash = newHash;
                }
                return boundingSphere;
            },
            get groupMapping() {
                if (mesh.groupBuffer.ref.version !== currentGroup) {
                    groupMapping = (0, util_1.createGroupMapping)(mesh.groupBuffer.ref.value, mesh.vertexCount);
                    currentGroup = mesh.groupBuffer.ref.version;
                }
                return groupMapping;
            },
            setBoundingSphere(sphere) {
                geometry_1.Sphere3D.copy(boundingSphere, sphere);
                currentHash = hashCode(mesh);
            },
            meta: {}
        };
        return mesh;
    }
    function update(vertices, indices, normals, groups, vertexCount, triangleCount, mesh) {
        mesh.vertexCount = vertexCount;
        mesh.triangleCount = triangleCount;
        mol_util_1.ValueCell.update(mesh.vertexBuffer, vertices);
        mol_util_1.ValueCell.update(mesh.indexBuffer, indices);
        mol_util_1.ValueCell.update(mesh.normalBuffer, normals);
        mol_util_1.ValueCell.update(mesh.groupBuffer, groups);
        return mesh;
    }
    function computeNormals(mesh) {
        const { vertexCount, triangleCount } = mesh;
        const vertices = mesh.vertexBuffer.ref.value;
        const indices = mesh.indexBuffer.ref.value;
        const normals = mesh.normalBuffer.ref.value.length >= vertexCount * 3
            ? mesh.normalBuffer.ref.value
            : new Float32Array(vertexCount * 3);
        if (normals === mesh.normalBuffer.ref.value) {
            normals.fill(0, 0, vertexCount * 3);
        }
        (0, util_1.computeIndexedVertexNormals)(vertices, indices, normals, vertexCount, triangleCount);
        mol_util_1.ValueCell.update(mesh.normalBuffer, normals);
    }
    Mesh.computeNormals = computeNormals;
    function checkForDuplicateVertices(mesh, fractionDigits = 3) {
        const v = mesh.vertexBuffer.ref.value;
        const map = new Map();
        const hash = (v, d) => `${v[0].toFixed(d)}|${v[1].toFixed(d)}|${v[2].toFixed(d)}`;
        let duplicates = 0;
        const a = (0, linear_algebra_1.Vec3)();
        for (let i = 0, il = mesh.vertexCount; i < il; ++i) {
            linear_algebra_1.Vec3.fromArray(a, v, i * 3);
            const k = hash(a, fractionDigits);
            const count = map.get(k);
            if (count !== undefined) {
                duplicates += 1;
                map.set(k, count + 1);
            }
            else {
                map.set(k, 1);
            }
        }
        return duplicates;
    }
    Mesh.checkForDuplicateVertices = checkForDuplicateVertices;
    const tmpMat3 = (0, linear_algebra_1.Mat3)();
    function transform(mesh, t) {
        const v = mesh.vertexBuffer.ref.value;
        (0, util_1.transformPositionArray)(t, v, 0, mesh.vertexCount);
        if (!linear_algebra_1.Mat4.isTranslationAndUniformScaling(t)) {
            const n = linear_algebra_1.Mat3.directionTransform(tmpMat3, t);
            (0, util_1.transformDirectionArray)(n, mesh.normalBuffer.ref.value, 0, mesh.vertexCount);
        }
        mol_util_1.ValueCell.update(mesh.vertexBuffer, v);
    }
    Mesh.transform = transform;
    /** Meshes may contain some original data in case any processing was done. */
    function getOriginalData(x) {
        const { originalData } = 'kind' in x ? x.meta : x.meta.ref.value;
        return originalData;
    }
    Mesh.getOriginalData = getOriginalData;
    /**
     * Ensure that each vertices of each triangle have the same group id.
     * Note that normals are copied over and can't be re-created from the new mesh.
     */
    function uniformTriangleGroup(mesh, splitTriangles = true) {
        const { indexBuffer, vertexBuffer, groupBuffer, normalBuffer, triangleCount, vertexCount } = mesh;
        const ib = indexBuffer.ref.value;
        const vb = vertexBuffer.ref.value;
        const gb = groupBuffer.ref.value;
        const nb = normalBuffer.ref.value;
        // new
        const index = util_2.ChunkedArray.create(Uint32Array, 3, 1024, triangleCount);
        // re-use
        const vertex = util_2.ChunkedArray.create(Float32Array, 3, 1024, vb);
        vertex.currentIndex = vertexCount * 3;
        vertex.elementCount = vertexCount;
        const normal = util_2.ChunkedArray.create(Float32Array, 3, 1024, nb);
        normal.currentIndex = vertexCount * 3;
        normal.elementCount = vertexCount;
        const group = util_2.ChunkedArray.create(Float32Array, 1, 1024, gb);
        group.currentIndex = vertexCount;
        group.elementCount = vertexCount;
        const vi = (0, linear_algebra_1.Vec3)();
        const vj = (0, linear_algebra_1.Vec3)();
        const vk = (0, linear_algebra_1.Vec3)();
        const ni = (0, linear_algebra_1.Vec3)();
        const nj = (0, linear_algebra_1.Vec3)();
        const nk = (0, linear_algebra_1.Vec3)();
        function add(i) {
            linear_algebra_1.Vec3.fromArray(vi, vb, i * 3);
            linear_algebra_1.Vec3.fromArray(ni, nb, i * 3);
            util_2.ChunkedArray.add3(vertex, vi[0], vi[1], vi[2]);
            util_2.ChunkedArray.add3(normal, ni[0], ni[1], ni[2]);
        }
        function addMid(i, j) {
            linear_algebra_1.Vec3.fromArray(vi, vb, i * 3);
            linear_algebra_1.Vec3.fromArray(vj, vb, j * 3);
            linear_algebra_1.Vec3.scale(vi, linear_algebra_1.Vec3.add(vi, vi, vj), 0.5);
            linear_algebra_1.Vec3.fromArray(ni, nb, i * 3);
            linear_algebra_1.Vec3.fromArray(nj, nb, j * 3);
            linear_algebra_1.Vec3.scale(ni, linear_algebra_1.Vec3.add(ni, ni, nj), 0.5);
            util_2.ChunkedArray.add3(vertex, vi[0], vi[1], vi[2]);
            util_2.ChunkedArray.add3(normal, ni[0], ni[1], ni[2]);
        }
        function addCenter(i, j, k) {
            linear_algebra_1.Vec3.fromArray(vi, vb, i * 3);
            linear_algebra_1.Vec3.fromArray(vj, vb, j * 3);
            linear_algebra_1.Vec3.fromArray(vk, vb, k * 3);
            linear_algebra_1.Vec3.scale(vi, linear_algebra_1.Vec3.add(vi, linear_algebra_1.Vec3.add(vi, vi, vj), vk), 1 / 3);
            linear_algebra_1.Vec3.fromArray(ni, nb, i * 3);
            linear_algebra_1.Vec3.fromArray(nj, nb, j * 3);
            linear_algebra_1.Vec3.fromArray(nk, nb, k * 3);
            linear_algebra_1.Vec3.scale(ni, linear_algebra_1.Vec3.add(ni, linear_algebra_1.Vec3.add(ni, ni, nj), nk), 1 / 3);
            util_2.ChunkedArray.add3(vertex, vi[0], vi[1], vi[2]);
            util_2.ChunkedArray.add3(normal, ni[0], ni[1], ni[2]);
        }
        function split2(i0, i1, i2, g0, g1) {
            ++newTriangleCount;
            add(i0);
            addMid(i0, i1);
            addMid(i0, i2);
            util_2.ChunkedArray.add3(index, newVertexCount, newVertexCount + 1, newVertexCount + 2);
            for (let j = 0; j < 3; ++j)
                util_2.ChunkedArray.add(group, g0);
            newVertexCount += 3;
            newTriangleCount += 2;
            add(i1);
            add(i2);
            addMid(i0, i1);
            addMid(i0, i2);
            util_2.ChunkedArray.add3(index, newVertexCount, newVertexCount + 1, newVertexCount + 3);
            util_2.ChunkedArray.add3(index, newVertexCount, newVertexCount + 3, newVertexCount + 2);
            for (let j = 0; j < 4; ++j)
                util_2.ChunkedArray.add(group, g1);
            newVertexCount += 4;
        }
        let newVertexCount = vertexCount;
        let newTriangleCount = 0;
        if (splitTriangles) {
            for (let i = 0, il = triangleCount; i < il; ++i) {
                const i0 = ib[i * 3], i1 = ib[i * 3 + 1], i2 = ib[i * 3 + 2];
                const g0 = gb[i0], g1 = gb[i1], g2 = gb[i2];
                if (g0 === g1 && g0 === g2) {
                    ++newTriangleCount;
                    util_2.ChunkedArray.add3(index, i0, i1, i2);
                }
                else if (g0 === g1) {
                    split2(i2, i0, i1, g2, g0);
                }
                else if (g0 === g2) {
                    split2(i1, i2, i0, g1, g2);
                }
                else if (g1 === g2) {
                    split2(i0, i1, i2, g0, g1);
                }
                else {
                    newTriangleCount += 2;
                    add(i0);
                    addMid(i0, i1);
                    addMid(i0, i2);
                    addCenter(i0, i1, i2);
                    util_2.ChunkedArray.add3(index, newVertexCount, newVertexCount + 1, newVertexCount + 3);
                    util_2.ChunkedArray.add3(index, newVertexCount, newVertexCount + 3, newVertexCount + 2);
                    for (let j = 0; j < 4; ++j)
                        util_2.ChunkedArray.add(group, g0);
                    newVertexCount += 4;
                    newTriangleCount += 2;
                    add(i1);
                    addMid(i1, i2);
                    addMid(i1, i0);
                    addCenter(i0, i1, i2);
                    util_2.ChunkedArray.add3(index, newVertexCount, newVertexCount + 1, newVertexCount + 3);
                    util_2.ChunkedArray.add3(index, newVertexCount, newVertexCount + 3, newVertexCount + 2);
                    for (let j = 0; j < 4; ++j)
                        util_2.ChunkedArray.add(group, g1);
                    newVertexCount += 4;
                    newTriangleCount += 2;
                    add(i2);
                    addMid(i2, i1);
                    addMid(i2, i0);
                    addCenter(i0, i1, i2);
                    util_2.ChunkedArray.add3(index, newVertexCount + 3, newVertexCount + 1, newVertexCount);
                    util_2.ChunkedArray.add3(index, newVertexCount + 2, newVertexCount + 3, newVertexCount);
                    for (let j = 0; j < 4; ++j)
                        util_2.ChunkedArray.add(group, g2);
                    newVertexCount += 4;
                }
            }
        }
        else {
            for (let i = 0, il = triangleCount; i < il; ++i) {
                const i0 = ib[i * 3], i1 = ib[i * 3 + 1], i2 = ib[i * 3 + 2];
                const g0 = gb[i0], g1 = gb[i1], g2 = gb[i2];
                if (g0 !== g1 || g0 !== g2) {
                    ++newTriangleCount;
                    add(i0);
                    add(i1);
                    add(i2);
                    util_2.ChunkedArray.add3(index, newVertexCount, newVertexCount + 1, newVertexCount + 2);
                    const g = g1 === g2 ? g1 : g0;
                    for (let j = 0; j < 3; ++j)
                        util_2.ChunkedArray.add(group, g);
                    newVertexCount += 3;
                }
                else {
                    ++newTriangleCount;
                    util_2.ChunkedArray.add3(index, i0, i1, i2);
                }
            }
        }
        const newIb = util_2.ChunkedArray.compact(index);
        const newVb = util_2.ChunkedArray.compact(vertex);
        const newNb = util_2.ChunkedArray.compact(normal);
        const newGb = util_2.ChunkedArray.compact(group);
        mesh.vertexCount = newVertexCount;
        mesh.triangleCount = newTriangleCount;
        mol_util_1.ValueCell.update(vertexBuffer, newVb);
        mol_util_1.ValueCell.update(groupBuffer, newGb);
        mol_util_1.ValueCell.update(indexBuffer, newIb);
        mol_util_1.ValueCell.update(normalBuffer, newNb);
        // keep some original data, e.g., for geometry export
        mesh.meta.originalData = { indexBuffer: ib, vertexCount, triangleCount };
        return mesh;
    }
    Mesh.uniformTriangleGroup = uniformTriangleGroup;
    //
    function getNeighboursMap(mesh) {
        const { vertexCount, triangleCount } = mesh;
        const elements = mesh.indexBuffer.ref.value;
        const neighboursMap = [];
        for (let i = 0; i < vertexCount; ++i) {
            neighboursMap[i] = [];
        }
        for (let i = 0; i < triangleCount; ++i) {
            const v1 = elements[i * 3];
            const v2 = elements[i * 3 + 1];
            const v3 = elements[i * 3 + 2];
            (0, array_1.arraySetAdd)(neighboursMap[v1], v2);
            (0, array_1.arraySetAdd)(neighboursMap[v1], v3);
            (0, array_1.arraySetAdd)(neighboursMap[v2], v1);
            (0, array_1.arraySetAdd)(neighboursMap[v2], v3);
            (0, array_1.arraySetAdd)(neighboursMap[v3], v1);
            (0, array_1.arraySetAdd)(neighboursMap[v3], v2);
        }
        return neighboursMap;
    }
    function getEdgeCounts(mesh) {
        const { triangleCount } = mesh;
        const elements = mesh.indexBuffer.ref.value;
        const edgeCounts = new Map();
        const add = (a, b) => {
            const z = (0, util_2.sortedCantorPairing)(a, b);
            const c = edgeCounts.get(z) || 0;
            edgeCounts.set(z, c + 1);
        };
        for (let i = 0; i < triangleCount; ++i) {
            const a = elements[i * 3];
            const b = elements[i * 3 + 1];
            const c = elements[i * 3 + 2];
            add(a, b);
            add(a, c);
            add(b, c);
        }
        return edgeCounts;
    }
    function getBorderVertices(edgeCounts) {
        const borderVertices = new Set();
        const pair = [0, 0];
        edgeCounts.forEach((c, z) => {
            if (c === 1) {
                (0, util_2.invertCantorPairing)(pair, z);
                borderVertices.add(pair[0]);
                borderVertices.add(pair[1]);
            }
        });
        return borderVertices;
    }
    function getBorderNeighboursMap(neighboursMap, borderVertices, edgeCounts) {
        const borderNeighboursMap = new Map();
        const add = (v, nb) => {
            if (borderNeighboursMap.has(v))
                (0, array_1.arraySetAdd)(borderNeighboursMap.get(v), nb);
            else
                borderNeighboursMap.set(v, [nb]);
        };
        borderVertices.forEach(v => {
            const neighbours = neighboursMap[v];
            for (const nb of neighbours) {
                if (borderVertices.has(nb) && edgeCounts.get((0, util_2.sortedCantorPairing)(v, nb)) === 1) {
                    add(v, nb);
                }
            }
        });
        return borderNeighboursMap;
    }
    function trimEdges(mesh, neighboursMap) {
        const { indexBuffer, triangleCount } = mesh;
        const ib = indexBuffer.ref.value;
        // new
        const index = util_2.ChunkedArray.create(Uint32Array, 3, 1024, triangleCount);
        let newTriangleCount = 0;
        for (let i = 0; i < triangleCount; ++i) {
            const a = ib[i * 3];
            const b = ib[i * 3 + 1];
            const c = ib[i * 3 + 2];
            if (neighboursMap[a].length === 2 ||
                neighboursMap[b].length === 2 ||
                neighboursMap[c].length === 2)
                continue;
            util_2.ChunkedArray.add3(index, a, b, c);
            newTriangleCount += 1;
        }
        const newIb = util_2.ChunkedArray.compact(index);
        mesh.triangleCount = newTriangleCount;
        mol_util_1.ValueCell.update(indexBuffer, newIb);
        return mesh;
    }
    function fillEdges(mesh, neighboursMap, borderNeighboursMap, maxLengthSquared) {
        var _a;
        const { vertexBuffer, indexBuffer, normalBuffer, triangleCount } = mesh;
        const vb = vertexBuffer.ref.value;
        const ib = indexBuffer.ref.value;
        const nb = normalBuffer.ref.value;
        // new
        const index = util_2.ChunkedArray.create(Uint32Array, 3, 1024, triangleCount);
        let newTriangleCount = 0;
        for (let i = 0; i < triangleCount; ++i) {
            util_2.ChunkedArray.add3(index, ib[i * 3], ib[i * 3 + 1], ib[i * 3 + 2]);
            newTriangleCount += 1;
        }
        const vA = (0, linear_algebra_1.Vec3)();
        const vB = (0, linear_algebra_1.Vec3)();
        const vC = (0, linear_algebra_1.Vec3)();
        const vD = (0, linear_algebra_1.Vec3)();
        const vAB = (0, linear_algebra_1.Vec3)();
        const vAC = (0, linear_algebra_1.Vec3)();
        const vAD = (0, linear_algebra_1.Vec3)();
        const vABC = (0, linear_algebra_1.Vec3)();
        const vAN = (0, linear_algebra_1.Vec3)();
        const vN = (0, linear_algebra_1.Vec3)();
        const AngleThreshold = (0, misc_1.degToRad)(120);
        const added = new Set();
        const indices = Array.from(borderNeighboursMap.keys())
            .filter(v => borderNeighboursMap.get(v).length < 2)
            .map(v => {
            const bnd = borderNeighboursMap.get(v);
            linear_algebra_1.Vec3.fromArray(vA, vb, v * 3);
            linear_algebra_1.Vec3.fromArray(vB, vb, bnd[0] * 3);
            linear_algebra_1.Vec3.fromArray(vC, vb, bnd[1] * 3);
            linear_algebra_1.Vec3.sub(vAB, vB, vA);
            linear_algebra_1.Vec3.sub(vAC, vC, vA);
            return [v, linear_algebra_1.Vec3.angle(vAB, vAC)];
        });
        // start with the smallest angle
        indices.sort(([, a], [, b]) => a - b);
        for (const [v, angle] of indices) {
            if (added.has(v) || angle > AngleThreshold)
                continue;
            const nbs = borderNeighboursMap.get(v);
            if (neighboursMap[nbs[0]].includes(nbs[1]) &&
                !((_a = borderNeighboursMap.get(nbs[0])) === null || _a === void 0 ? void 0 : _a.includes(nbs[1])))
                continue;
            linear_algebra_1.Vec3.fromArray(vA, vb, v * 3);
            linear_algebra_1.Vec3.fromArray(vB, vb, nbs[0] * 3);
            linear_algebra_1.Vec3.fromArray(vC, vb, nbs[1] * 3);
            linear_algebra_1.Vec3.sub(vAB, vB, vA);
            linear_algebra_1.Vec3.sub(vAC, vC, vA);
            linear_algebra_1.Vec3.add(vABC, vAB, vAC);
            if (linear_algebra_1.Vec3.squaredDistance(vA, vB) >= maxLengthSquared)
                continue;
            let add = false;
            for (const nb of neighboursMap[v]) {
                if (nbs.includes(nb))
                    continue;
                linear_algebra_1.Vec3.fromArray(vD, vb, nb * 3);
                linear_algebra_1.Vec3.sub(vAD, vD, vA);
                if (linear_algebra_1.Vec3.dot(vABC, vAD) < 0) {
                    add = true;
                    break;
                }
            }
            if (!add)
                continue;
            linear_algebra_1.Vec3.fromArray(vAN, nb, v * 3);
            linear_algebra_1.Vec3.triangleNormal(vN, vA, vB, vC);
            if (linear_algebra_1.Vec3.dot(vN, vAN) > 0) {
                util_2.ChunkedArray.add3(index, v, nbs[0], nbs[1]);
            }
            else {
                util_2.ChunkedArray.add3(index, nbs[1], nbs[0], v);
            }
            added.add(v);
            added.add(nbs[0]);
            added.add(nbs[1]);
            newTriangleCount += 1;
        }
        const newIb = util_2.ChunkedArray.compact(index);
        mesh.triangleCount = newTriangleCount;
        mol_util_1.ValueCell.update(indexBuffer, newIb);
        return mesh;
    }
    function laplacianEdgeSmoothing(mesh, borderNeighboursMap, options) {
        const { iterations, lambda } = options;
        const a = (0, linear_algebra_1.Vec3)();
        const b = (0, linear_algebra_1.Vec3)();
        const c = (0, linear_algebra_1.Vec3)();
        const t = (0, linear_algebra_1.Vec3)();
        const mu = -lambda;
        let dst = new Float32Array(mesh.vertexBuffer.ref.value.length);
        const step = (f) => {
            const pos = mesh.vertexBuffer.ref.value;
            dst.set(pos);
            borderNeighboursMap.forEach((nbs, v) => {
                if (nbs.length !== 2)
                    return;
                linear_algebra_1.Vec3.fromArray(a, pos, v * 3);
                linear_algebra_1.Vec3.fromArray(b, pos, nbs[0] * 3);
                linear_algebra_1.Vec3.fromArray(c, pos, nbs[1] * 3);
                const wab = 1 / linear_algebra_1.Vec3.distance(a, b);
                const wac = 1 / linear_algebra_1.Vec3.distance(a, c);
                linear_algebra_1.Vec3.scale(b, b, wab);
                linear_algebra_1.Vec3.scale(c, c, wac);
                linear_algebra_1.Vec3.add(t, b, c);
                linear_algebra_1.Vec3.scale(t, t, 1 / (wab + wac));
                linear_algebra_1.Vec3.sub(t, t, a);
                linear_algebra_1.Vec3.scale(t, t, f);
                linear_algebra_1.Vec3.add(t, a, t);
                linear_algebra_1.Vec3.toArray(t, dst, v * 3);
            });
            const tmp = mesh.vertexBuffer.ref.value;
            mol_util_1.ValueCell.update(mesh.vertexBuffer, dst);
            dst = tmp;
        };
        for (let k = 0; k < iterations; ++k) {
            step(lambda);
            step(mu);
        }
    }
    function smoothEdges(mesh, options) {
        trimEdges(mesh, getNeighboursMap(mesh));
        for (let k = 0; k < 10; ++k) {
            const oldTriangleCount = mesh.triangleCount;
            const edgeCounts = getEdgeCounts(mesh);
            const neighboursMap = getNeighboursMap(mesh);
            const borderVertices = getBorderVertices(edgeCounts);
            const borderNeighboursMap = getBorderNeighboursMap(neighboursMap, borderVertices, edgeCounts);
            fillEdges(mesh, neighboursMap, borderNeighboursMap, options.maxNewEdgeLength * options.maxNewEdgeLength);
            if (mesh.triangleCount === oldTriangleCount)
                break;
        }
        const edgeCounts = getEdgeCounts(mesh);
        const neighboursMap = getNeighboursMap(mesh);
        const borderVertices = getBorderVertices(edgeCounts);
        const borderNeighboursMap = getBorderNeighboursMap(neighboursMap, borderVertices, edgeCounts);
        laplacianEdgeSmoothing(mesh, borderNeighboursMap, { iterations: options.iterations, lambda: 0.5 });
        return mesh;
    }
    Mesh.smoothEdges = smoothEdges;
    //
    Mesh.Params = {
        ...base_1.BaseGeometry.Params,
        doubleSided: param_definition_1.ParamDefinition.Boolean(false, base_1.BaseGeometry.CustomQualityParamInfo),
        flipSided: param_definition_1.ParamDefinition.Boolean(false, base_1.BaseGeometry.ShadingCategory),
        flatShaded: param_definition_1.ParamDefinition.Boolean(false, base_1.BaseGeometry.ShadingCategory),
        ignoreLight: param_definition_1.ParamDefinition.Boolean(false, base_1.BaseGeometry.ShadingCategory),
        celShaded: param_definition_1.ParamDefinition.Boolean(false, base_1.BaseGeometry.ShadingCategory),
        xrayShaded: param_definition_1.ParamDefinition.Select(false, [[false, 'Off'], [true, 'On'], ['inverted', 'Inverted']], base_1.BaseGeometry.ShadingCategory),
        transparentBackfaces: param_definition_1.ParamDefinition.Select('off', param_definition_1.ParamDefinition.arrayToOptions(['off', 'on', 'opaque']), base_1.BaseGeometry.ShadingCategory),
        bumpFrequency: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 10, step: 0.1 }, base_1.BaseGeometry.ShadingCategory),
        bumpAmplitude: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 5, step: 0.1 }, base_1.BaseGeometry.ShadingCategory),
    };
    Mesh.Utils = {
        Params: Mesh.Params,
        createEmpty,
        createValues,
        createValuesSimple,
        updateValues,
        updateBoundingSphere,
        createRenderableState,
        updateRenderableState,
        createPositionIterator
    };
    function createPositionIterator(mesh, transform) {
        const groupCount = mesh.vertexCount;
        const instanceCount = transform.instanceCount.ref.value;
        const location = (0, location_iterator_1.PositionLocation)();
        const p = location.position;
        const n = location.normal;
        const vs = mesh.vertexBuffer.ref.value;
        const ns = mesh.normalBuffer.ref.value;
        const m = transform.aTransform.ref.value;
        const getLocation = (groupIndex, instanceIndex) => {
            if (instanceIndex < 0) {
                linear_algebra_1.Vec3.fromArray(p, vs, groupIndex * 3);
                linear_algebra_1.Vec3.fromArray(n, ns, groupIndex * 3);
            }
            else {
                linear_algebra_1.Vec3.transformMat4Offset(p, vs, m, 0, groupIndex * 3, instanceIndex * 16);
                linear_algebra_1.Vec3.transformDirectionOffset(n, ns, m, 0, groupIndex * 3, instanceIndex * 16);
            }
            return location;
        };
        return (0, location_iterator_1.LocationIterator)(groupCount, instanceCount, 1, getLocation);
    }
    function createValues(mesh, transform, locationIt, theme, props) {
        const { instanceCount, groupCount } = locationIt;
        const positionIt = createPositionIterator(mesh, transform);
        const color = (0, color_data_1.createColors)(locationIt, positionIt, theme.color);
        const marker = props.instanceGranularity
            ? (0, marker_data_1.createMarkers)(instanceCount, 'instance')
            : (0, marker_data_1.createMarkers)(instanceCount * groupCount, 'groupInstance');
        const overpaint = (0, overpaint_data_1.createEmptyOverpaint)();
        const transparency = (0, transparency_data_1.createEmptyTransparency)();
        const emissive = (0, emissive_data_1.createEmptyEmissive)();
        const material = (0, substance_data_1.createEmptySubstance)();
        const clipping = (0, clipping_data_1.createEmptyClipping)();
        const counts = { drawCount: mesh.triangleCount * 3, vertexCount: mesh.vertexCount, groupCount, instanceCount };
        const invariantBoundingSphere = geometry_1.Sphere3D.clone(mesh.boundingSphere);
        const boundingSphere = (0, util_3.calculateTransformBoundingSphere)(invariantBoundingSphere, transform.aTransform.ref.value, instanceCount, 0);
        return {
            dGeometryType: mol_util_1.ValueCell.create('mesh'),
            aPosition: mesh.vertexBuffer,
            aNormal: mesh.normalBuffer,
            aGroup: mesh.groupBuffer,
            elements: mesh.indexBuffer,
            dVaryingGroup: mesh.varyingGroup,
            boundingSphere: mol_util_1.ValueCell.create(boundingSphere),
            invariantBoundingSphere: mol_util_1.ValueCell.create(invariantBoundingSphere),
            uInvariantBoundingSphere: mol_util_1.ValueCell.create(linear_algebra_1.Vec4.ofSphere(invariantBoundingSphere)),
            ...color,
            ...marker,
            ...overpaint,
            ...transparency,
            ...emissive,
            ...material,
            ...clipping,
            ...transform,
            ...base_1.BaseGeometry.createValues(props, counts),
            uDoubleSided: mol_util_1.ValueCell.create(props.doubleSided),
            dFlatShaded: mol_util_1.ValueCell.create(props.flatShaded),
            dFlipSided: mol_util_1.ValueCell.create(props.flipSided),
            dIgnoreLight: mol_util_1.ValueCell.create(props.ignoreLight),
            dCelShaded: mol_util_1.ValueCell.create(props.celShaded),
            dXrayShaded: mol_util_1.ValueCell.create(props.xrayShaded === 'inverted' ? 'inverted' : props.xrayShaded === true ? 'on' : 'off'),
            dTransparentBackfaces: mol_util_1.ValueCell.create(props.transparentBackfaces),
            uBumpFrequency: mol_util_1.ValueCell.create(props.bumpFrequency),
            uBumpAmplitude: mol_util_1.ValueCell.create(props.bumpAmplitude),
            meta: mol_util_1.ValueCell.create(mesh.meta),
        };
    }
    function createValuesSimple(mesh, props, colorValue, sizeValue, transform) {
        const s = base_1.BaseGeometry.createSimple(colorValue, sizeValue, transform);
        const p = { ...param_definition_1.ParamDefinition.getDefaultValues(Mesh.Params), ...props };
        return createValues(mesh, s.transform, s.locationIterator, s.theme, p);
    }
    function updateValues(values, props) {
        base_1.BaseGeometry.updateValues(values, props);
        mol_util_1.ValueCell.updateIfChanged(values.uDoubleSided, props.doubleSided);
        mol_util_1.ValueCell.updateIfChanged(values.dFlatShaded, props.flatShaded);
        mol_util_1.ValueCell.updateIfChanged(values.dFlipSided, props.flipSided);
        mol_util_1.ValueCell.updateIfChanged(values.dIgnoreLight, props.ignoreLight);
        mol_util_1.ValueCell.updateIfChanged(values.dCelShaded, props.celShaded);
        mol_util_1.ValueCell.updateIfChanged(values.dXrayShaded, props.xrayShaded === 'inverted' ? 'inverted' : props.xrayShaded === true ? 'on' : 'off');
        mol_util_1.ValueCell.updateIfChanged(values.dTransparentBackfaces, props.transparentBackfaces);
        mol_util_1.ValueCell.updateIfChanged(values.uBumpFrequency, props.bumpFrequency);
        mol_util_1.ValueCell.updateIfChanged(values.uBumpAmplitude, props.bumpAmplitude);
    }
    function updateBoundingSphere(values, mesh) {
        const invariantBoundingSphere = geometry_1.Sphere3D.clone(mesh.boundingSphere);
        const boundingSphere = (0, util_3.calculateTransformBoundingSphere)(invariantBoundingSphere, values.aTransform.ref.value, values.instanceCount.ref.value, 0);
        if (!geometry_1.Sphere3D.equals(boundingSphere, values.boundingSphere.ref.value)) {
            mol_util_1.ValueCell.update(values.boundingSphere, boundingSphere);
        }
        if (!geometry_1.Sphere3D.equals(invariantBoundingSphere, values.invariantBoundingSphere.ref.value)) {
            mol_util_1.ValueCell.update(values.invariantBoundingSphere, invariantBoundingSphere);
            mol_util_1.ValueCell.update(values.uInvariantBoundingSphere, linear_algebra_1.Vec4.fromSphere(values.uInvariantBoundingSphere.ref.value, invariantBoundingSphere));
        }
    }
    function createRenderableState(props) {
        const state = base_1.BaseGeometry.createRenderableState(props);
        updateRenderableState(state, props);
        return state;
    }
    function updateRenderableState(state, props) {
        base_1.BaseGeometry.updateRenderableState(state, props);
        state.opaque = state.opaque && !props.xrayShaded;
        state.writeDepth = state.opaque;
    }
})(Mesh || (exports.Mesh = Mesh = {}));
