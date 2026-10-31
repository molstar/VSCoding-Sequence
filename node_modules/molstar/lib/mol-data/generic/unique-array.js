/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
var UniqueArray;
(function (UniqueArray) {
    function create() {
        return { keys: new Set(), array: [] };
    }
    UniqueArray.create = create;
    function add({ keys, array }, key, value) {
        if (keys.has(key))
            return false;
        keys.add(key);
        array[array.length] = value;
        return true;
    }
    UniqueArray.add = add;
    function has({ keys }, key) {
        return keys.has(key);
    }
    UniqueArray.has = has;
})(UniqueArray || (UniqueArray = {}));
export { UniqueArray };
