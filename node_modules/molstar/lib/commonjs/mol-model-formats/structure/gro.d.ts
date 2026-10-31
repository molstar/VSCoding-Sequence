/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Task } from '../../mol-task';
import { ModelFormat } from '../format';
import { GroFile } from '../../mol-io/reader/gro/schema';
import { Trajectory } from '../../mol-model/structure';
export { GroFormat };
type GroFormat = ModelFormat<GroFile>;
declare namespace GroFormat {
    function is(x?: ModelFormat): x is GroFormat;
    function fromGro(gro: GroFile): GroFormat;
}
export declare function trajectoryFromGRO(gro: GroFile): Task<Trajectory>;
