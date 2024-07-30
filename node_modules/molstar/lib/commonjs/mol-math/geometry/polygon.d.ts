/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { NumberArray } from '../../mol-util/type-helpers';
import { Vec2 } from '../linear-algebra';
/** raycast along x-axis and apply even-odd rule */
export declare function pointInPolygon(point: Vec2, polygon: NumberArray, count: number): boolean;
