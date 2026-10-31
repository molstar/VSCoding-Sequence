/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { CubeFile } from '../../mol-io/reader/cube/parser';
import { Volume } from '../../mol-model/volume';
import { Task } from '../../mol-task';
import { ModelFormat } from '../format';
export declare function volumeFromCube(source: CubeFile, params?: {
    dataIndex?: number;
    label?: string;
    entryId?: string;
}): Task<Volume>;
export { CubeFormat };
type CubeFormat = ModelFormat<CubeFile>;
declare namespace CubeFormat {
    function is(x?: ModelFormat): x is CubeFormat;
    function create(cube: CubeFile): CubeFormat;
}
