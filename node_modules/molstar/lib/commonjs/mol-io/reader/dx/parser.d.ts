/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted from NGL.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Vec3 } from '../../../mol-math/linear-algebra';
import { Task } from '../../../mol-task';
import { ReaderResult as Result } from '../result';
export interface DxFile {
    name: string;
    header: DxFile.Header;
    values: Float64Array;
}
export declare namespace DxFile {
    interface Header {
        dim: Vec3;
        min: Vec3;
        h: Vec3;
    }
}
export declare function parseDx(data: string | Uint8Array, name: string): Task<Result<DxFile>>;
