/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Box3D, Axes3D } from '../../../../mol-math/geometry';
import { MeshBuilder } from '../mesh-builder';
export declare function addBoundingBox(state: MeshBuilder.State, box: Box3D, radius: number, detail: number, radialSegments: number): void;
export declare function addOrientedBox(state: MeshBuilder.State, axes: Axes3D, radiusScale: number, detail: number, radialSegments: number): void;
