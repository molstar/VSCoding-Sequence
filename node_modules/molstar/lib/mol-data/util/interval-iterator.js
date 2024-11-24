/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { OrderedSet, Interval } from '../int';
/** Emits a segment of length one for each element in the interval that is also in the set */
export class IntervalIterator {
    updateValue() {
        this.value.index = this.curIndex;
        this.value.start = OrderedSet.findPredecessorIndex(this.set, Interval.getAt(this.interval, this.curIndex));
        this.value.end = this.value.start + 1;
    }
    move() {
        if (this.hasNext) {
            this.updateValue();
            while (this.curIndex <= this.maxIndex) {
                ++this.curIndex;
                if (OrderedSet.has(this.set, this.curIndex))
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
        if (Interval.size(interval)) {
            this.curIndex = Interval.findPredecessorIndex(interval, OrderedSet.min(set));
            this.maxIndex = Interval.findPredecessorIndex(interval, OrderedSet.max(set));
        }
        this.hasNext = OrderedSet.areIntersecting(this.interval, this.set);
    }
}
