/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ReaderResult as Result } from '../result';
import { Task } from '../../../mol-task';
import { FiniteArray } from '../../../mol-util/type-helpers';
export interface DcdHeader {
    readonly NSET: number;
    readonly ISTART: number;
    readonly NSAVC: number;
    readonly NAMNF: number;
    readonly DELTA: number;
    readonly TITLE: string;
    readonly NATOM: number;
}
export interface DcdFrame {
    readonly elementCount: number;
    readonly x: ArrayLike<number>;
    readonly y: ArrayLike<number>;
    readonly z: ArrayLike<number>;
    readonly cell?: FiniteArray<number, 6>;
}
export interface DcdFile {
    readonly header: DcdHeader;
    readonly frames: DcdFrame[];
}
export declare function _parseDcd(data: Uint8Array): DcdFile;
export declare function parseDcd(data: Uint8Array): Task<Result<DcdFile>>;
