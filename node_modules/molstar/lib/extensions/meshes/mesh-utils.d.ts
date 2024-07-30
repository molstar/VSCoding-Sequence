/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
/** Helper functions for manipulation with mesh data. */
import { Mesh } from '../../mol-geo/geometry/mesh/mesh';
import { CifFile } from '../../mol-io/reader/cif';
import { Box3D } from '../../mol-math/geometry';
import { Mat4 } from '../../mol-math/linear-algebra';
type MeshModificationParams = {
    scale?: [number, number, number];
    shift?: [number, number, number];
    matrix?: Mat4;
    group?: number;
    invertSides?: boolean;
};
/** Modify mesh in-place */
export declare function modify(m: Mesh, params: MeshModificationParams): void;
/** Create a copy a mesh, possibly modified */
export declare function copy(m: Mesh, modification?: MeshModificationParams): Mesh;
/** Join more meshes into one */
export declare function concat(...meshes: Mesh[]): Mesh;
/** Return Mesh from CIF data and mesh IDs (group IDs).
 * Assume the CIF contains coords in grid space,
 * transform the output mesh to `space` */
export declare function meshFromCif(data: CifFile, invertSides?: boolean | undefined, outSpace?: 'grid' | 'fractional' | 'cartesian'): Promise<{
    mesh: Mesh;
    meshIds: number[];
}>;
/** Return bounding box */
export declare function bbox(mesh: Mesh): Box3D | null;
/** Example mesh - 1 triangle */
export declare function fakeFakeMesh1(): Mesh;
/** Example mesh - irregular tetrahedron */
export declare function fakeMesh4(): Mesh;
/** Return a box-shaped mesh */
export declare function meshFromBox(box: [[number, number, number], [number, number, number]], group?: number): Mesh;
/** Generate random colors (in a cycle) */
export declare const ColorGenerator: Generator<import("../../mol-util/color").Color, never, unknown>;
export {};
