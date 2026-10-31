/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { NumberArray } from '../../mol-util/type-helpers';
/**
 * 2D Euclidean distance transform by Felzenszwalb & Huttenlocher https://cs.brown.edu/~pff/papers/dt-final.pdf
 */
export declare function edt(data: NumberArray, width: number, height: number, f: NumberArray, d: NumberArray, v: NumberArray, z: NumberArray): void;
