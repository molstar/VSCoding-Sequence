/**
 * Copyright (c) 2017-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { Model } from '../../mol-model/structure/model/model';
import { Task } from '../../mol-task';
import { ModelFormat } from '../format';
import { CifFrame, CifFile } from '../../mol-io/reader/cif';
import { mmCIF_Database } from '../../mol-io/reader/cif/schema/mmcif';
import { Trajectory } from '../../mol-model/structure';
import { CCD_Database } from '../../mol-io/reader/cif/schema/ccd';
export { MmcifFormat };
type MmcifFormat = ModelFormat<MmcifFormat.Data>;
declare namespace MmcifFormat {
    type Data = {
        db: mmCIF_Database;
        frame: CifFrame;
        file?: CifFile;
        /**
         * Original source format. Some formats, including PDB, are converted
         * to mmCIF before further processing.
         */
        source?: ModelFormat;
    };
    function is(x?: ModelFormat): x is MmcifFormat;
    function fromFrame(frame: CifFrame, db?: mmCIF_Database, source?: ModelFormat, file?: CifFile): MmcifFormat;
}
export declare function trajectoryFromMmCIF(frame: CifFrame, file?: CifFile): Task<Trajectory>;
export { CCDFormat };
type CCDFormat = ModelFormat<CCDFormat.Data>;
declare namespace CCDFormat {
    type Data = {
        db: CCD_Database;
        frame: CifFrame;
    };
    type CoordinateType = 'ideal' | 'model';
    const CoordinateType: {
        get(model: Model): CoordinateType | undefined;
        set(model: Model, type: CoordinateType): CoordinateType;
    };
    function is(x?: ModelFormat): x is CCDFormat;
    function fromFrame(frame: CifFrame, db?: CCD_Database): CCDFormat;
}
export declare function trajectoryFromCCD(frame: CifFrame): Task<Trajectory>;
