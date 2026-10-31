/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Taken/adapted from DensityServer (https://github.com/dsehnal/DensityServer)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { FileHandle } from '../../mol-io/common/file-handle';
import { SimpleBuffer } from '../../mol-io/common/simple-buffer';
export type TypedArrayValueType = 'float32' | 'int8' | 'int16' | 'uint16';
export declare namespace TypedArrayValueType {
    const Float32: TypedArrayValueType;
    const Int8: TypedArrayValueType;
    const Int16: TypedArrayValueType;
    const Uint16: TypedArrayValueType;
}
export type TypedArrayValueArray = Float32Array | Int8Array | Int16Array | Uint16Array;
export interface TypedArrayBufferContext {
    type: TypedArrayValueType;
    elementByteSize: number;
    readBuffer: SimpleBuffer;
    valuesBuffer: Uint8Array;
    values: TypedArrayValueArray;
}
export declare function getElementByteSize(type: TypedArrayValueType): 1 | 2 | 4;
export declare function makeTypedArray(type: TypedArrayValueType, buffer: ArrayBuffer, byteOffset?: number, length?: number): TypedArrayValueArray;
export declare function createTypedArray(type: TypedArrayValueType, size: number): Int8Array | Int16Array | Uint16Array | Float32Array;
export declare function createTypedArrayBufferContext(size: number, type: TypedArrayValueType): TypedArrayBufferContext;
export declare function readTypedArray(ctx: TypedArrayBufferContext, file: FileHandle, position: number, byteCount: number, valueByteOffset: number, littleEndian?: boolean): Promise<TypedArrayValueArray>;
