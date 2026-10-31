"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncQueue = void 0;
const array_1 = require("./array");
const rxjs_1 = require("rxjs");
class AsyncQueue {
    constructor() {
        this.queue = [];
        this.signal = new rxjs_1.Subject();
    }
    get length() { return this.queue.length; }
    enqueue(v) {
        this.queue.push(v);
        if (this.queue.length === 1)
            return true;
        return this.waitFor(v);
    }
    handled(v) {
        (0, array_1.arrayRemoveInPlace)(this.queue, v);
        if (this.queue.length > 0) {
            this.signal.next({ v: this.queue[0], stillPresent: true });
        }
    }
    remove(v) {
        const rem = (0, array_1.arrayRemoveInPlace)(this.queue, v);
        if (rem)
            this.signal.next({ v, stillPresent: false });
        return rem;
    }
    waitFor(t) {
        return new Promise(res => {
            const sub = this.signal.subscribe(({ v, stillPresent: removed }) => {
                if (v === t) {
                    sub.unsubscribe();
                    res(removed);
                }
            });
        });
    }
}
exports.AsyncQueue = AsyncQueue;
