/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ValueCell } from '../../mol-util/value-cell';
import { Vec2, Vec3, Vec4 } from '../../mol-math/linear-algebra';
import { TextureImage } from '../../mol-gl/renderable/util';
import { Texture } from '../../mol-gl/webgl/texture';
export type TransparencyType = 'instance' | 'groupInstance' | 'volumeInstance';
export type TransparencyData = {
    tTransparency: ValueCell<TextureImage<Uint8Array>>;
    uTransparencyTexDim: ValueCell<Vec2>;
    dTransparency: ValueCell<boolean>;
    transparencyAverage: ValueCell<number>;
    transparencyMin: ValueCell<number>;
    tTransparencyGrid: ValueCell<Texture>;
    uTransparencyGridDim: ValueCell<Vec3>;
    uTransparencyGridTransform: ValueCell<Vec4>;
    dTransparencyType: ValueCell<string>;
    uTransparencyStrength: ValueCell<number>;
};
export declare function applyTransparencyValue(array: Uint8Array, start: number, end: number, value: number): boolean;
export declare function getTransparencyAverage(array: Uint8Array, count: number): number;
/** exclude fully opaque parts */
export declare function getTransparencyMin(array: Uint8Array, count: number): number;
export declare function clearTransparency(array: Uint8Array, start: number, end: number): void;
export declare function createTransparency(count: number, type: TransparencyType, transparencyData?: TransparencyData): TransparencyData;
export declare function createEmptyTransparency(transparencyData?: TransparencyData): TransparencyData;
