/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
export declare class AsyncQueue<T> {
    private queue;
    private signal;
    get length(): number;
    enqueue(v: T): true | Promise<boolean>;
    handled(v: T): void;
    remove(v: T): boolean;
    private waitFor;
}
