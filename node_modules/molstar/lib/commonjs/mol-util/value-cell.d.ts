/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
/** A mutable value reference. */
interface ValueRef<T> {
    ref: T;
}
declare namespace ValueRef {
    function create<T>(ref: T): ValueRef<T>;
    function set<T>(ref: ValueRef<T>, value: T): ValueRef<T>;
}
/**
 * An immutable value box that also holds a version of the attribute.
 * Optionally includes automatically propadated "metadata".
 */
type ValueBox<T, D = never> = {
    /** Unique identifier in the range 0 to 0x7FFFFFFF */
    readonly id: number;
    readonly version: number;
    readonly metadata: D;
    readonly value: T;
};
declare namespace ValueBox {
    function create<T, D = never>(value: T, metadata?: D): ValueBox<T, D>;
    /** The box.metadata is carried over from the old box */
    function withValue<T, D>(box: ValueBox<T, D>, value: T): ValueBox<T, D>;
}
/** An immutable box stored inside a mutable cell. */
type ValueCell<T, D = never> = ValueRef<ValueBox<T, D>>;
declare namespace ValueCell {
    function create<T, D = never>(value: T, metadata?: D): ValueCell<T, D>;
    /** The box.metadata is carried over from the old box */
    function update<T, D>(cell: ValueCell<T, D>, value: T): ValueCell<T, D>;
    function set<T, D>(cell: ValueCell<T, D>, box: ValueBox<T, D>): ValueCell<T, D>;
    /** Updates the cell if the value is has changed, comparing by reference */
    function updateIfChanged<T, D>(cell: ValueCell<T, D>, value: T): ValueCell<T, D>;
}
export { ValueRef, ValueBox, ValueCell };
