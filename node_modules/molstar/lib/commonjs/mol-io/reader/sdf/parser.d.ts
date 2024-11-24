/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Jason Pattle <jpattle@exscientia.co.uk>
 * @author Panagiotis Tourlas <panagiot_tourlov@hotmail.com>
 */
import { Column } from '../../../mol-data/db';
import { MolFile } from '../mol/parser';
import { Task } from '../../../mol-task';
import { ReaderResult as Result } from '../result';
/** http://c4.cabrillo.edu/404/ctfile.pdf - page 41 & 79 */
export interface SdfFileCompound {
    readonly molFile: MolFile;
    readonly dataItems: {
        readonly dataHeader: Column<string>;
        readonly data: Column<string>;
    };
}
export interface SdfFile {
    readonly compounds: SdfFileCompound[];
}
export declare function parseSdf(data: string): Task<Result<SdfFile>>;
