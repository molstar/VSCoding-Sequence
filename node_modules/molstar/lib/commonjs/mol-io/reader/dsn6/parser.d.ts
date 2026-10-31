/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Task } from '../../../mol-task';
import { Dsn6File, Dsn6Header } from './schema';
import { ReaderResult as Result } from '../result';
import { FileHandle } from '../../common/file-handle';
export declare const dsn6HeaderSize = 512;
export declare function readDsn6Header(file: FileHandle): Promise<{
    header: Dsn6Header;
    littleEndian: boolean;
}>;
export declare function parseDsn6Values(header: Dsn6Header, source: Uint8Array, target: Float32Array, littleEndian: boolean): Promise<void>;
export declare function getDsn6Counts(header: Dsn6Header): {
    count: number;
    byteCount: number;
    valueCount: number;
};
export declare function parseFile(file: FileHandle, size: number): Task<Result<Dsn6File>>;
export declare function parse(buffer: Uint8Array, name: string): Task<Result<Dsn6File>>;
