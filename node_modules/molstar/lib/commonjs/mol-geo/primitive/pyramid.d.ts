/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Primitive } from './primitive';
import { Cage } from './cage';
/**
 * Create a pyramid with a polygonal base
 */
export declare function Pyramid(points: ArrayLike<number>): Primitive;
export declare function TriangularPyramid(): Primitive;
export declare function OctagonalPyramid(): Primitive;
export declare function PerforatedOctagonalPyramid(): Primitive;
/**
 * Create a prism cage
 */
export declare function PyramidCage(points: ArrayLike<number>): Cage;
export declare function OctagonalPyramidCage(): Cage;
