/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Primitive } from './primitive';
import { Cage } from './cage';
export declare const octahedronVertices: ReadonlyArray<number>;
export declare const octahedronIndices: ReadonlyArray<number>;
export declare const perforatedOctahedronIndices: ReadonlyArray<number>;
export declare function Octahedron(): Primitive;
export declare function PerforatedOctahedron(): Primitive;
export declare function OctahedronCage(): Cage;
