/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Mat4 } from '../../mol-math/linear-algebra';
export interface Cage {
    readonly vertices: ArrayLike<number>;
    readonly edges: ArrayLike<number>;
}
export declare function createCage(vertices: ArrayLike<number>, edges: ArrayLike<number>): Cage;
export declare function cloneCage(cage: Cage): Cage;
/** Transform primitive in-place */
export declare function transformCage(cage: Cage, t: Mat4): Cage;
