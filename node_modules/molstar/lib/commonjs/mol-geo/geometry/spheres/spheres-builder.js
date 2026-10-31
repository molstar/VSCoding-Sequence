"use strict";
/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpheresBuilder = void 0;
const util_1 = require("../../../mol-data/util");
const spheres_1 = require("./spheres");
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
const caAdd3 = util_1.ChunkedArray.add3;
const caAdd = util_1.ChunkedArray.add;
var SpheresBuilder;
(function (SpheresBuilder) {
    function create(initialCount = 2048, chunkSize = 1024, spheres) {
        const centers = util_1.ChunkedArray.create(Float32Array, 3, chunkSize, spheres ? spheres.centerBuffer.ref.value : initialCount);
        const groups = util_1.ChunkedArray.create(Float32Array, 1, chunkSize, spheres ? spheres.groupBuffer.ref.value : initialCount);
        return {
            add: (x, y, z, group) => {
                caAdd3(centers, x, y, z);
                caAdd(groups, group);
            },
            getSpheres: () => {
                const cb = util_1.ChunkedArray.compact(centers, true);
                const gb = util_1.ChunkedArray.compact(groups, true);
                return spheres_1.Spheres.create(cb, gb, centers.elementCount, spheres);
            }
        };
    }
    SpheresBuilder.create = create;
})(SpheresBuilder || (exports.SpheresBuilder = SpheresBuilder = {}));
