/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ValueCell } from '../../mol-util/value-cell';
import { Vec2, Vec3, Vec4 } from '../../mol-math/linear-algebra';
import { TextureImage } from '../../mol-gl/renderable/util';
import { Texture } from '../../mol-gl/webgl/texture';
export type EmissiveType = 'instance' | 'groupInstance' | 'volumeInstance';
export type EmissiveData = {
    tEmissive: ValueCell<TextureImage<Uint8Array>>;
    uEmissiveTexDim: ValueCell<Vec2>;
    dEmissive: ValueCell<boolean>;
    emissiveAverage: ValueCell<number>;
    tEmissiveGrid: ValueCell<Texture>;
    uEmissiveGridDim: ValueCell<Vec3>;
    uEmissiveGridTransform: ValueCell<Vec4>;
    dEmissiveType: ValueCell<string>;
    uEmissiveStrength: ValueCell<number>;
};
export declare function applyEmissiveValue(array: Uint8Array, start: number, end: number, value: number): boolean;
export declare function getEmissiveAverage(array: Uint8Array, count: number): number;
export declare function clearEmissive(array: Uint8Array, start: number, end: number): void;
export declare function createEmissive(count: number, type: EmissiveType, emissiveData?: EmissiveData): EmissiveData;
export declare function createEmptyEmissive(emissiveData?: EmissiveData): EmissiveData;
