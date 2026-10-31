"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedIndex = LinkedIndex;
function LinkedIndex(size) {
    return new LinkedIndexImpl(size);
}
class LinkedIndexImpl {
    remove(i) {
        const { prev, next } = this;
        const p = prev[i], n = next[i];
        if (p >= 0) {
            next[p] = n;
            prev[i] = -1;
        }
        if (n >= 0) {
            prev[n] = p;
            next[i] = -1;
        }
        if (i === this.head) {
            if (p < 0)
                this.head = n;
            else
                this.head = p;
        }
    }
    has(i) {
        return this.prev[i] >= 0 || this.next[i] >= 0 || this.head === i;
    }
    constructor(size) {
        this.head = size > 0 ? 0 : -1;
        this.prev = new Int32Array(size);
        this.next = new Int32Array(size);
        for (let i = 0; i < size; i++) {
            this.next[i] = i + 1;
            this.prev[i] = i - 1;
        }
        this.prev[0] = -1;
        this.next[size - 1] = -1;
    }
}
