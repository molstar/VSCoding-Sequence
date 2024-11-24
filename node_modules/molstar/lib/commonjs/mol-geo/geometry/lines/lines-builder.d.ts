/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
import { Lines } from './lines';
import { Mat4, Vec3 } from '../../../mol-math/linear-algebra';
import { Cage } from '../../../mol-geo/primitive/cage';
export interface LinesBuilder {
    add(startX: number, startY: number, startZ: number, endX: number, endY: number, endZ: number, group: number): void;
    addVec(start: Vec3, end: Vec3, group: number): void;
    addFixedCountDashes(start: Vec3, end: Vec3, segmentCount: number, group: number): void;
    addFixedLengthDashes(start: Vec3, end: Vec3, segmentLength: number, group: number): void;
    addCage(t: Mat4, cage: Cage, group: number): void;
    getLines(): Lines;
}
export declare namespace LinesBuilder {
    function create(initialCount?: number, chunkSize?: number, lines?: Lines): LinesBuilder;
}
