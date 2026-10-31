/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
interface SetLike<T> {
    readonly size: number;
    add(a: T): boolean;
    has(a: T): boolean;
}
export declare function HashSet<T>(getHash: (v: T) => any, areEqual: (a: T, b: T) => boolean): SetLike<T>;
export {};
