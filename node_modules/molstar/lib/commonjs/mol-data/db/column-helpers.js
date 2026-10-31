"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArrayBounds = getArrayBounds;
exports.createArray = createArray;
exports.fillArrayValues = fillArrayValues;
exports.createAndFillArray = createAndFillArray;
exports.isTypedArray = isTypedArray;
exports.typedArrayWindow = typedArrayWindow;
function getArrayBounds(rowCount, params) {
    const start = params && typeof params.start !== 'undefined' ? Math.max(Math.min(params.start, rowCount - 1), 0) : 0;
    const end = params && typeof params.end !== 'undefined' ? Math.min(params.end, rowCount) : rowCount;
    return { start, end };
}
function createArray(rowCount, params) {
    const c = params && typeof params.array !== 'undefined' ? params.array : Array;
    const { start, end } = getArrayBounds(rowCount, params);
    return { array: new c(end - start), start, end };
}
function fillArrayValues(value, target, start) {
    for (let i = 0, _e = target.length; i < _e; i++)
        target[i] = value(start + i);
    return target;
}
function createAndFillArray(rowCount, value, params) {
    const { array, start } = createArray(rowCount, params);
    return fillArrayValues(value, array, start);
}
function isTypedArray(data) {
    return !!data.buffer && typeof data.byteLength === 'number' && typeof data.BYTES_PER_ELEMENT === 'number';
}
function typedArrayWindow(data, params) {
    const { constructor, buffer, length, byteOffset, BYTES_PER_ELEMENT } = data;
    const { start, end } = getArrayBounds(length, params);
    if (start === 0 && end === length)
        return data;
    return new constructor(buffer, byteOffset + BYTES_PER_ELEMENT * start, Math.min(length, end - start));
}
