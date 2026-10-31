/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * from https://github.com/dsehnal/CIFTools.js
 * @author David Sehnal <david.sehnal@gmail.com>
 */
var ChunkedArray;
(function (ChunkedArray) {
    function is(x) {
        return x.creator && x.chunkSize;
    }
    ChunkedArray.is = is;
    function allocateNext(array) {
        const nextSize = array.growBy * array.elementSize;
        array.currentSize = nextSize;
        array.currentIndex = 0;
        array.currentChunk = new array.ctor(nextSize);
        array.allocatedSize += nextSize;
        array.chunks[array.chunks.length] = array.currentChunk;
    }
    function add4(array, x, y, z, w) {
        if (array.currentIndex >= array.currentSize)
            allocateNext(array);
        const c = array.currentChunk;
        const i = array.currentIndex;
        c[i] = x;
        c[i + 1] = y;
        c[i + 2] = z;
        c[i + 3] = w;
        array.currentIndex += 4;
        return array.elementCount++;
    }
    ChunkedArray.add4 = add4;
    function add3(array, x, y, z) {
        if (array.currentIndex >= array.currentSize)
            allocateNext(array);
        const c = array.currentChunk;
        const i = array.currentIndex;
        c[i] = x;
        c[i + 1] = y;
        c[i + 2] = z;
        array.currentIndex += 3;
        return array.elementCount++;
    }
    ChunkedArray.add3 = add3;
    function add2(array, x, y) {
        if (array.currentIndex >= array.currentSize)
            allocateNext(array);
        const c = array.currentChunk;
        const i = array.currentIndex;
        c[i] = x;
        c[i + 1] = y;
        array.currentIndex += 2;
        return array.elementCount++;
    }
    ChunkedArray.add2 = add2;
    function add(array, x) {
        if (array.currentIndex >= array.currentSize)
            allocateNext(array);
        array.currentChunk[array.currentIndex] = x;
        array.currentIndex += 1;
        return array.elementCount++;
    }
    ChunkedArray.add = add;
    function addRepeat(array, n, x) {
        for (let i = 0; i < n; i++) {
            if (array.currentIndex >= array.currentSize)
                allocateNext(array);
            array.currentChunk[array.currentIndex++] = x;
            array.elementCount++;
        }
        return array.elementCount;
    }
    ChunkedArray.addRepeat = addRepeat;
    function addMany(array, data) {
        const { elementSize } = array;
        for (let i = 0, _i = data.length; i < _i; i += elementSize) {
            if (array.currentIndex >= array.currentSize)
                allocateNext(array);
            const { currentChunk } = array;
            for (let j = 0; j < elementSize; j++) {
                currentChunk[array.currentIndex++] = data[i + j];
            }
            array.elementCount++;
        }
        return array.elementCount;
    }
    ChunkedArray.addMany = addMany;
    /** If doNotResizeSingleton = true and the data fit into a single chunk, do not resize it. */
    function compact(array, doNotResizeSingleton = false) {
        return _compact(array, doNotResizeSingleton);
    }
    ChunkedArray.compact = compact;
    function _compact(array, doNotResizeSingleton) {
        const { ctor, chunks, currentIndex } = array;
        if (!chunks.length)
            return new ctor(0);
        if (chunks.length === 1) {
            if (doNotResizeSingleton || currentIndex === array.allocatedSize) {
                return chunks[0];
            }
        }
        let size = 0;
        for (let i = 0, _i = chunks.length - 1; i < _i; i++)
            size += chunks[i].length;
        size += array.currentIndex;
        const ret = new ctor(size);
        let offset = 0;
        if (ret.buffer) {
            for (let i = 0, _i = chunks.length - 1; i < _i; i++) {
                ret.set(chunks[i], offset);
                offset += chunks[i].length;
            }
        }
        else {
            for (let i = 0, _i = chunks.length - 1; i < _i; i++) {
                const chunk = chunks[i];
                for (let j = 0, _j = chunk.length; j < _j; j++)
                    ret[offset + j] = chunk[j];
                offset += chunk.length;
            }
        }
        const lastChunk = chunks[chunks.length - 1];
        if (ret.buffer && currentIndex >= array.currentSize) {
            ret.set(lastChunk, offset);
        }
        else {
            for (let j = 0, _j = lastChunk.length; j < _j; j++)
                ret[offset + j] = lastChunk[j];
        }
        return ret;
    }
    ChunkedArray._compact = _compact;
    /**
     * The size of the initial chunk is elementSize * initialCount.
     * Use the provided array as the initial chunk. The size of the array must be divisible by the elementSize.
     */
    function create(ctor, elementSize, chunkSize, initialChunkOrCount) {
        const ret = {
            ctor,
            elementSize,
            growBy: Math.max(1, Math.ceil(chunkSize)),
            allocatedSize: 0,
            elementCount: 0,
            currentSize: 0,
            currentChunk: void 0,
            currentIndex: 0,
            chunks: []
        };
        if (typeof initialChunkOrCount === 'undefined')
            return ret;
        if (typeof initialChunkOrCount === 'number') {
            ret.currentChunk = new ctor(initialChunkOrCount * elementSize);
            ret.allocatedSize = initialChunkOrCount * elementSize;
            ret.currentSize = ret.currentChunk.length;
            ret.chunks[0] = ret.currentChunk;
            return ret;
        }
        const initialChunk = initialChunkOrCount;
        if (initialChunk.length % elementSize !== 0)
            throw new Error('initialChunk length must be a multiple of the element size.');
        ret.currentChunk = initialChunk;
        ret.allocatedSize = initialChunk.length;
        ret.currentSize = initialChunk.length;
        ret.chunks[0] = initialChunk;
        return ret;
    }
    ChunkedArray.create = create;
})(ChunkedArray || (ChunkedArray = {}));
export { ChunkedArray };
