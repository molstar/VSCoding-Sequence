/**
 * Copyright (c) 2021-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ValueCell } from '../../mol-util/value-cell';
import { Vec2, Vec3, Vec4 } from '../../mol-math/linear-algebra';
import { TextureImage } from '../../mol-gl/renderable/util';
import { Texture } from '../../mol-gl/webgl/texture';
import { Material } from '../../mol-util/material';
export type SubstanceType = 'instance' | 'groupInstance' | 'volumeInstance';
export type SubstanceData = {
    tSubstance: ValueCell<TextureImage<Uint8Array>>;
    uSubstanceTexDim: ValueCell<Vec2>;
    dSubstance: ValueCell<boolean>;
    tSubstanceGrid: ValueCell<Texture>;
    uSubstanceGridDim: ValueCell<Vec3>;
    uSubstanceGridTransform: ValueCell<Vec4>;
    dSubstanceType: ValueCell<string>;
    uSubstanceStrength: ValueCell<number>;
};
export declare function applySubstanceMaterial(array: Uint8Array, start: number, end: number, material: Material): boolean;
export declare function clearSubstance(array: Uint8Array, start: number, end: number): boolean;
export declare function createSubstance(count: number, type: SubstanceType, substanceData?: SubstanceData): SubstanceData;
export declare function createEmptySubstance(substanceData?: SubstanceData): SubstanceData;
