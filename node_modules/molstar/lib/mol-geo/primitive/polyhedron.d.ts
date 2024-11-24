/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Primitive } from './primitive';
export declare const DefaultPolyhedronProps: {
    radius: number;
    detail: number;
};
export type PolyhedronProps = Partial<typeof DefaultPolyhedronProps>;
export declare function Polyhedron(_vertices: ArrayLike<number>, _indices: ArrayLike<number>, props?: PolyhedronProps): Primitive;
