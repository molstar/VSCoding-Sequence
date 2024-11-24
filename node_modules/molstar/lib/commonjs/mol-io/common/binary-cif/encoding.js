"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * From CIFTools.js
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Encoding = exports.VERSION = void 0;
exports.VERSION = '0.3.0';
var Encoding;
(function (Encoding) {
    let IntDataType;
    (function (IntDataType) {
        IntDataType[IntDataType["Int8"] = 1] = "Int8";
        IntDataType[IntDataType["Int16"] = 2] = "Int16";
        IntDataType[IntDataType["Int32"] = 3] = "Int32";
        IntDataType[IntDataType["Uint8"] = 4] = "Uint8";
        IntDataType[IntDataType["Uint16"] = 5] = "Uint16";
        IntDataType[IntDataType["Uint32"] = 6] = "Uint32";
    })(IntDataType = Encoding.IntDataType || (Encoding.IntDataType = {}));
    let FloatDataType;
    (function (FloatDataType) {
        FloatDataType[FloatDataType["Float32"] = 32] = "Float32";
        FloatDataType[FloatDataType["Float64"] = 33] = "Float64";
    })(FloatDataType = Encoding.FloatDataType || (Encoding.FloatDataType = {}));
    function getDataType(data) {
        let srcType;
        if (data instanceof Int8Array)
            srcType = Encoding.IntDataType.Int8;
        else if (data instanceof Int16Array)
            srcType = Encoding.IntDataType.Int16;
        else if (data instanceof Int32Array)
            srcType = Encoding.IntDataType.Int32;
        else if (data instanceof Uint8Array)
            srcType = Encoding.IntDataType.Uint8;
        else if (data instanceof Uint16Array)
            srcType = Encoding.IntDataType.Uint16;
        else if (data instanceof Uint32Array)
            srcType = Encoding.IntDataType.Uint32;
        else if (data instanceof Float32Array)
            srcType = Encoding.FloatDataType.Float32;
        else if (data instanceof Float64Array)
            srcType = Encoding.FloatDataType.Float64;
        else
            srcType = Encoding.IntDataType.Int32; // throw new Error('Unsupported integer data type.');
        return srcType;
    }
    Encoding.getDataType = getDataType;
    function isSignedIntegerDataType(data) {
        if (data instanceof Int8Array || data instanceof Int16Array || data instanceof Int32Array)
            return true;
        for (let i = 0, _i = data.length; i < _i; i++) {
            if (i < 0)
                return false;
        }
        return true;
    }
    Encoding.isSignedIntegerDataType = isSignedIntegerDataType;
})(Encoding || (exports.Encoding = Encoding = {}));
