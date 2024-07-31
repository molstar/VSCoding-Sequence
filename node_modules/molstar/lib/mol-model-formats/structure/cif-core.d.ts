/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Task } from '../../mol-task';
import { ModelFormat } from '../format';
import { CifCore_Database } from '../../mol-io/reader/cif/schema/cif-core';
import { CifFrame } from '../../mol-io/reader/cif';
import { Trajectory } from '../../mol-model/structure';
export { CifCoreFormat };
type CifCoreFormat = ModelFormat<CifCoreFormat.Data>;
declare namespace CifCoreFormat {
    type Data = {
        db: CifCore_Database;
        frame: CifFrame;
    };
    function is(x?: ModelFormat): x is CifCoreFormat;
    function fromFrame(frame: CifFrame, db?: CifCore_Database): CifCoreFormat;
}
export declare function trajectoryFromCifCore(frame: CifFrame): Task<Trajectory>;
