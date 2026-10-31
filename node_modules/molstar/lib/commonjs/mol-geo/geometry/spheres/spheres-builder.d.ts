/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Spheres } from './spheres';
export interface SpheresBuilder {
    add(x: number, y: number, z: number, group: number): void;
    getSpheres(): Spheres;
}
export declare namespace SpheresBuilder {
    function create(initialCount?: number, chunkSize?: number, spheres?: Spheres): SpheresBuilder;
}
