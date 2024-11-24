/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export declare namespace SetUtils {
    function toArray<T>(set: ReadonlySet<T>): T[];
    /** Test if set a contains all elements of set b. */
    function isSuperset<T>(setA: ReadonlySet<T>, setB: ReadonlySet<T>): boolean;
    /** Add all elements from `sets` to `out` */
    function add<T>(out: Set<T>, ...sets: ReadonlySet<T>[]): Set<T>;
    /** Create set containing elements of both set a and set b. */
    function union<T>(setA: ReadonlySet<T>, setB: ReadonlySet<T>): Set<T>;
    function unionMany<T>(...sets: ReadonlySet<T>[]): Set<T>;
    function unionManyArrays<T>(arrays: T[][]): Set<T>;
    /** Create set containing elements of set a that are also in set b. */
    function intersection<T>(setA: ReadonlySet<T>, setB: ReadonlySet<T>): Set<T>;
    function areIntersecting<T>(setA: ReadonlySet<T>, setB: ReadonlySet<T>): boolean;
    function intersectionSize<T>(setA: ReadonlySet<T>, setB: ReadonlySet<T>): number;
    /** Create set containing elements of set a that are not in set b. */
    function difference<T>(setA: ReadonlySet<T>, setB: ReadonlySet<T>): Set<T>;
    /** Number of elements that are in set a but not in set b. */
    function differenceSize<T>(setA: ReadonlySet<T>, setB: ReadonlySet<T>): number;
    /** Test if set a and b contain the same elements. */
    function areEqual<T>(setA: ReadonlySet<T>, setB: ReadonlySet<T>): boolean;
}
