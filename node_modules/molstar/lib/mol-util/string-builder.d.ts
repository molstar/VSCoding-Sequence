/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted from CIFTools.js (https://github.com/dsehnal/CIFTools.js)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
interface StringBuilder {
    current: string[];
    offset: number;
    capacity: number;
    chunks: string[];
}
declare namespace StringBuilder {
    function create(chunkCapacity?: number): StringBuilder;
    function getString(builder: StringBuilder): string;
    function getSize(builder: StringBuilder): number;
    function getChunks(builder: StringBuilder): string[];
    function newline(builder: StringBuilder): void;
    function whitespace(builder: StringBuilder, len: number): void;
    function whitespace1(builder: StringBuilder): void;
    function write(builder: StringBuilder, val: string): void;
    /** Write without check. */
    function writeSafe(builder: StringBuilder, val: string): void;
    function writePadLeft(builder: StringBuilder, val: string, totalWidth: number): void;
    function writePadRight(builder: StringBuilder, val: string, totalWidth: number): void;
    function writeInteger(builder: StringBuilder, val: number): void;
    function writeIntegerAndSpace(builder: StringBuilder, val: number): void;
    function writeIntegerPadLeft(builder: StringBuilder, val: number, totalWidth: number): void;
    function writeIntegerPadRight(builder: StringBuilder, val: number, totalWidth: number): void;
    /**
     * @example writeFloat(123.2123, 100) -- 2 decim
     */
    function writeFloat(builder: StringBuilder, val: number, precisionMultiplier: number): void;
    function writeFloatPadLeft(builder: StringBuilder, val: number, precisionMultiplier: number, totalWidth: number): void;
    function writeFloatPadRight(builder: StringBuilder, val: number, precisionMultiplier: number, totalWidth: number): void;
}
export { StringBuilder };
