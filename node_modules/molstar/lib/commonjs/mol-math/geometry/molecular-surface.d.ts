/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Fred Ludlow <fred.ludlow@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * ported from NGL (https://github.com/arose/ngl), licensed under MIT
 */
import { Tensor } from '../../mol-math/linear-algebra';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { RuntimeContext } from '../../mol-task';
import { PositionData } from './common';
import { Mat4 } from '../../mol-math/linear-algebra/3d/mat4';
import { Box3D } from '../../mol-math/geometry';
import { Boundary } from './boundary';
export declare const MolecularSurfaceCalculationParams: {
    probeRadius: PD.Numeric;
    resolution: PD.Numeric;
    probePositions: PD.Numeric;
};
export declare const DefaultMolecularSurfaceCalculationProps: PD.Values<{
    probeRadius: PD.Numeric;
    resolution: PD.Numeric;
    probePositions: PD.Numeric;
}>;
export type MolecularSurfaceCalculationProps = typeof DefaultMolecularSurfaceCalculationProps;
export declare function calcMolecularSurface(ctx: RuntimeContext, position: Required<PositionData>, boundary: Boundary, maxRadius: number, box: Box3D | null, props: MolecularSurfaceCalculationProps): Promise<{
    field: Tensor;
    idField: Tensor;
    transform: Mat4;
    resolution: number;
    maxRadius: number;
}>;
