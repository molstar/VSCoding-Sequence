/**
 * Copyright (c) 2020-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ValueCell } from '../../mol-util/value-cell';
import { Vec2 } from '../../mol-math/linear-algebra';
import { TextureImage } from '../../mol-gl/renderable/util';
import { Clipping } from '../../mol-theme/clipping';
export type ClippingType = 'instance' | 'groupInstance';
export type ClippingData = {
    tClipping: ValueCell<TextureImage<Uint8Array>>;
    uClippingTexDim: ValueCell<Vec2>;
    dClipping: ValueCell<boolean>;
    dClippingType: ValueCell<string>;
};
export declare function applyClippingGroups(array: Uint8Array, start: number, end: number, groups: Clipping.Groups): boolean;
export declare function clearClipping(array: Uint8Array, start: number, end: number): void;
export declare function createClipping(count: number, type: ClippingType, clippingData?: ClippingData): ClippingData;
export declare function createEmptyClipping(clippingData?: ClippingData): ClippingData;
