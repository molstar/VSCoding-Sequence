"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquivalenceClassesImpl = void 0;
exports.EquivalenceClasses = EquivalenceClasses;
class EquivalenceClassesImpl {
    createGroup(key, value) {
        const id = this.id++;
        const keys = [key];
        this.groups[id] = keys;
        return { id, keys, value };
    }
    // Return the group representative.
    add(key, a) {
        const hash = this.getHash(a);
        if (this.byHash.has(hash)) {
            const groups = this.byHash.get(hash);
            for (let i = 0, _i = groups.length; i < _i; i++) {
                const group = groups[i];
                if (this.areEqual(a, group.value)) {
                    group.keys[group.keys.length] = key;
                    return group.value;
                }
            }
            const group = this.createGroup(key, a);
            groups[groups.length] = group;
            return group.value;
        }
        else {
            const group = this.createGroup(key, a);
            this.byHash.set(hash, [group]);
            return group.value;
        }
    }
    constructor(getHash, areEqual) {
        this.getHash = getHash;
        this.areEqual = areEqual;
        this.id = 0;
        this.byHash = new Map();
        this.groups = [];
    }
}
exports.EquivalenceClassesImpl = EquivalenceClassesImpl;
function EquivalenceClasses(getHash, areEqual) {
    return new EquivalenceClassesImpl(getHash, areEqual);
}
