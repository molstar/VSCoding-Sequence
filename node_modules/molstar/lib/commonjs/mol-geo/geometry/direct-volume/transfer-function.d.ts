/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { TextureImage } from '../../../mol-gl/renderable/util';
import { ValueCell } from '../../../mol-util';
import { Vec2 } from '../../../mol-math/linear-algebra';
export interface ControlPoint {
    x: number;
    alpha: number;
}
export declare function getControlPointsFromString(s: string): ControlPoint[];
export declare function getControlPointsFromVec2Array(array: Vec2[]): ControlPoint[];
export declare function createTransferFunctionTexture(controlPoints: ControlPoint[], texture?: ValueCell<TextureImage<Uint8Array>>): ValueCell<TextureImage<Uint8Array>>;
