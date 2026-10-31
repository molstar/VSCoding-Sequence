"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Fred Ludlow <fred.ludlow@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarchinCubesMeshBuilder = MarchinCubesMeshBuilder;
exports.MarchinCubesLinesBuilder = MarchinCubesLinesBuilder;
const util_1 = require("../../../mol-data/util");
const mol_util_1 = require("../../../mol-util");
const mesh_1 = require("../../geometry/mesh/mesh");
const tables_1 = require("./tables");
const lines_builder_1 = require("../../geometry/lines/lines-builder");
function MarchinCubesMeshBuilder(vertexChunkSize, mesh) {
    const triangleChunkSize = Math.min(1 << 16, vertexChunkSize * 4);
    const vertices = util_1.ChunkedArray.create(Float32Array, 3, vertexChunkSize, mesh && mesh.vertexBuffer.ref.value);
    const normals = util_1.ChunkedArray.create(Float32Array, 3, vertexChunkSize, mesh && mesh.normalBuffer.ref.value);
    const groups = util_1.ChunkedArray.create(Float32Array, 1, vertexChunkSize, mesh && mesh.groupBuffer.ref.value);
    const indices = util_1.ChunkedArray.create(Uint32Array, 3, triangleChunkSize, mesh && mesh.indexBuffer.ref.value);
    let vertexCount = 0;
    let triangleCount = 0;
    return {
        addVertex: (x, y, z) => {
            ++vertexCount;
            return util_1.ChunkedArray.add3(vertices, x, y, z);
        },
        addNormal: (x, y, z) => {
            util_1.ChunkedArray.add3(normals, x, y, z);
        },
        addGroup: (group) => {
            util_1.ChunkedArray.add(groups, group);
        },
        addTriangle: (vertList, a, b, c) => {
            const i = vertList[a], j = vertList[b], k = vertList[c];
            // vertex indices <0 mean that the vertex was ignored and is not available
            // and hence we don't add a triangle when this occurs
            if (i >= 0 && j >= 0 && k >= 0) {
                ++triangleCount;
                util_1.ChunkedArray.add3(indices, i, j, k);
            }
        },
        get: () => {
            const vb = util_1.ChunkedArray.compact(vertices, true);
            const nb = util_1.ChunkedArray.compact(normals, true);
            const ib = util_1.ChunkedArray.compact(indices, true);
            const gb = util_1.ChunkedArray.compact(groups, true);
            return mesh_1.Mesh.create(vb, ib, nb, gb, vertexCount, triangleCount, mesh);
        }
    };
}
function MarchinCubesLinesBuilder(vertexChunkSize, lines) {
    const vertices = util_1.ChunkedArray.create(Float32Array, 3, vertexChunkSize);
    const groups = util_1.ChunkedArray.create(Float32Array, 1, vertexChunkSize);
    const indices = util_1.ChunkedArray.create(Float32Array, 2, vertexChunkSize);
    let linesCount = 0;
    return {
        addVertex: (x, y, z) => {
            return util_1.ChunkedArray.add3(vertices, x, y, z);
        },
        addNormal: () => mol_util_1.noop,
        addGroup: (group) => {
            util_1.ChunkedArray.add(groups, group);
        },
        addTriangle: (vertList, a, b, c, edgeFilter) => {
            const i = vertList[a], j = vertList[b], k = vertList[c];
            // vertex indices <0 mean that the vertex was ignored and is not available
            // and hence we don't add a triangle when this occurs
            if (i >= 0 && j >= 0 && k >= 0) {
                if (tables_1.AllowedContours[a][b] & edgeFilter) {
                    ++linesCount;
                    util_1.ChunkedArray.add2(indices, vertList[a], vertList[b]);
                }
                if (tables_1.AllowedContours[b][c] & edgeFilter) {
                    ++linesCount;
                    util_1.ChunkedArray.add2(indices, vertList[b], vertList[c]);
                }
                if (tables_1.AllowedContours[a][c] & edgeFilter) {
                    ++linesCount;
                    util_1.ChunkedArray.add2(indices, vertList[a], vertList[c]);
                }
            }
        },
        get: () => {
            const vb = util_1.ChunkedArray.compact(vertices, true);
            const ib = util_1.ChunkedArray.compact(indices, true);
            const gb = util_1.ChunkedArray.compact(groups, true);
            const builder = lines_builder_1.LinesBuilder.create(linesCount, linesCount / 10, lines);
            for (let i = 0; i < linesCount; ++i) {
                const la = ib[i * 2], lb = ib[i * 2 + 1];
                builder.add(vb[la * 3], vb[la * 3 + 1], vb[la * 3 + 2], vb[lb * 3], vb[lb * 3 + 1], vb[lb * 3 + 2], gb[la]);
            }
            return builder.getLines();
        }
    };
}
