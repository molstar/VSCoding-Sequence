"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntervalIterator = void 0;
const int_1 = require("../int");
/** Emits a segment of length one for each element in the interval that is also in the set */
class IntervalIterator {
    updateValue() {
        this.value.index = this.curIndex;
        this.value.start = int_1.OrderedSet.findPredecessorIndex(this.set, int_1.Interval.getAt(this.interval, this.curIndex));
        this.value.end = this.value.start + 1;
    }
    move() {
        if (this.hasNext) {
            this.updateValue();
            while (this.curIndex <= this.maxIndex) {
                ++this.curIndex;
                if (int_1.OrderedSet.has(this.set, this.curIndex))
                    break;
            }
            this.hasNext = this.curIndex <= this.maxIndex;
        }
        return this.value;
    }
    constructor(interval, set) {
        this.interval = interval;
        this.set = set;
        this.value = { index: 0, start: 0, end: 0 };
        this.curIndex = 0;
        this.maxIndex = 0;
        this.hasNext = false;
        if (int_1.Interval.size(interval)) {
            this.curIndex = int_1.Interval.findPredecessorIndex(interval, int_1.OrderedSet.min(set));
            this.maxIndex = int_1.Interval.findPredecessorIndex(interval, int_1.OrderedSet.max(set));
        }
        this.hasNext = int_1.OrderedSet.areIntersecting(this.interval, this.set);
    }
}
exports.IntervalIterator = IntervalIterator;
