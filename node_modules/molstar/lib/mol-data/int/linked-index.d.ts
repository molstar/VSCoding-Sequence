/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
/** A data structure useful for graph traversal */
interface LinkedIndex {
    readonly head: number;
    has(i: number): boolean;
    remove(i: number): void;
}
declare function LinkedIndex(size: number): LinkedIndex;
export { LinkedIndex };
