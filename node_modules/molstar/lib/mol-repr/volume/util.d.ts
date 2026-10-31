/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Volume } from '../../mol-model/volume';
import { Loci } from '../../mol-model/loci';
import { Interval, SortedArray } from '../../mol-data/int';
import { Vec3 } from '../../mol-math/linear-algebra/3d/vec3';
import { Box3D } from '../../mol-math/geometry';
export declare function eachVolumeLoci(loci: Loci, volume: Volume, props: {
    isoValue?: Volume.IsoValue;
    segments?: SortedArray;
} | undefined, apply: (interval: Interval) => boolean): boolean;
export declare function getVolumeTexture2dLayout(dim: Vec3, padding?: number): {
    width: number;
    height: number;
    columns: number;
    rows: number;
    powerOfTwoSize: number;
};
export declare function createVolumeTexture2d(volume: Volume, variant: 'normals' | 'groups' | 'data', padding?: number): {
    array: Uint8Array;
    width: number;
    height: number;
};
export declare function createVolumeTexture3d(volume: Volume): {
    array: Uint8Array;
    width: number;
    height: number;
    depth: number;
};
export declare function createSegmentTexture2d(volume: Volume, set: number[], bbox: Box3D, padding?: number): {
    array: Uint8Array;
    width: number;
    height: number;
};
