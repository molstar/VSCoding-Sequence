/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Task } from '../../mol-task';
import { ModelFormat } from '../format';
import { CubeFile } from '../../mol-io/reader/cube/parser';
import { Trajectory } from '../../mol-model/structure';
export { CubeFormat };
type CubeFormat = ModelFormat<CubeFile>;
export declare function trajectoryFromCube(cube: CubeFile): Task<Trajectory>;
