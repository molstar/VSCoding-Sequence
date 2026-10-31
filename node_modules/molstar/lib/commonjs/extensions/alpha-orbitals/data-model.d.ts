/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Vec3 } from '../../mol-math/linear-algebra';
import { Grid } from '../../mol-model/volume';
import { SphericalBasisOrder } from './spherical-functions';
import { Box3D, RegularGrid3d } from '../../mol-math/geometry';
import { ModelFormat } from '../../mol-model-formats/format';
export interface SphericalElectronShell {
    exponents: number[];
    angularMomentum: number[];
    coefficients: number[][];
}
export interface Basis {
    atoms: {
        center: [number, number, number];
        shells: SphericalElectronShell[];
    }[];
}
export interface AlphaOrbital {
    energy: number;
    occupancy: number;
    alpha: number[];
}
export interface CubeGridComputationParams {
    basis: Basis;
    /**
     * for each electron shell compute a cutoff radius as
     *    const cutoffRadius = Math.sqrt(-Math.log(cutoffThreshold) / arrayMin(exponents));
     */
    cutoffThreshold: number;
    sphericalOrder: SphericalBasisOrder;
    boxExpand: number;
    gridSpacing: number | [atomCountThreshold: number, spacing: number][];
    doNotComputeIsovalues?: boolean;
}
export interface CubeGridInfo {
    params: CubeGridComputationParams;
    dimensions: Vec3;
    box: Box3D;
    size: Vec3;
    npoints: number;
    delta: Vec3;
}
export interface CubeGrid {
    grid: Grid;
    isovalues?: {
        negative?: number;
        positive?: number;
    };
}
export type CubeGridFormat = ModelFormat<CubeGrid>;
export declare function CubeGridFormat(grid: CubeGrid): CubeGridFormat;
export declare function isCubeGridData(f: ModelFormat): f is CubeGridFormat;
export declare function initCubeGrid(params: CubeGridComputationParams): CubeGridInfo;
export declare function createGrid(gridInfo: RegularGrid3d, values: Float32Array, axisOrder: number[]): Grid;
