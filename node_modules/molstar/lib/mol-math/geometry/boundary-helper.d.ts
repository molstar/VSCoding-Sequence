/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Vec3 } from '../linear-algebra/3d/vec3';
import { CentroidHelper } from './centroid-helper';
import { Sphere3D } from '../geometry';
import { Box3D } from './primitives/box3d';
export declare class BoundaryHelper {
    private dir;
    private dirLength;
    private minDist;
    private maxDist;
    private extrema;
    centroidHelper: CentroidHelper;
    private computeExtrema;
    private computeSphereExtrema;
    includeSphere(s: Sphere3D): void;
    includePosition(p: Vec3): void;
    includePositionRadius(center: Vec3, radius: number): void;
    finishedIncludeStep(): void;
    radiusSphere(s: Sphere3D): void;
    radiusPosition(p: Vec3): void;
    radiusPositionRadius(center: Vec3, radius: number): void;
    getSphere(sphere?: Sphere3D): Sphere3D;
    getBox(box?: Box3D): Box3D;
    reset(): void;
    constructor(quality: EposQuality);
}
type EposQuality = '6' | '14' | '26' | '98';
export {};
