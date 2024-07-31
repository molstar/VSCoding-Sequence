/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { PsfFile } from '../../mol-io/reader/psf/parser';
import { Topology } from '../../mol-model/structure/topology/topology';
import { Task } from '../../mol-task';
import { ModelFormat } from '../format';
export { PsfFormat };
type PsfFormat = ModelFormat<PsfFile>;
declare namespace PsfFormat {
    function is(x?: ModelFormat): x is PsfFormat;
    function fromPsf(psf: PsfFile): PsfFormat;
}
export declare function topologyFromPsf(psf: PsfFile): Task<Topology>;
