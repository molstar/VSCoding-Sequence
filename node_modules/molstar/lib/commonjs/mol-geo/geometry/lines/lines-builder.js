"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinesBuilder = void 0;
const util_1 = require("../../../mol-data/util");
const lines_1 = require("./lines");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const tmpVecA = (0, linear_algebra_1.Vec3)();
const tmpVecB = (0, linear_algebra_1.Vec3)();
const tmpDir = (0, linear_algebra_1.Vec3)();
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
const caAdd = util_1.ChunkedArray.add;
const caAdd3 = util_1.ChunkedArray.add3;
var LinesBuilder;
(function (LinesBuilder) {
    function create(initialCount = 2048, chunkSize = 1024, lines) {
        const groups = util_1.ChunkedArray.create(Float32Array, 1, chunkSize, lines ? lines.groupBuffer.ref.value : initialCount);
        const starts = util_1.ChunkedArray.create(Float32Array, 3, chunkSize, lines ? lines.startBuffer.ref.value : initialCount);
        const ends = util_1.ChunkedArray.create(Float32Array, 3, chunkSize, lines ? lines.endBuffer.ref.value : initialCount);
        const add = (startX, startY, startZ, endX, endY, endZ, group) => {
            for (let i = 0; i < 4; ++i) {
                caAdd3(starts, startX, startY, startZ);
                caAdd3(ends, endX, endY, endZ);
                caAdd(groups, group);
            }
        };
        const addVec = (start, end, group) => {
            for (let i = 0; i < 4; ++i) {
                caAdd3(starts, start[0], start[1], start[2]);
                caAdd3(ends, end[0], end[1], end[2]);
                caAdd(groups, group);
            }
        };
        const addFixedCountDashes = (start, end, segmentCount, group) => {
            const d = linear_algebra_1.Vec3.distance(start, end);
            const isOdd = segmentCount % 2 !== 0;
            const s = Math.floor((segmentCount + 1) / 2);
            const step = d / (segmentCount + 0.5);
            linear_algebra_1.Vec3.setMagnitude(tmpDir, linear_algebra_1.Vec3.sub(tmpDir, end, start), step);
            linear_algebra_1.Vec3.copy(tmpVecA, start);
            for (let j = 0; j < s; ++j) {
                linear_algebra_1.Vec3.add(tmpVecA, tmpVecA, tmpDir);
                if (isOdd && j === s - 1) {
                    linear_algebra_1.Vec3.copy(tmpVecB, end);
                }
                else {
                    linear_algebra_1.Vec3.add(tmpVecB, tmpVecA, tmpDir);
                }
                add(tmpVecA[0], tmpVecA[1], tmpVecA[2], tmpVecB[0], tmpVecB[1], tmpVecB[2], group);
                linear_algebra_1.Vec3.add(tmpVecA, tmpVecA, tmpDir);
            }
        };
        return {
            add,
            addVec,
            addFixedCountDashes,
            addFixedLengthDashes: (start, end, segmentLength, group) => {
                const d = linear_algebra_1.Vec3.distance(start, end);
                addFixedCountDashes(start, end, d / segmentLength, group);
            },
            addCage: (t, cage, group) => {
                const { vertices, edges } = cage;
                for (let i = 0, il = edges.length; i < il; i += 2) {
                    linear_algebra_1.Vec3.fromArray(tmpVecA, vertices, edges[i] * 3);
                    linear_algebra_1.Vec3.fromArray(tmpVecB, vertices, edges[i + 1] * 3);
                    linear_algebra_1.Vec3.transformMat4(tmpVecA, tmpVecA, t);
                    linear_algebra_1.Vec3.transformMat4(tmpVecB, tmpVecB, t);
                    add(tmpVecA[0], tmpVecA[1], tmpVecA[2], tmpVecB[0], tmpVecB[1], tmpVecB[2], group);
                }
            },
            getLines: () => {
                const lineCount = groups.elementCount / 4;
                const gb = util_1.ChunkedArray.compact(groups, true);
                const sb = util_1.ChunkedArray.compact(starts, true);
                const eb = util_1.ChunkedArray.compact(ends, true);
                const mb = lines && lineCount <= lines.lineCount ? lines.mappingBuffer.ref.value : new Float32Array(lineCount * 8);
                const ib = lines && lineCount <= lines.lineCount ? lines.indexBuffer.ref.value : new Uint32Array(lineCount * 6);
                if (!lines || lineCount > lines.lineCount)
                    fillMappingAndIndices(lineCount, mb, ib);
                return lines_1.Lines.create(mb, ib, gb, sb, eb, lineCount, lines);
            }
        };
    }
    LinesBuilder.create = create;
})(LinesBuilder || (exports.LinesBuilder = LinesBuilder = {}));
function fillMappingAndIndices(n, mb, ib) {
    for (let i = 0; i < n; ++i) {
        const mo = i * 8;
        mb[mo] = -1;
        mb[mo + 1] = -1;
        mb[mo + 2] = 1;
        mb[mo + 3] = -1;
        mb[mo + 4] = -1;
        mb[mo + 5] = 1;
        mb[mo + 6] = 1;
        mb[mo + 7] = 1;
    }
    for (let i = 0; i < n; ++i) {
        const o = i * 4;
        const io = i * 6;
        ib[io] = o;
        ib[io + 1] = o + 1;
        ib[io + 2] = o + 2;
        ib[io + 3] = o + 1;
        ib[io + 4] = o + 3;
        ib[io + 5] = o + 2;
    }
}
