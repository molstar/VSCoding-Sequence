/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Taken/adapted from DensityServer (https://github.com/dsehnal/DensityServer)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { SimpleBuffer } from '../../mol-io/common/simple-buffer';
export var TypedArrayValueType;
(function (TypedArrayValueType) {
    TypedArrayValueType.Float32 = 'float32';
    TypedArrayValueType.Int8 = 'int8';
    TypedArrayValueType.Int16 = 'int16';
    TypedArrayValueType.Uint16 = 'uint16';
})(TypedArrayValueType || (TypedArrayValueType = {}));
export function getElementByteSize(type) {
    if (type === TypedArrayValueType.Float32)
        return 4;
    if (type === TypedArrayValueType.Int16)
        return 2;
    if (type === TypedArrayValueType.Uint16)
        return 2;
    return 1;
}
export function makeTypedArray(type, buffer, byteOffset = 0, length) {
    if (type === TypedArrayValueType.Float32)
        return new Float32Array(buffer, byteOffset, length);
    if (type === TypedArrayValueType.Int16)
        return new Int16Array(buffer, byteOffset, length);
    if (type === TypedArrayValueType.Uint16)
        return new Uint16Array(buffer, byteOffset, length);
    return new Int8Array(buffer, byteOffset, length);
}
export function createTypedArray(type, size) {
    switch (type) {
        case TypedArrayValueType.Float32: return new Float32Array(new ArrayBuffer(4 * size));
        case TypedArrayValueType.Int8: return new Int8Array(new ArrayBuffer(1 * size));
        case TypedArrayValueType.Int16: return new Int16Array(new ArrayBuffer(2 * size));
        case TypedArrayValueType.Uint16: return new Uint16Array(new ArrayBuffer(2 * size));
    }
    throw Error(`${type} is not a supported value format.`);
}
export function createTypedArrayBufferContext(size, type) {
    const elementByteSize = getElementByteSize(type);
    const arrayBuffer = new ArrayBuffer(elementByteSize * size);
    const readBuffer = SimpleBuffer.fromArrayBuffer(arrayBuffer);
    const valuesBuffer = SimpleBuffer.IsNativeEndianLittle ? arrayBuffer : new ArrayBuffer(elementByteSize * size);
    return {
        type,
        elementByteSize,
        readBuffer,
        valuesBuffer: new Uint8Array(valuesBuffer),
        values: makeTypedArray(type, valuesBuffer)
    };
}
export async function readTypedArray(ctx, file, position, byteCount, valueByteOffset, littleEndian) {
    await file.readBuffer(position, ctx.readBuffer, byteCount, valueByteOffset);
    if (ctx.elementByteSize > 1 && ((littleEndian !== void 0 && littleEndian !== SimpleBuffer.IsNativeEndianLittle) || !SimpleBuffer.IsNativeEndianLittle)) {
        // fix the endian
        SimpleBuffer.flipByteOrder(ctx.readBuffer, ctx.valuesBuffer, byteCount, ctx.elementByteSize, valueByteOffset);
    }
    return ctx.values;
}
