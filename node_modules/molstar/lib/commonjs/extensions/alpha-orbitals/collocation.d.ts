/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Inspired by https://github.com/dgasmith/gau2grid.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { RuntimeContext } from '../../mol-task';
import { AlphaOrbital, CubeGridInfo } from './data-model';
export declare function sphericalCollocation(grid: CubeGridInfo, orbital: AlphaOrbital, taskCtx: RuntimeContext): Promise<Float32Array>;
