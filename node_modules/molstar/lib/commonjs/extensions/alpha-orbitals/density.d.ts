/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { WebGLContext } from '../../mol-gl/webgl/context';
import { Task } from '../../mol-task';
import { AlphaOrbital, CubeGrid, CubeGridComputationParams } from './data-model';
export declare function createSphericalCollocationDensityGrid(params: CubeGridComputationParams, orbitals: AlphaOrbital[], webgl?: WebGLContext): Task<CubeGrid>;
export declare function computeDensityIsocontourValues(input: Float32Array, cumulativeThreshold: number): {
    negative: number | undefined;
    positive: number | undefined;
};
