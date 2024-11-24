"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashSet = HashSet;
class HashSetImpl {
    add(a) {
        const hash = this.getHash(a);
        if (this.byHash.has(hash)) {
            const xs = this.byHash.get(hash);
            for (let i = 0, _i = xs.length; i < _i; i++) {
                if (this.areEqual(a, xs[i]))
                    return false;
            }
            xs[xs.length] = a;
            this.size++;
            return true;
        }
        else {
            this.byHash.set(hash, [a]);
            this.size++;
            return true;
        }
    }
    has(v) {
        const hash = this.getHash(v);
        if (!this.byHash.has(hash))
            return false;
        const xs = this.byHash.get(hash);
        for (let i = 0, _i = xs.length; i < _i; i++) {
            if (this.areEqual(v, xs[i]))
                return true;
        }
        return false;
    }
    constructor(getHash, areEqual) {
        this.getHash = getHash;
        this.areEqual = areEqual;
        this.size = 0;
        this.byHash = new Map();
    }
}
// TODO: add implementations with multilevel hashing support?
function HashSet(getHash, areEqual) {
    return new HashSetImpl(getHash, areEqual);
}
