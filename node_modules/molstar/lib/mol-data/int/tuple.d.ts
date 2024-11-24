/**
 * Copyright (c) 2017-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
/**
 * Represents a pair of two integers as a double,
 * Caution: === does not work, because of NaN, use IntTuple.areEqual for equality
 */
interface IntTuple {
    '@type': 'int-tuple';
}
declare namespace IntTuple {
    const Zero: IntTuple;
    function is(x: any): x is IntTuple;
    function create(fst: number, snd: number): IntTuple;
    /** snd - fst */
    function diff(t: IntTuple): number;
    function fst(t: IntTuple): number;
    function snd(t: IntTuple): number;
    /** Normal equality does not work, because NaN === NaN ~> false */
    function areEqual(a: IntTuple, b: IntTuple): boolean;
    function compare(a: IntTuple, b: IntTuple): number;
    function compareInArray(xs: ArrayLike<IntTuple>, i: number, j: number): number;
    function hashCode(t: IntTuple): number;
    function toString(t: IntTuple): string;
}
export { IntTuple };
