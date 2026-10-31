/**
 * Copyright (c) 2017-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export declare function hash1(i: number): number;
export declare function hash2(i: number, j: number): number;
export declare function hash3(i: number, j: number, k: number): number;
export declare function hash4(i: number, j: number, k: number, l: number): number;
export declare function hashString(s: string): number;
/**
 * A unique number for each pair of integers
 * Biggest representable pair is (67108863, 67108863) (limit imposed by Number.MAX_SAFE_INTEGER)
 */
export declare function cantorPairing(a: number, b: number): number;
/**
 * A unique number for each sorted pair of integers
 * Biggest representable pair is (67108863, 67108863) (limit imposed by Number.MAX_SAFE_INTEGER)
 */
export declare function sortedCantorPairing(a: number, b: number): number;
export declare function invertCantorPairing(out: [number, number], z: number): [number, number];
/**
 * 32 bit FNV-1a hash, see http://isthe.com/chongo/tech/comp/fnv/
 */
export declare function hashFnv32a(array: ArrayLike<number>): number;
