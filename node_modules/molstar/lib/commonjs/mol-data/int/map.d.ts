/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
/** Immutable by convention IntMap */
interface IntMap<T> {
    has(key: number): boolean;
    keys(): IterableIterator<number>;
    values(): IterableIterator<T>;
    get(key: number): T;
    readonly size: number;
}
declare namespace IntMap {
    const Empty: IntMap<any>;
    interface Mutable<T> extends IntMap<T> {
        set(key: number, value: T): void;
    }
    function keyArray<T>(map: IntMap<T>): number[];
    function Mutable<T>(): Mutable<T>;
    function asImmutable<T>(map: IntMap<T>): IntMap<T>;
    function copy<T>(map: IntMap<T>): Mutable<T>;
    function addFrom<T>(map: Mutable<T>, src: IntMap<T>): Mutable<T>;
}
export { IntMap };
