/**
 * Copyright (c) 2019-23 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted from LiteMol.
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { LinkedList } from '../mol-data/generic';
export { LRUCache };
interface LRUCache<T> {
    entries: LinkedList<LRUCache.Entry<T>>;
    capacity: number;
}
declare namespace LRUCache {
    interface Entry<T> {
        key: string;
        data: T;
    }
    function create<T>(capacity: number): LRUCache<T>;
    function get<T>(cache: LRUCache<T>, key: string): T | undefined;
    function set<T>(cache: LRUCache<T>, key: string, data: T): T | undefined;
    function remove<T>(cache: LRUCache<T>, key: string): void;
}
