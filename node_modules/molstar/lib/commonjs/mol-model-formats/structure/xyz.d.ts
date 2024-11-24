/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { XyzFile } from '../../mol-io/reader/xyz/parser';
import { Trajectory } from '../../mol-model/structure';
import { Task } from '../../mol-task';
import { ModelFormat } from '../format';
export { XyzFormat };
type XyzFormat = ModelFormat<XyzFile>;
declare namespace XyzFormat {
    function is(x?: ModelFormat): x is XyzFormat;
    function create(mol: XyzFile): XyzFormat;
}
export declare function trajectoryFromXyz(mol: XyzFile): Task<Trajectory>;
