/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Inspired by https://github.com/dgasmith/gau2grid.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { WebGLContext } from '../../mol-gl/webgl/context';
import { Task } from '../../mol-task';
import { AlphaOrbital, CubeGrid, CubeGridComputationParams } from './data-model';
export declare function createSphericalCollocationGrid(params: CubeGridComputationParams, orbital: AlphaOrbital, webgl?: WebGLContext): Task<CubeGrid>;
export declare function computeOrbitalIsocontourValues(input: Float32Array, cumulativeThreshold: number): {
    negative: number | undefined;
    positive: number | undefined;
};
