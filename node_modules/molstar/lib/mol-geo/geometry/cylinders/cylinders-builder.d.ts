/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
import { Cylinders } from './cylinders';
import { Vec3 } from '../../../mol-math/linear-algebra';
export interface CylindersBuilder {
    /**
     * @param colorMode - controls if and how theme colors are interpolated
     * - for colorMode between 0 and 1 use colorMode to interpolate
     * - for colorMode == 2 do nothing, i.e., use given theme color
     * - for colorMode == 3 use position on cylinder axis to interpolate
     */
    add(startX: number, startY: number, startZ: number, endX: number, endY: number, endZ: number, radiusScale: number, topCap: boolean, bottomCap: boolean, colorMode: number, group: number): void;
    addFixedCountDashes(start: Vec3, end: Vec3, segmentCount: number, radiusScale: number, topCap: boolean, bottomCap: boolean, stubCap: boolean, interpolate: boolean, group: number): void;
    addFixedLengthDashes(start: Vec3, end: Vec3, segmentLength: number, radiusScale: number, topCap: boolean, bottomCap: boolean, interpolate: boolean, group: number): void;
    getCylinders(): Cylinders;
}
export declare namespace CylindersBuilder {
    function create(initialCount?: number, chunkSize?: number, cylinders?: Cylinders): CylindersBuilder;
}
