/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Vec3, Mat4 } from '../../../mol-math/linear-algebra';
import { ChunkedArray } from '../../../mol-data/util';
import { Mesh } from './mesh';
import { Primitive } from '../../primitive/primitive';
import { Cage } from '../../../mol-geo/primitive/cage';
export declare namespace MeshBuilder {
    interface State {
        currentGroup: number;
        readonly vertices: ChunkedArray<number, 3>;
        readonly normals: ChunkedArray<number, 3>;
        readonly indices: ChunkedArray<number, 3>;
        readonly groups: ChunkedArray<number, 1>;
        readonly mesh?: Mesh;
    }
    function createState(initialCount?: number, chunkSize?: number, mesh?: Mesh): State;
    function addTriangle(state: State, a: Vec3, b: Vec3, c: Vec3): void;
    function addTriangleWithNormal(state: State, a: Vec3, b: Vec3, c: Vec3, n: Vec3): void;
    function addTriangleStrip(state: State, vertices: ArrayLike<number>, indices: ArrayLike<number>): void;
    function addTriangleFan(state: State, vertices: ArrayLike<number>, indices: ArrayLike<number>): void;
    function addTriangleFanWithNormal(state: State, vertices: ArrayLike<number>, indices: ArrayLike<number>, normal: Vec3): void;
    function addPrimitive(state: State, t: Mat4, primitive: Primitive): void;
    /** Flips triangle normals and winding order */
    function addPrimitiveFlipped(state: State, t: Mat4, primitive: Primitive): void;
    function addCage(state: State, t: Mat4, cage: Cage, radius: number, detail: number, radialSegments: number): void;
    function addMesh(state: State, t: Mat4, mesh: Mesh): void;
    function getMesh(state: State): Mesh;
}
