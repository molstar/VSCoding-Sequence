/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Primitive } from './primitive';
/** Calculate vertex count for subdived icosahedron */
export declare function sphereVertexCount(detail: number): number;
/** Create sphere by subdividing an icosahedron */
export declare function Sphere(detail: number): Primitive;
