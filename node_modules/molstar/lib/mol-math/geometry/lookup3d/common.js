/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export var Result;
(function (Result) {
    function add(result, index, distSq) {
        result.squaredDistances[result.count] = distSq;
        result.indices[result.count++] = index;
    }
    Result.add = add;
    function reset(result) {
        result.count = 0;
    }
    Result.reset = reset;
    function create() {
        return { count: 0, indices: [], squaredDistances: [] };
    }
    Result.create = create;
    function copy(out, result) {
        for (let i = 0; i < result.count; ++i) {
            out.indices[i] = result.indices[i];
            out.squaredDistances[i] = result.squaredDistances[i];
        }
        out.count = result.count;
        return out;
    }
    Result.copy = copy;
})(Result || (Result = {}));
