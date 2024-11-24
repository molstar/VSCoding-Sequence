"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntMap = void 0;
const util_1 = require("../util");
var IntMap;
(function (IntMap) {
    IntMap.Empty = new Map();
    function keyArray(map) {
        return (0, util_1.iterableToArray)(map.keys());
    }
    IntMap.keyArray = keyArray;
    function Mutable() {
        return new Map();
    }
    IntMap.Mutable = Mutable;
    function asImmutable(map) {
        return map;
    }
    IntMap.asImmutable = asImmutable;
    function copy(map) {
        const ret = Mutable();
        const it = map.keys();
        while (true) {
            const { done, value } = it.next();
            if (done)
                break;
            ret.set(value, map.get(value));
        }
        return ret;
    }
    IntMap.copy = copy;
    function addFrom(map, src) {
        const it = src.keys();
        while (true) {
            const { done, value } = it.next();
            if (done)
                break;
            map.set(value, src.get(value));
        }
        return map;
    }
    IntMap.addFrom = addFrom;
})(IntMap || (exports.IntMap = IntMap = {}));
