/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Matrix } from './matrix';
import { NumberArray } from '../../../mol-util/type-helpers';
export declare function swap(A: NumberArray, i0: number, i1: number, t: number): void;
export declare function hypot(a: number, b: number): number;
export declare function JacobiSVDImpl(At: NumberArray, astep: number, _W: NumberArray, Vt: NumberArray, vstep: number, m: number, n: number, n1: number): void;
export declare function svd(A: Matrix, W: Matrix, U: Matrix, V: Matrix): void;
