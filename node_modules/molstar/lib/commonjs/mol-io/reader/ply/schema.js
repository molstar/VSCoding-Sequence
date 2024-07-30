"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlyTypes = exports.PlyTypeByteLength = void 0;
exports.PlyType = PlyType;
exports.PlyFile = PlyFile;
// http://paulbourke.net/dataformats/ply/
// https://en.wikipedia.org/wiki/PLY_(file_format)
exports.PlyTypeByteLength = {
    'char': 1,
    'uchar': 1,
    'short': 2,
    'ushort': 2,
    'int': 4,
    'uint': 4,
    'float': 4,
    'double': 8,
    'int8': 1,
    'uint8': 1,
    'int16': 2,
    'uint16': 2,
    'int32': 4,
    'uint32': 4,
    'float32': 4,
    'float64': 8
};
exports.PlyTypes = new Set(Object.keys(exports.PlyTypeByteLength));
function PlyType(str) {
    if (!exports.PlyTypes.has(str))
        throw new Error(`unknown ply type '${str}'`);
    return str;
}
function PlyFile(elements, elementNames, comments) {
    const elementMap = new Map();
    for (let i = 0, il = elementNames.length; i < il; ++i) {
        elementMap.set(elementNames[i], elements[i]);
    }
    return {
        comments,
        elementNames,
        getElement: (name) => {
            return elementMap.get(name);
        }
    };
}
