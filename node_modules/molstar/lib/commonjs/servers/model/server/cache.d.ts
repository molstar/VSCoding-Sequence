/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
export interface CacheParams {
    useCache: boolean;
    maxApproximateSizeInBytes: number;
    entryTimeoutInMs: number;
}
export declare class Cache<T> {
    private keyGetter;
    private sizeGetter;
    private entries;
    private entryMap;
    private approximateSize;
    private clearTimeout;
    private dispose;
    private refresh;
    private expireNode;
    expireAll(): void;
    expire(key: string): void;
    add(item: T): T;
    has(key: string): boolean;
    get(key: string): T | undefined;
    constructor(keyGetter: (i: T) => string, sizeGetter: (i: T) => number);
}
