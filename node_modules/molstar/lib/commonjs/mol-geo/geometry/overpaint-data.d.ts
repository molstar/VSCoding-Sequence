/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ValueCell } from '../../mol-util/value-cell';
import { Vec2, Vec3, Vec4 } from '../../mol-math/linear-algebra';
import { TextureImage } from '../../mol-gl/renderable/util';
import { Color } from '../../mol-util/color';
import { Texture } from '../../mol-gl/webgl/texture';
export type OverpaintType = 'instance' | 'groupInstance' | 'volumeInstance';
export type OverpaintData = {
    tOverpaint: ValueCell<TextureImage<Uint8Array>>;
    uOverpaintTexDim: ValueCell<Vec2>;
    dOverpaint: ValueCell<boolean>;
    tOverpaintGrid: ValueCell<Texture>;
    uOverpaintGridDim: ValueCell<Vec3>;
    uOverpaintGridTransform: ValueCell<Vec4>;
    dOverpaintType: ValueCell<string>;
    uOverpaintStrength: ValueCell<number>;
};
export declare function applyOverpaintColor(array: Uint8Array, start: number, end: number, color: Color): boolean;
export declare function clearOverpaint(array: Uint8Array, start: number, end: number): boolean;
export declare function createOverpaint(count: number, type: OverpaintType, overpaintData?: OverpaintData): OverpaintData;
export declare function createEmptyOverpaint(overpaintData?: OverpaintData): OverpaintData;
