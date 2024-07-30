/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { iterableToArray } from '../util';
var IntMap;
(function (IntMap) {
    IntMap.Empty = new Map();
    function keyArray(map) {
        return iterableToArray(map.keys());
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
})(IntMap || (IntMap = {}));
export { IntMap };
