/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Points } from './points';
export interface PointsBuilder {
    add(x: number, y: number, z: number, group: number): void;
    getPoints(): Points;
}
export declare namespace PointsBuilder {
    function create(initialCount?: number, chunkSize?: number, points?: Points): PointsBuilder;
}
