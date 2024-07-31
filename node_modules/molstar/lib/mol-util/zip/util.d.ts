/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * ported from https://github.com/photopea/UZIP.js/blob/master/UZIP.js
 * MIT License, Copyright (c) 2018 Photopea
 */
export declare const U: {
    next_code: Uint16Array;
    bl_count: Uint16Array;
    ordr: number[];
    of0: number[];
    exb: number[];
    ldef: Uint16Array;
    df0: number[];
    dxb: number[];
    ddef: Uint32Array;
    flmap: Uint16Array;
    fltree: number[];
    fdmap: Uint16Array;
    fdtree: number[];
    lmap: Uint16Array;
    ltree: number[];
    ttree: number[];
    dmap: Uint16Array;
    dtree: number[];
    imap: Uint16Array;
    itree: number[];
    rev15: Uint16Array;
    lhst: Uint32Array;
    dhst: Uint32Array;
    ihst: Uint32Array;
    lits: Uint32Array;
    strt: Uint16Array;
    prev: Uint16Array;
};
export declare function codes2map(tree: number[], MAX_BITS: number, map: Uint16Array): void;
export declare function makeCodes(tree: number[], MAX_BITS: number): void;
export declare function revCodes(tree: number[], MAX_BITS: number): void;
