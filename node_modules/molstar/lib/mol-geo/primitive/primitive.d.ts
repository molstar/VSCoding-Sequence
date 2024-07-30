/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Vec3, Mat4 } from '../../mol-math/linear-algebra';
export interface Primitive {
    vertices: ArrayLike<number>;
    normals: ArrayLike<number>;
    indices: ArrayLike<number>;
}
/** Create primitive with face normals from vertices and indices */
export declare function createPrimitive(vertices: ArrayLike<number>, indices: ArrayLike<number>): Primitive;
export declare function copyPrimitive(primitive: Primitive): Primitive;
export interface PrimitiveBuilder {
    add(a: Vec3, b: Vec3, c: Vec3): void;
    /** Shared vertices and normals, must be flat */
    addQuad(a: Vec3, b: Vec3, c: Vec3, d: Vec3): void;
    getPrimitive(): Primitive;
}
/** Builder to create primitive with face normals */
export declare function PrimitiveBuilder(triangleCount: number, vertexCount?: number): PrimitiveBuilder;
/** Transform primitive in-place */
export declare function transformPrimitive(primitive: Primitive, t: Mat4): Primitive;
