"use strict";
/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMantissaMultiplier = getMantissaMultiplier;
exports.integerDigitCount = integerDigitCount;
exports.getArrayDigitCount = getArrayDigitCount;
exports.isInteger = isInteger;
exports.getPrecision = getPrecision;
exports.toPrecision = toPrecision;
exports.toFixed = toFixed;
/**
 * Determine the number of digits in a floating point number
 * Find a number M such that round(M * v) - M * v <= delta.
 * If no such M exists, return -1.
 */
function getMantissaMultiplier(v, maxDigits, delta) {
    let m = 1, i;
    for (i = 0; i < maxDigits; i++) {
        const mv = m * v;
        if (Math.abs(Math.round(mv) - mv) <= delta)
            return i;
        m *= 10;
    }
    return -1;
}
function integerDigitCount(v, delta) {
    const f = Math.abs(v);
    if (f < delta)
        return 0;
    return Math.floor(Math.log10(Math.abs(v))) + 1;
}
/**
 * Determine the maximum number of digits in a floating point array.
 * Find a number M such that round(M * v) - M * v <= delta.
 * If no such M exists, return -1.
 */
function getArrayDigitCount(xs, maxDigits, delta) {
    let mantissaDigits = 1;
    let integerDigits = 0;
    for (let i = 0, _i = xs.length; i < _i; i++) {
        if (mantissaDigits >= 0) {
            const t = getMantissaMultiplier(xs[i], maxDigits, delta);
            if (t < 0)
                mantissaDigits = -1;
            else if (t > mantissaDigits)
                mantissaDigits = t;
        }
        const abs = Math.abs(xs[i]);
        if (abs > delta) {
            const d = Math.floor(Math.log10(Math.abs(abs))) + 1;
            if (d > integerDigits)
                integerDigits = d;
        }
    }
    return { mantissaDigits, integerDigits };
}
function isInteger(s) {
    s = s.trim();
    const n = parseInt(s, 10);
    return isNaN(n) ? false : n.toString() === s;
}
function getPrecision(v) {
    if (!isFinite(v))
        return 0;
    let e = 1;
    let p = 0;
    while (Math.round(v * e) / e !== v) {
        e *= 10;
        ++p;
    }
    return p;
}
function toPrecision(v, precision) {
    return parseFloat(v.toPrecision(precision));
}
function toFixed(v, fractionDigits) {
    return parseFloat(v.toFixed(fractionDigits));
}
