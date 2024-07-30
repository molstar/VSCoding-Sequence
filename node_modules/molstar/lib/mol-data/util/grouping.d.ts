/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Column } from '../db';
export interface Grouping<V, K> {
    map: Map<K, V[]>;
    keys: ReadonlyArray<K>;
    groups: ReadonlyArray<ReadonlyArray<V>>;
}
declare class GroupingImpl<K, V> {
    private getKey;
    readonly map: Map<K, V[]>;
    readonly keys: K[];
    readonly groups: V[][];
    add(a: V): void;
    getGrouping(): Grouping<V, K>;
    constructor(getKey: (v: V) => K);
}
export declare function Grouper<V, K>(getKey: (x: V) => K): GroupingImpl<K, V>;
export declare function groupBy<V, K>(values: ArrayLike<V> | Column<V>, getKey: (x: V) => K): Grouping<V, K>;
export {};
