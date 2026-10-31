/**
 * Copyright (c) 2019-23 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted from LiteMol.
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { LinkedList } from '../mol-data/generic';
export { LRUCache };
var LRUCache;
(function (LRUCache) {
    function entry(key, data) {
        return { key, data };
    }
    function create(capacity) {
        return {
            entries: LinkedList(),
            capacity: Math.max(1, capacity)
        };
    }
    LRUCache.create = create;
    function get(cache, key) {
        for (let e = cache.entries.first; e; e = e.next) {
            if (e.value.key === key) {
                cache.entries.remove(e);
                cache.entries.addLast(e.value);
                return e.value.data;
            }
        }
        return void 0;
    }
    LRUCache.get = get;
    function set(cache, key, data) {
        let removed = undefined;
        if (cache.entries.count >= cache.capacity) {
            const first = cache.entries.first;
            removed = first.value.data;
            cache.entries.remove(first);
        }
        cache.entries.addLast(entry(key, data));
        return removed;
    }
    LRUCache.set = set;
    function remove(cache, key) {
        for (let e = cache.entries.first; e; e = e.next) {
            if (e.value.key === key) {
                cache.entries.remove(e);
                break;
            }
        }
    }
    LRUCache.remove = remove;
})(LRUCache || (LRUCache = {}));
