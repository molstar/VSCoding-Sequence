/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
interface UniqueArray<K, T = K> {
    keys: Set<K>;
    array: T[];
}
declare namespace UniqueArray {
    function create<K, T = K>(): UniqueArray<K, T>;
    function add<K, T>({ keys, array }: UniqueArray<K, T>, key: K, value: T): boolean;
    function has<K, T>({ keys }: UniqueArray<K, T>, key: K): boolean;
}
export { UniqueArray };
