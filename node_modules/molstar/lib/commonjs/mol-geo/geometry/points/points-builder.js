"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointsBuilder = void 0;
const util_1 = require("../../../mol-data/util");
const points_1 = require("./points");
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
const caAdd3 = util_1.ChunkedArray.add3;
const caAdd = util_1.ChunkedArray.add;
var PointsBuilder;
(function (PointsBuilder) {
    function create(initialCount = 2048, chunkSize = 1024, points) {
        const centers = util_1.ChunkedArray.create(Float32Array, 3, chunkSize, points ? points.centerBuffer.ref.value : initialCount);
        const groups = util_1.ChunkedArray.create(Float32Array, 1, chunkSize, points ? points.groupBuffer.ref.value : initialCount);
        return {
            add: (x, y, z, group) => {
                caAdd3(centers, x, y, z);
                caAdd(groups, group);
            },
            getPoints: () => {
                const cb = util_1.ChunkedArray.compact(centers, true);
                const gb = util_1.ChunkedArray.compact(groups, true);
                return points_1.Points.create(cb, gb, centers.elementCount, points);
            }
        };
    }
    PointsBuilder.create = create;
})(PointsBuilder || (exports.PointsBuilder = PointsBuilder = {}));
