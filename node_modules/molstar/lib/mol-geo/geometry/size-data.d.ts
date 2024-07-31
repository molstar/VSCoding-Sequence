/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ValueCell } from '../../mol-util';
import { Vec2 } from '../../mol-math/linear-algebra';
import { TextureImage } from '../../mol-gl/renderable/util';
import { LocationIterator } from '../util/location-iterator';
import { Location } from '../../mol-model/location';
import { SizeTheme } from '../../mol-theme/size';
export type SizeType = 'uniform' | 'instance' | 'group' | 'groupInstance';
export type SizeData = {
    uSize: ValueCell<number>;
    tSize: ValueCell<TextureImage<Uint8Array>>;
    uSizeTexDim: ValueCell<Vec2>;
    dSizeType: ValueCell<string>;
};
export declare function createSizes(locationIt: LocationIterator, sizeTheme: SizeTheme<any>, sizeData?: SizeData): SizeData;
export declare const sizeDataFactor = 100;
export declare function getMaxSize(sizeData: SizeData): number;
export type LocationSize = (location: Location) => number;
export declare function createValueSize(value: number, sizeData?: SizeData): SizeData;
/** Creates size uniform */
export declare function createUniformSize(locationIt: LocationIterator, sizeFn: LocationSize, sizeData?: SizeData): SizeData;
export declare function createTextureSize(sizes: TextureImage<Uint8Array>, type: SizeType, sizeData?: SizeData): SizeData;
/** Creates size texture with size for each instance/unit */
export declare function createInstanceSize(locationIt: LocationIterator, sizeFn: LocationSize, sizeData?: SizeData): SizeData;
/** Creates size texture with size for each group (i.e. shared across instances/units) */
export declare function createGroupSize(locationIt: LocationIterator, sizeFn: LocationSize, sizeData?: SizeData): SizeData;
/** Creates size texture with size for each group in each instance (i.e. for each unit) */
export declare function createGroupInstanceSize(locationIt: LocationIterator, sizeFn: LocationSize, sizeData?: SizeData): SizeData;
