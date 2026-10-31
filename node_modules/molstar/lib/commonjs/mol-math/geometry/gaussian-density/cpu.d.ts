/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Box3D } from '../../geometry';
import { RuntimeContext } from '../../../mol-task';
import { PositionData } from '../common';
import { GaussianDensityProps, GaussianDensityData } from '../gaussian-density';
export declare function GaussianDensityCPU(ctx: RuntimeContext, position: PositionData, box: Box3D, radius: (index: number) => number, props: GaussianDensityProps): Promise<GaussianDensityData>;
