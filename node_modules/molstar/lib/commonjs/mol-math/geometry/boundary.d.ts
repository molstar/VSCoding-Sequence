/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { PositionData } from './common';
import { Box3D, Sphere3D } from '../geometry';
export type Boundary = {
    readonly box: Box3D;
    readonly sphere: Sphere3D;
};
export declare function getFastBoundary(data: PositionData): Boundary;
export declare function getBoundary(data: PositionData): Boundary;
