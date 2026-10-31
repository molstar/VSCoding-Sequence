/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Task } from '../../../mol-task';
import { Ccp4File, Ccp4Header } from './schema';
import { ReaderResult as Result } from '../result';
import { FileHandle } from '../../common/file-handle';
import { TypedArrayValueType, TypedArrayBufferContext } from '../../../mol-io/common/typed-array';
export declare function readCcp4Header(file: FileHandle): Promise<{
    header: Ccp4Header;
    littleEndian: boolean;
}>;
export declare function readCcp4Slices(header: Ccp4Header, buffer: TypedArrayBufferContext, file: FileHandle, byteOffset: number, length: number, littleEndian: boolean): Promise<void>;
export declare function getCcp4ValueType(header: Ccp4Header): TypedArrayValueType;
export declare function getCcp4DataOffset(header: Ccp4Header): number;
export declare function parseFile(file: FileHandle, size: number): Task<Result<Ccp4File>>;
export declare function parse(buffer: Uint8Array, name: string): Task<Result<Ccp4File>>;
