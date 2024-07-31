/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Task } from '../../../mol-task';
import { ReaderResult as Result } from '../result';
export interface NctrajFile {
    coordinates: number[][];
    velocities?: number[][];
    forces?: number[][];
    cell_lengths?: number[][];
    cell_angles?: number[][];
    time?: number[];
    timeOffset: number;
    deltaTime: number;
}
export declare function parseNctraj(data: Uint8Array): Task<Result<NctrajFile>>;
