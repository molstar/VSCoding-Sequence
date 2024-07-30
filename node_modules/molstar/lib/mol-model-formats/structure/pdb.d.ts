/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { PdbFile } from '../../mol-io/reader/pdb/schema';
import { Task } from '../../mol-task';
import { Trajectory } from '../../mol-model/structure';
import { ModelFormat } from '../format';
export { PdbFormat };
type PdbFormat = ModelFormat<PdbFile>;
declare namespace PdbFormat {
    function is(x?: ModelFormat): x is PdbFormat;
    function create(pdb: PdbFile): PdbFormat;
}
export declare function trajectoryFromPDB(pdb: PdbFile): Task<Trajectory>;
