/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
export interface SimpleBuffer extends Uint8Array {
    readInt8: (offset: number) => number;
    readUInt8: (offset: number) => number;
    writeInt8: (value: number, offset: number) => void;
    writeUInt8: (value: number, offset: number) => void;
    readInt16LE: (offset: number) => number;
    readInt32LE: (offset: number) => number;
    readUInt16LE: (offset: number) => number;
    readUInt32LE: (offset: number) => number;
    readFloatLE: (offset: number) => number;
    readDoubleLE: (offset: number) => number;
    writeInt16LE: (value: number, offset: number) => void;
    writeInt32LE: (value: number, offset: number) => void;
    writeUInt16LE: (value: number, offset: number) => void;
    writeUInt32LE: (value: number, offset: number) => void;
    writeFloatLE: (value: number, offset: number) => void;
    writeDoubleLE: (value: number, offset: number) => void;
    readInt16BE: (offset: number) => number;
    readInt32BE: (offset: number) => number;
    readUInt16BE: (offset: number) => number;
    readUInt32BE: (offset: number) => number;
    readFloatBE: (offset: number) => number;
    readDoubleBE: (offset: number) => number;
    writeInt16BE: (value: number, offset: number) => void;
    writeInt32BE: (value: number, offset: number) => void;
    writeUInt16BE: (value: number, offset: number) => void;
    writeUInt32BE: (value: number, offset: number) => void;
    writeFloatBE: (value: number, offset: number) => void;
    writeDoubleBE: (value: number, offset: number) => void;
    copy: (targetBuffer: Uint8Array, targetStart?: number, sourceStart?: number, sourceEnd?: number) => number;
}
export declare namespace SimpleBuffer {
    function fromUint8Array(array: Uint8Array): SimpleBuffer;
    function fromArrayBuffer(arrayBuffer: ArrayBuffer): SimpleBuffer;
    function fromBuffer(buffer: Buffer): SimpleBuffer;
    const IsNativeEndianLittle: boolean;
    /** source and target can't be the same */
    function flipByteOrder(source: SimpleBuffer, target: Uint8Array, byteCount: number, elementByteSize: number, offset: number): void;
    function flipByteOrderInPlace2(buffer: ArrayBuffer, byteOffset?: number, length?: number): void;
    function ensureLittleEndian(source: SimpleBuffer, target: SimpleBuffer, byteCount: number, elementByteSize: number, offset: number): void;
}
