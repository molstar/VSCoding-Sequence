/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Volume } from '../../mol-model/volume';
import { Task } from '../../mol-task';
import { Vec3 } from '../../mol-math/linear-algebra';
import { Dsn6File } from '../../mol-io/reader/dsn6/schema';
import { ModelFormat } from '../format';
export declare function volumeFromDsn6(source: Dsn6File, params?: {
    voxelSize?: Vec3;
    label?: string;
    entryId?: string;
}): Task<Volume>;
export { Dsn6Format };
type Dsn6Format = ModelFormat<Dsn6File>;
declare namespace Dsn6Format {
    function is(x?: ModelFormat): x is Dsn6Format;
    function create(dsn6: Dsn6File): Dsn6Format;
}
