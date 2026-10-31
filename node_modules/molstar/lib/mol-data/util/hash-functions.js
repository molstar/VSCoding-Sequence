/**
 * Copyright (c) 2017-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
// from http://burtleburtle.net/bob/hash/integer.html
export function hash1(i) {
    let a = i ^ (i >> 4);
    a = (a ^ 0xdeadbeef) + (a << 5);
    a = a ^ (a >> 11);
    return a;
}
export function hash2(i, j) {
    let a = 23;
    a = (31 * a + i) | 0;
    a = (31 * a + j) | 0;
    a = a ^ (a >> 4);
    a = (a ^ 0xdeadbeef) + (a << 5);
    a = a ^ (a >> 11);
    return a;
}
export function hash3(i, j, k) {
    let a = 23;
    a = (31 * a + i) | 0;
    a = (31 * a + j) | 0;
    a = (31 * a + k) | 0;
    a = a ^ (a >> 4);
    a = (a ^ 0xdeadbeef) + (a << 5);
    a = a ^ (a >> 11);
    return a;
}
export function hash4(i, j, k, l) {
    let a = 23;
    a = (31 * a + i) | 0;
    a = (31 * a + j) | 0;
    a = (31 * a + k) | 0;
    a = (31 * a + l) | 0;
    a = a ^ (a >> 4);
    a = (a ^ 0xdeadbeef) + (a << 5);
    a = a ^ (a >> 11);
    return a;
}
export function hashString(s) {
    let h = 0;
    for (let i = 0, l = s.length; i < l; i++) {
        h = (h << 5) - h + s.charCodeAt(i) | 0;
    }
    return h;
}
/**
 * A unique number for each pair of integers
 * Biggest representable pair is (67108863, 67108863) (limit imposed by Number.MAX_SAFE_INTEGER)
 */
export function cantorPairing(a, b) {
    return (a + b) * (a + b + 1) / 2 + b;
}
/**
 * A unique number for each sorted pair of integers
 * Biggest representable pair is (67108863, 67108863) (limit imposed by Number.MAX_SAFE_INTEGER)
 */
export function sortedCantorPairing(a, b) {
    return a < b ? cantorPairing(a, b) : cantorPairing(b, a);
}
export function invertCantorPairing(out, z) {
    const w = Math.floor((Math.sqrt(8 * z + 1) - 1) / 2);
    const t = (w * w + w) / 2;
    const y = z - t;
    out[0] = w - y;
    out[1] = y;
    return out;
}
/**
 * 32 bit FNV-1a hash, see http://isthe.com/chongo/tech/comp/fnv/
 */
export function hashFnv32a(array) {
    let hval = 0x811c9dc5;
    for (let i = 0, il = array.length; i < il; ++i) {
        hval ^= array[i];
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    return hval >>> 0;
}
