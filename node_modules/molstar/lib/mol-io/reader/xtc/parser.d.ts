/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted from NGL.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Task } from '../../../mol-task';
import { ReaderResult as Result } from '../result';
export interface XtcFile {
    frames: {
        count: number;
        x: Float32Array;
        y: Float32Array;
        z: Float32Array;
    }[];
    boxes: number[][];
    times: number[];
    timeOffset: number;
    deltaTime: number;
}
export declare function parseXtc(data: Uint8Array): Task<Result<XtcFile>>;
