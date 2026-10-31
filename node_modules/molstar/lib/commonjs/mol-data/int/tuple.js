"use strict";
/**
 * Copyright (c) 2017-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntTuple = void 0;
const util_1 = require("../util");
var IntTuple;
(function (IntTuple) {
    IntTuple.Zero = 0;
    const { _int32, _float64, _int32_1, _float64_1 } = (function () {
        const data = new ArrayBuffer(8);
        const data_1 = new ArrayBuffer(8);
        return {
            _int32: new Int32Array(data),
            _float64: new Float64Array(data),
            _int32_1: new Int32Array(data_1),
            _float64_1: new Float64Array(data_1)
        };
    }());
    function is(x) {
        return typeof x === 'number';
    }
    IntTuple.is = is;
    function create(fst, snd) {
        _int32[0] = fst;
        _int32[1] = snd;
        return _float64[0];
    }
    IntTuple.create = create;
    /** snd - fst */
    function diff(t) {
        _float64[0] = t;
        return _int32[1] - _int32[0];
    }
    IntTuple.diff = diff;
    function fst(t) {
        _float64[0] = t;
        return _int32[0];
    }
    IntTuple.fst = fst;
    function snd(t) {
        _float64[0] = t;
        return _int32[1];
    }
    IntTuple.snd = snd;
    /** Normal equality does not work, because NaN === NaN ~> false */
    function areEqual(a, b) {
        _float64[0] = a;
        _float64_1[0] = b;
        return _int32[0] === _int32_1[0] && _int32[1] === _int32_1[1];
    }
    IntTuple.areEqual = areEqual;
    function compare(a, b) {
        _float64[0] = a;
        _float64_1[0] = b;
        const x = _int32[0] - _int32_1[0];
        if (x !== 0)
            return x;
        return _int32[1] - _int32_1[1];
    }
    IntTuple.compare = compare;
    function compareInArray(xs, i, j) {
        _float64[0] = xs[i];
        _float64_1[0] = xs[j];
        const x = _int32[0] - _int32_1[0];
        if (x !== 0)
            return x;
        return _int32[1] - _int32_1[1];
    }
    IntTuple.compareInArray = compareInArray;
    function hashCode(t) {
        _float64[0] = t;
        return (0, util_1.hash2)(_int32[0], _int32[1]);
    }
    IntTuple.hashCode = hashCode;
    function toString(t) {
        _float64[0] = t;
        return `(${_int32[0]}, ${_int32[1]})`;
    }
    IntTuple.toString = toString;
})(IntTuple || (exports.IntTuple = IntTuple = {}));
