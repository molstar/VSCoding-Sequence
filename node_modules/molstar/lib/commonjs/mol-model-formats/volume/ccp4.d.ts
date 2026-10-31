/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Volume } from '../../mol-model/volume';
import { Task } from '../../mol-task';
import { Vec3 } from '../../mol-math/linear-algebra';
import { Ccp4File, Ccp4Header } from '../../mol-io/reader/ccp4/schema';
import { ModelFormat } from '../format';
/** When available (e.g. in MRC files) use ORIGIN records instead of N[CRS]START */
export declare function getCcp4Origin(header: Ccp4Header): Vec3;
export declare function volumeFromCcp4(source: Ccp4File, params?: {
    voxelSize?: Vec3;
    offset?: Vec3;
    label?: string;
    entryId?: string;
}): Task<Volume>;
export { Ccp4Format };
type Ccp4Format = ModelFormat<Ccp4File>;
declare namespace Ccp4Format {
    function is(x?: ModelFormat): x is Ccp4Format;
    function create(ccp4: Ccp4File): Ccp4Format;
}
