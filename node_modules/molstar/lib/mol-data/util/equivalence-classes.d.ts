/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
export declare class EquivalenceClassesImpl<K, V> {
    private getHash;
    private areEqual;
    private id;
    private byHash;
    readonly groups: K[][];
    private createGroup;
    add(key: K, a: V): V;
    constructor(getHash: (v: V) => any, areEqual: (a: V, b: V) => boolean);
}
export declare function EquivalenceClasses<K, V>(getHash: (x: V) => any, areEqual: (a: V, b: V) => boolean): EquivalenceClassesImpl<K, V>;
