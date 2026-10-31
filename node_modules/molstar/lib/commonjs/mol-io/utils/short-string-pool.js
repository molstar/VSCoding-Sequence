"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * from https://github.com/dsehnal/CIFTools.js
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShortStringPool = void 0;
var ShortStringPool;
(function (ShortStringPool) {
    function create() { return Object.create(null); }
    ShortStringPool.create = create;
    function get(pool, str) {
        if (str.length > 6)
            return str;
        const value = pool[str];
        if (value !== void 0)
            return value;
        pool[str] = str;
        return str;
    }
    ShortStringPool.get = get;
})(ShortStringPool || (exports.ShortStringPool = ShortStringPool = {}));
