"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleBuffer = void 0;
const mol_util_1 = require("../../mol-util");
var SimpleBuffer;
(function (SimpleBuffer) {
    function fromUint8Array(array) {
        const dv = new DataView(array.buffer);
        return Object.assign(array.subarray(0), {
            readInt8: (offset) => dv.getInt8(offset),
            readUInt8: (offset) => dv.getUint8(offset),
            writeInt8: (value, offset) => dv.setInt8(offset, value),
            writeUInt8: (value, offset) => dv.setUint8(offset, value),
            readInt16LE: (offset) => dv.getInt16(offset, true),
            readInt32LE: (offset) => dv.getInt32(offset, true),
            readUInt16LE: (offset) => dv.getUint16(offset, true),
            readUInt32LE: (offset) => dv.getUint32(offset, true),
            readFloatLE: (offset) => dv.getFloat32(offset, true),
            readDoubleLE: (offset) => dv.getFloat64(offset, true),
            writeInt16LE: (value, offset) => dv.setInt16(offset, value, true),
            writeInt32LE: (value, offset) => dv.setInt32(offset, value, true),
            writeUInt16LE: (value, offset) => dv.setUint16(offset, value, true),
            writeUInt32LE: (value, offset) => dv.setUint32(offset, value, true),
            writeFloatLE: (value, offset) => dv.setFloat32(offset, value, true),
            writeDoubleLE: (value, offset) => dv.setFloat64(offset, value, true),
            readInt16BE: (offset) => dv.getInt16(offset, false),
            readInt32BE: (offset) => dv.getInt32(offset, false),
            readUInt16BE: (offset) => dv.getUint16(offset, false),
            readUInt32BE: (offset) => dv.getUint32(offset, false),
            readFloatBE: (offset) => dv.getFloat32(offset, false),
            readDoubleBE: (offset) => dv.getFloat64(offset, false),
            writeInt16BE: (value, offset) => dv.setInt16(offset, value, false),
            writeInt32BE: (value, offset) => dv.setInt32(offset, value, false),
            writeUInt16BE: (value, offset) => dv.setUint16(offset, value, false),
            writeUInt32BE: (value, offset) => dv.setUint32(offset, value, false),
            writeFloatBE: (value, offset) => dv.setFloat32(offset, value, false),
            writeDoubleBE: (value, offset) => dv.setFloat64(offset, value, false),
            copy: (targetBuffer, targetStart, sourceStart, sourceEnd) => {
                targetStart = (0, mol_util_1.defaults)(targetStart, 0);
                sourceStart = (0, mol_util_1.defaults)(sourceStart, 0);
                sourceEnd = (0, mol_util_1.defaults)(sourceEnd, array.length);
                targetBuffer.set(array.subarray(sourceStart, sourceEnd), targetStart);
                return sourceEnd - sourceStart;
            }
        });
    }
    SimpleBuffer.fromUint8Array = fromUint8Array;
    function fromArrayBuffer(arrayBuffer) {
        return fromUint8Array(new Uint8Array(arrayBuffer));
    }
    SimpleBuffer.fromArrayBuffer = fromArrayBuffer;
    function fromBuffer(buffer) {
        return buffer;
    }
    SimpleBuffer.fromBuffer = fromBuffer;
    SimpleBuffer.IsNativeEndianLittle = new Uint16Array(new Uint8Array([0x12, 0x34]).buffer)[0] === 0x3412;
    /** source and target can't be the same */
    function flipByteOrder(source, target, byteCount, elementByteSize, offset) {
        for (let i = 0, n = byteCount; i < n; i += elementByteSize) {
            for (let j = 0; j < elementByteSize; j++) {
                target[offset + i + elementByteSize - j - 1] = source[offset + i + j];
            }
        }
    }
    SimpleBuffer.flipByteOrder = flipByteOrder;
    function flipByteOrderInPlace2(buffer, byteOffset = 0, length) {
        const intView = new Int16Array(buffer, byteOffset, length);
        for (let i = 0, n = intView.length; i < n; ++i) {
            const val = intView[i];
            intView[i] = ((val & 0xff) << 8) | ((val >> 8) & 0xff);
        }
    }
    SimpleBuffer.flipByteOrderInPlace2 = flipByteOrderInPlace2;
    function ensureLittleEndian(source, target, byteCount, elementByteSize, offset) {
        if (SimpleBuffer.IsNativeEndianLittle)
            return;
        if (!byteCount || elementByteSize <= 1)
            return;
        flipByteOrder(source, target, byteCount, elementByteSize, offset);
    }
    SimpleBuffer.ensureLittleEndian = ensureLittleEndian;
})(SimpleBuffer || (exports.SimpleBuffer = SimpleBuffer = {}));
