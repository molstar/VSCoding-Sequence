"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * ported from https://github.com/photopea/UZIP.js/blob/master/UZIP.js
 * MIT License, Copyright (c) 2018 Photopea
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.crc = crc;
exports.adler = adler;
const CrcTable = (function () {
    const tab = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) {
            if (c & 1)
                c = 0xedb88320 ^ (c >>> 1);
            else
                c = c >>> 1;
        }
        tab[n] = c;
    }
    return tab;
})();
function _crc(c, buf, off, len) {
    for (let i = 0; i < len; i++) {
        c = CrcTable[(c ^ buf[off + i]) & 0xff] ^ (c >>> 8);
    }
    return c;
}
function crc(b, o, l) {
    return _crc(0xffffffff, b, o, l) ^ 0xffffffff;
}
function adler(data, o, len) {
    let a = 1, b = 0;
    let off = o;
    const end = o + len;
    while (off < end) {
        const eend = Math.min(off + 5552, end);
        while (off < eend) {
            a += data[off++];
            b += a;
        }
        a = a % 65521;
        b = b % 65521;
    }
    return (b << 16) | a;
}
