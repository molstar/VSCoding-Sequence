/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { MeshBuilder } from '../mesh-builder';
/** set arrowHeight = 0 for no arrow */
export declare function addSheet(state: MeshBuilder.State, controlPoints: ArrayLike<number>, normalVectors: ArrayLike<number>, binormalVectors: ArrayLike<number>, linearSegments: number, widthValues: ArrayLike<number>, heightValues: ArrayLike<number>, arrowHeight: number, startCap: boolean, endCap: boolean): void;
