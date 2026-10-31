/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Vec3 } from '../../../../mol-math/linear-algebra';
import { MeshBuilder } from '../mesh-builder';
export declare function addEllipsoid(state: MeshBuilder.State, center: Vec3, dirMajor: Vec3, dirMinor: Vec3, radiusScale: Vec3, detail: number): void;
