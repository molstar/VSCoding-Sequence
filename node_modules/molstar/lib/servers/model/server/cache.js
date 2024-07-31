/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { ConsoleLogger } from '../../../mol-util/console-logger';
import { LinkedList } from '../../../mol-data/generic';
import { ModelServerConfig as ServerConfig } from '../config';
export class Cache {
    clearTimeout(e) {
        if (typeof e.value.timeoutId !== 'undefined') {
            clearTimeout(e.value.timeoutId);
            e.value.timeoutId = void 0;
        }
    }
    dispose(e) {
        this.clearTimeout(e);
        if (e.inList) {
            this.entries.remove(e);
            this.approximateSize -= e.value.approximateSize;
        }
        this.entryMap.delete(e.value.key);
    }
    refresh(e) {
        this.clearTimeout(e);
        e.value.timeoutId = setTimeout(() => this.expireNode(e), ServerConfig.cacheEntryTimeoutMs);
        this.entries.remove(e);
        this.entries.addFirst(e.value);
    }
    expireNode(e, notify = true) {
        if (notify)
            ConsoleLogger.log('Cache', `${e.value.key} expired.`);
        this.dispose(e);
    }
    expireAll() {
        for (let e = this.entries.first; e; e = e.next)
            this.expireNode(e, false);
    }
    expire(key) {
        const entry = this.entryMap.get(key);
        if (!entry)
            return;
        this.expireNode(entry);
    }
    add(item) {
        const key = this.keyGetter(item);
        const approximateSize = this.sizeGetter(item);
        if (this.entryMap.has(key))
            this.dispose(this.entryMap.get(key));
        if (ServerConfig.cacheMaxSizeInBytes < this.approximateSize + approximateSize) {
            if (this.entries.last)
                this.dispose(this.entries.last);
        }
        this.approximateSize += approximateSize;
        const entry = { key, approximateSize, timeoutId: void 0, item };
        const e = this.entries.addFirst(entry);
        this.entryMap.set(key, e);
        this.refresh(e);
        ConsoleLogger.log('Cache', `${key} added.`);
        return item;
    }
    has(key) {
        return this.entryMap.has(key);
    }
    get(key) {
        if (!this.entryMap.has(key))
            return void 0;
        const e = this.entryMap.get(key);
        this.refresh(e);
        ConsoleLogger.log('Cache', `${key} accessed.`);
        return e.value.item;
    }
    constructor(keyGetter, sizeGetter) {
        this.keyGetter = keyGetter;
        this.sizeGetter = sizeGetter;
        this.entries = LinkedList();
        this.entryMap = new Map();
        this.approximateSize = 0;
    }
}
