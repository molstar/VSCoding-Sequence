/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { PrmtopFile } from '../../mol-io/reader/prmtop/parser';
import { Topology } from '../../mol-model/structure/topology/topology';
import { Task } from '../../mol-task';
import { ModelFormat } from '../format';
export { PrmtopFormat };
type PrmtopFormat = ModelFormat<PrmtopFile>;
declare namespace PrmtopFormat {
    function is(x?: ModelFormat): x is PrmtopFormat;
    function fromPrmtop(prmtop: PrmtopFile): PrmtopFormat;
}
export declare function topologyFromPrmtop(prmtop: PrmtopFile): Task<Topology>;
