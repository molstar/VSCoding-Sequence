/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * from https://github.com/dsehnal/CIFTools.js
 * @author David Sehnal <david.sehnal@gmail.com>
 */
/**
 * A generic chunked array builder.
 *
 * When adding elements, the array grows by a specified number
 * of elements and no copying is done until ChunkedArray.compact
 * is called.
 */
interface ChunkedArray<T, C extends 1 | 2 | 3 | 4 = 1> {
    ctor: {
        new (size: number): ArrayLike<T>;
    };
    elementSize: C;
    growBy: number;
    allocatedSize: number;
    /** current size of the array */
    elementCount: number;
    currentSize: number;
    currentChunk: any;
    currentIndex: number;
    chunks: any[][];
}
declare namespace ChunkedArray {
    type Sizes = 1 | 2 | 3 | 4;
    export function is(x: any): x is ChunkedArray<any>;
    export function add4<T>(array: ChunkedArray<T, 4>, x: T, y: T, z: T, w: T): number;
    export function add3<T>(array: ChunkedArray<T, 3>, x: T, y: T, z: T): number;
    export function add2<T>(array: ChunkedArray<T, 2>, x: T, y: T): number;
    export function add<T>(array: ChunkedArray<T, 1>, x: T): number;
    export function addRepeat<T>(array: ChunkedArray<T, 1>, n: number, x: T): number;
    export function addMany<T>(array: ChunkedArray<T, any>, data: ArrayLike<T>): number;
    /** If doNotResizeSingleton = true and the data fit into a single chunk, do not resize it. */
    export function compact<T>(array: ChunkedArray<T, any>, doNotResizeSingleton?: boolean): ArrayLike<T>;
    export function _compact<T>(array: ChunkedArray<T, any>, doNotResizeSingleton: boolean): ArrayLike<T>;
    /**
     * The size of the initial chunk is elementSize * initialCount.
     * Use the provided array as the initial chunk. The size of the array must be divisible by the elementSize.
     */
    export function create<T, C extends Sizes = 1>(ctor: {
        new (size: number): ArrayLike<T>;
    }, elementSize: C, chunkSize: number, initialChunkOrCount?: number | ArrayLike<T>): ChunkedArray<T, C>;
    export {};
}
export { ChunkedArray };
