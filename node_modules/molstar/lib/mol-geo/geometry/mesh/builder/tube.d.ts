/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
import { MeshBuilder } from '../mesh-builder';
export declare function addTube(state: MeshBuilder.State, controlPoints: ArrayLike<number>, normalVectors: ArrayLike<number>, binormalVectors: ArrayLike<number>, linearSegments: number, radialSegments: number, widthValues: ArrayLike<number>, heightValues: ArrayLike<number>, startCap: boolean, endCap: boolean, crossSection: 'elliptical' | 'rounded', roundCap?: boolean): void;
