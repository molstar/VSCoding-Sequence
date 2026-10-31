"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementSetIntraBondCache = void 0;
const int_1 = require("../../../../../mol-data/int");
class ElementSetIntraBondCache {
    constructor() {
        this.data = new Map();
    }
    get(xs) {
        const hash = int_1.SortedArray.hashCode(xs);
        if (!this.data.has(hash))
            return void 0;
        for (const [s, b] of this.data.get(hash)) {
            if (int_1.SortedArray.areEqual(xs, s))
                return b;
        }
    }
    set(xs, bonds) {
        const hash = int_1.SortedArray.hashCode(xs);
        if (this.data.has(hash)) {
            const es = this.data.get(hash);
            for (const e of es) {
                if (int_1.SortedArray.areEqual(xs, e[0])) {
                    e[1] = bonds;
                    return;
                }
            }
            es.push([xs, bonds]);
        }
        else {
            this.data.set(hash, [[xs, bonds]]);
        }
    }
    static get(model) {
        if (!model._dynamicPropertyData.ElementSetIntraBondCache) {
            model._dynamicPropertyData.ElementSetIntraBondCache = new ElementSetIntraBondCache();
        }
        return model._dynamicPropertyData.ElementSetIntraBondCache;
    }
}
exports.ElementSetIntraBondCache = ElementSetIntraBondCache;
