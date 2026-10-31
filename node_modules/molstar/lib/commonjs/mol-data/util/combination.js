"use strict";
/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombinationIterator = void 0;
exports.combinations = combinations;
function P(m, n) {
    let p = 1;
    while (n--)
        p *= m--;
    return p;
}
function C(m, n) {
    if (n > m)
        return 0;
    return P(m, n) / P(n, n);
}
function nextIndex(n) {
    const smallest = n & -n;
    const ripple = n + smallest;
    const newSmallest = ripple & -ripple;
    const ones = ((newSmallest / smallest) >> 1) - 1;
    return ripple | ones;
}
;
class CombinationIterator {
    move() {
        if (this.hasNext) {
            let i = 0, j = 0, n = this.index;
            for (; n; n >>>= 1, i++) {
                if (n & 1)
                    this.value[j++] = this.array[i];
            }
            this.index = nextIndex(this.index);
            this.hasNext = this.index < this.maxIndex;
        }
        return this.value;
    }
    constructor(array, count) {
        this.array = array;
        this.hasNext = false;
        this.index = (1 << count) - 1;
        this.size = C(array.length, count);
        this.maxIndex = 1 << array.length,
            this.value = new Array(count);
        this.hasNext = count > 0 && count <= array.length;
    }
}
exports.CombinationIterator = CombinationIterator;
function combinations(array, count) {
    const out = [];
    const combinationIt = new CombinationIterator(array, count);
    while (combinationIt.hasNext)
        out.push(combinationIt.move().slice());
    return out;
}
