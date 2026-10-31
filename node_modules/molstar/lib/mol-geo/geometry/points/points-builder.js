/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ChunkedArray } from '../../../mol-data/util';
import { Points } from './points';
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
const caAdd3 = ChunkedArray.add3;
const caAdd = ChunkedArray.add;
export var PointsBuilder;
(function (PointsBuilder) {
    function create(initialCount = 2048, chunkSize = 1024, points) {
        const centers = ChunkedArray.create(Float32Array, 3, chunkSize, points ? points.centerBuffer.ref.value : initialCount);
        const groups = ChunkedArray.create(Float32Array, 1, chunkSize, points ? points.groupBuffer.ref.value : initialCount);
        return {
            add: (x, y, z, group) => {
                caAdd3(centers, x, y, z);
                caAdd(groups, group);
            },
            getPoints: () => {
                const cb = ChunkedArray.compact(centers, true);
                const gb = ChunkedArray.compact(groups, true);
                return Points.create(cb, gb, centers.elementCount, points);
            }
        };
    }
    PointsBuilder.create = create;
})(PointsBuilder || (PointsBuilder = {}));
