/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Task } from '../../../mol-task';
import { Tensor } from '../../../mol-math/linear-algebra';
import { Mesh } from '../../geometry/mesh/mesh';
import { Lines } from '../../geometry/lines/lines';
/**
 * The parameters required by the algorithm.
 */
export interface MarchingCubesParams {
    isoLevel: number;
    scalarField: Tensor;
    bottomLeft?: ReadonlyArray<number>;
    topRight?: ReadonlyArray<number>;
    idField?: Tensor;
}
export declare function computeMarchingCubesMesh(params: MarchingCubesParams, mesh?: Mesh): Task<Mesh>;
export declare function computeMarchingCubesLines(params: MarchingCubesParams, lines?: Lines): Task<Lines>;
