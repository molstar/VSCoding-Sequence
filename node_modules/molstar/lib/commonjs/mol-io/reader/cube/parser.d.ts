/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted from NGL.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Vec3 } from '../../../mol-math/linear-algebra';
import { Column } from '../../../mol-data/db';
import { Task } from '../../../mol-task';
import { ReaderResult as Result } from '../result';
export interface CubeFile {
    name: string;
    header: CubeFile.Header;
    atoms: CubeFile.Atoms;
    values: Float64Array;
}
export declare namespace CubeFile {
    interface Header {
        orbitals: boolean;
        comment1: string;
        comment2: string;
        atomCount: number;
        origin: Vec3;
        dim: Vec3;
        basisX: Vec3;
        basisY: Vec3;
        basisZ: Vec3;
        dataSetIds: number[];
    }
    interface Atoms {
        count: number;
        number: Column<number>;
        nuclearCharge: Column<number>;
        x: Column<number>;
        y: Column<number>;
        z: Column<number>;
    }
}
export declare function parseCube(data: string, name: string): Task<Result<CubeFile>>;
