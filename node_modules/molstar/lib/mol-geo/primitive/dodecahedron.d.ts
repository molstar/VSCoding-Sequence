/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Primitive } from './primitive';
import { Cage } from './cage';
export declare const dodecahedronVertices: ReadonlyArray<number>;
/** indices of pentagonal faces, groups of five  */
export declare const dodecahedronFaces: ReadonlyArray<number>;
export declare function Dodecahedron(): Primitive;
export declare function DodecahedronCage(): Cage;
