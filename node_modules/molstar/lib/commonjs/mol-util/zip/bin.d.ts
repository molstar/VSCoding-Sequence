/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * ported from https://github.com/photopea/UZIP.js/blob/master/UZIP.js
 * MIT License, Copyright (c) 2018 Photopea
 */
export declare function toUint32(x: number): number;
export declare function toInt32(x: number): number;
export declare function readUshort(buff: Uint8Array, p: number): number;
export declare function writeUshort(buff: Uint8Array, p: number, n: number): void;
export declare function readUint(buff: Uint8Array, p: number): number;
export declare function writeUint(buff: Uint8Array, p: number, n: number): void;
export declare function readUTF8(buff: Uint8Array, p: number, l: number): string;
export declare function writeUTF8(buff: Uint8Array, p: number, str: string): number;
export declare function sizeUTF8(str: string): number;
