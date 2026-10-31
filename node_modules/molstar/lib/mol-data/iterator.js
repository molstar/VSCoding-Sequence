/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
class ArrayIteratorImpl {
    move() {
        ++this.index;
        this.lastValue = this.xs[this.index];
        this.hasNext = this.index < this.length - 1;
        return this.lastValue;
    }
    constructor(xs) {
        this.xs = [];
        this.index = -1;
        this.length = 0;
        this.hasNext = false;
        this.length = xs.length;
        this.hasNext = xs.length > 0;
        this.xs = xs;
        this.index = -1;
        // try to avoid deoptimization with undefined values
        this.lastValue = xs.length > 0 ? xs[0] : void 0;
    }
}
class RangeIteratorImpl {
    move() {
        ++this.value;
        this.hasNext = this.value < this.max;
        return this.value;
    }
    constructor(min, max) {
        this.max = max;
        this.value = 0;
        this.hasNext = false;
        this.value = min - 1;
        this.hasNext = max >= min;
    }
}
class ValueIterator {
    move() { this.hasNext = false; return this.value; }
    constructor(value) {
        this.value = value;
        this.hasNext = true;
    }
}
class MapIteratorImpl {
    move() {
        const v = this.f(this.base.move());
        this.hasNext = this.base.hasNext;
        return v;
    }
    constructor(base, f) {
        this.base = base;
        this.f = f;
        this.hasNext = false;
        this.hasNext = base.hasNext;
    }
}
class FilterIteratorImpl {
    move() {
        const ret = this.next;
        this.hasNext = this.findNext();
        return ret;
    }
    findNext() {
        while (this.base.hasNext) {
            this.next = this.base.move();
            if (this.p(this.next))
                return true;
        }
        return false;
    }
    constructor(base, p) {
        this.base = base;
        this.p = p;
        this.hasNext = this.findNext();
    }
}
var Iterator;
(function (Iterator) {
    Iterator.Empty = new RangeIteratorImpl(0, -1);
    function Array(xs) { return new ArrayIteratorImpl(xs); }
    Iterator.Array = Array;
    function Value(value) { return new ValueIterator(value); }
    Iterator.Value = Value;
    function Range(min, max) { return new RangeIteratorImpl(min, max); }
    Iterator.Range = Range;
    function map(base, f) { return new MapIteratorImpl(base, f); }
    Iterator.map = map;
    function filter(base, p) { return new FilterIteratorImpl(base, p); }
    Iterator.filter = filter;
    // Iterate until first truthy value is returned.
    function forEach(it, f, ctx) {
        while (it.hasNext) {
            const c = f(it.move(), ctx);
            if (c)
                return ctx;
        }
        return ctx;
    }
    Iterator.forEach = forEach;
})(Iterator || (Iterator = {}));
export { Iterator };
