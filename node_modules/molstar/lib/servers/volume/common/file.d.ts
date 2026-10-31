/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Taken/adapted from DensityServer (https://github.com/dsehnal/DensityServer)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { FileHandle } from '../../../mol-io/common/file-handle';
export declare function openRead(filename: string): Promise<number>;
export declare function exists(filename: string): boolean;
export declare function createFile(filename: string): Promise<number>;
export declare function writeInt(file: FileHandle, value: number, position: number): Promise<void>;
