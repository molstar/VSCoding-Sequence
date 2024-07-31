/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { FileHandle } from '../../../mol-io/common/file-handle';
import { TypedArrayBufferContext, TypedArrayValueArray, TypedArrayValueType } from '../../../mol-io/common/typed-array';
export interface Header {
    name: string;
    valueType: TypedArrayValueType;
    grid: number[];
    axisOrder: number[];
    extent: number[];
    origin: number[];
    spacegroupNumber: number;
    cellSize: number[];
    cellAngles: number[];
    littleEndian: boolean;
    dataOffset: number;
    originalHeader: unknown;
}
/** Represents a circular buffer for 2 * blockSize layers */
export interface SliceBuffer {
    buffer: TypedArrayBufferContext;
    maxBlockBytes: number;
    sliceCapacity: number;
    slicesRead: number;
    values: TypedArrayValueArray;
    sliceCount: number;
    /** Have all the input slice been read? */
    isFinished: boolean;
}
export interface Data {
    header: Header;
    file: FileHandle;
    slices: SliceBuffer;
}
export interface Provider {
    readHeader: (name: string, file: FileHandle) => Promise<Header>;
    readSlices: (data: Data) => Promise<void>;
}
export interface Context {
    data: Data;
    provider: Provider;
}
export declare function assignSliceBuffer(data: Data, blockSizeInMB: number): void;
export declare function compareHeaders(a: Header, b: Header): boolean;
export type Type = 'ccp4' | 'dsn6';
export declare function getProviderFromType(type: Type): Provider;
export declare function open(name: string, filename: string, type: Type): Promise<Context>;
