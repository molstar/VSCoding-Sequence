/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
/**
 * "Idiomatic" usage:
 *
 * const it = ...;
 * while (it.hasNext) { const v = it.move(); ... }
 */
interface Iterator<T> {
    readonly hasNext: boolean;
    move(): T;
}
declare namespace Iterator {
    const Empty: Iterator<any>;
    function Array<T>(xs: ArrayLike<T>): Iterator<T>;
    function Value<T>(value: T): Iterator<T>;
    function Range(min: number, max: number): Iterator<number>;
    function map<T, R>(base: Iterator<T>, f: (v: T) => R): Iterator<R>;
    function filter<T>(base: Iterator<T>, p: (v: T) => boolean): Iterator<T>;
    function forEach<T, Ctx>(it: Iterator<T>, f: (v: T, ctx: Ctx) => any, ctx: Ctx): Ctx;
}
export { Iterator };
