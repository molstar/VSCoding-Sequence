"use strict";
/**
 * Copyright (c) 2017 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mask = void 0;
exports.sortAsc = sortAsc;
// TODO check if the removal of FastSet and the removal of the context object for forEach
// have any performance implications
function _ascSort(a, b) {
    return a - b;
}
function sortAsc(array) {
    Array.prototype.sort.call(array, _ascSort);
    return array;
}
var Mask;
(function (Mask) {
    class EmptyMask {
        has(i) { return false; }
        forEach(f, ctx) { return ctx; }
        constructor() {
            this.size = 0;
        }
    }
    class SingletonMask {
        has(i) { return i === this.idx; }
        forEach(f, ctx) { f(this.idx, ctx); return ctx; }
        constructor(idx) {
            this.idx = idx;
            this.size = 1;
        }
    }
    class BitMask {
        has(i) { return i < this.length && !!this.mask[i]; }
        _forEach(f, ctx) {
            for (let i = 0; i < this.length; i++) {
                if (this.mask[i])
                    f(i, ctx);
            }
        }
        forEach(f, ctx) {
            this._forEach(f, ctx);
            return ctx;
        }
        constructor(mask, size) {
            this.mask = mask;
            this.size = size;
            this.length = mask.length;
        }
    }
    class AllMask {
        has(i) { return true; }
        _forEach(f, ctx) {
            for (let i = 0; i < this.size; i++) {
                f(i, ctx);
            }
        }
        forEach(f, ctx) {
            this._forEach(f, ctx);
            return ctx;
        }
        constructor(size) {
            this.size = size;
        }
    }
    class SetMask {
        has(i) { return this.set.has(i); }
        _forEach(f, ctx) {
            for (const idx of this.flatten()) {
                f(idx, ctx);
            }
        }
        flatten() {
            if (this._flat)
                return this._flat;
            const indices = new Int32Array(this.size);
            let offset = 0;
            this.set.forEach(i => indices[offset++] = i);
            sortAsc(indices);
            this._flat = indices;
            return this._flat;
        }
        forEach(f, ctx) {
            this._forEach(f, ctx);
            return ctx;
        }
        constructor(set) {
            this.set = set;
            this._flat = void 0;
            this.size = set.size;
        }
    }
    function always(size) { return new AllMask(size); }
    Mask.always = always;
    Mask.never = new EmptyMask();
    function ofSet(set) {
        return new SetMask(set);
    }
    Mask.ofSet = ofSet;
    function singleton(i) {
        return new SingletonMask(i);
    }
    Mask.singleton = singleton;
    function ofUniqueIndices(indices) {
        const len = indices.length;
        if (len === 0)
            return new EmptyMask();
        if (len === 1)
            return new SingletonMask(indices[0]);
        let max = 0;
        for (const i of indices) {
            if (i > max)
                max = i;
        }
        if (len === max)
            return new AllMask(len);
        const f = len / max;
        if (f < 1 / 12) {
            const set = new Set();
            for (const i of indices)
                set.add(i);
            return new SetMask(set);
        }
        const mask = new Int8Array(max + 1);
        for (const i of indices) {
            mask[i] = 1;
        }
        return new BitMask(mask, indices.length);
    }
    Mask.ofUniqueIndices = ofUniqueIndices;
    function ofMask(mask, size) {
        return new BitMask(mask, size);
    }
    Mask.ofMask = ofMask;
    function hasAny(mask, xs) {
        for (const x of xs) {
            if (mask.has(x))
                return true;
        }
        return false;
    }
    Mask.hasAny = hasAny;
    function complement(mask, against) {
        let count = 0;
        let max = 0;
        against.forEach(i => {
            if (!mask.has(i)) {
                count++;
                if (i > max)
                    max = i;
            }
        });
        if (count / max < 1 / 12) {
            // set based
            const set = new Set();
            against.forEach(i => {
                if (!mask.has(i)) {
                    set.add(i);
                }
            });
            return ofSet(set);
        }
        else {
            // mask based
            const target = new Uint8Array(max + 1);
            against.forEach(i => {
                if (!mask.has(i)) {
                    target[i] = 1;
                }
            });
            return ofMask(target, count);
        }
    }
    Mask.complement = complement;
})(Mask || (exports.Mask = Mask = {}));
