/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { SdfFileCompound } from '../../mol-io/reader/sdf/parser';
import { Trajectory } from '../../mol-model/structure';
import { Task } from '../../mol-task';
import { ModelFormat } from '../format';
export { SdfFormat };
type SdfFormat = ModelFormat<SdfFileCompound>;
declare namespace SdfFormat {
    function is(x?: ModelFormat): x is SdfFormat;
    function create(mol: SdfFileCompound): SdfFormat;
}
export declare function trajectoryFromSdf(mol: SdfFileCompound): Task<Trajectory>;
