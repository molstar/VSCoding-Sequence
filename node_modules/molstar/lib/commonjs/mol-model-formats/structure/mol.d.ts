/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Panagiotis Tourlas <panagiot_tourlov@hotmail.com>
 */
import { MolFile } from '../../mol-io/reader/mol/parser';
import { RuntimeContext, Task } from '../../mol-task';
import { ModelFormat } from '../format';
import { Trajectory } from '../../mol-model/structure';
export declare function getMolModels(mol: MolFile, format: ModelFormat<any> | undefined, ctx: RuntimeContext): Promise<import("../../mol-model/structure").ArrayTrajectory>;
export { MolFormat };
type MolFormat = ModelFormat<MolFile>;
declare namespace MolFormat {
    function is(x?: ModelFormat): x is MolFormat;
    function create(mol: MolFile): MolFormat;
}
export declare function trajectoryFromMol(mol: MolFile): Task<Trajectory>;
