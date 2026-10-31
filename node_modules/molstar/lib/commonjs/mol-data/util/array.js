"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * from https://github.com/dsehnal/CIFTools.js
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayFind = arrayFind;
exports.iterableToArray = iterableToArray;
exports.createRangeArray = createRangeArray;
exports.arrayPickIndices = arrayPickIndices;
exports.arrayGetCtor = arrayGetCtor;
function arrayFind(array, f) {
    for (let i = 0, _i = array.length; i < _i; i++) {
        if (f(array[i]))
            return array[i];
    }
    return void 0;
}
function iterableToArray(it) {
    if (Array.from)
        return Array.from(it);
    const ret = [];
    while (true) {
        const { done, value } = it.next();
        if (done)
            break;
        ret[ret.length] = value;
    }
    return ret;
}
/** Fills the array so that array[0] = start and array[array.length - 1] = end */
function createRangeArray(start, end, ctor) {
    const len = end - start + 1;
    const array = ctor ? new ctor(len) : new Int32Array(len);
    for (let i = 0; i < len; i++) {
        array[i] = i + start;
    }
    return array;
}
function arrayPickIndices(array, indices) {
    const ret = new (arrayGetCtor(array))(indices.length);
    for (let i = 0, _i = indices.length; i < _i; i++) {
        ret[i] = array[indices[i]];
    }
    return ret;
}
function arrayGetCtor(data) {
    const ret = data.constructor;
    if (!ret)
        throw new Error('data does not define a constructor and it should');
    return ret;
}
