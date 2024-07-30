/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Fred Ludlow <fred.ludlow@gmail.com>
 */
import { Mesh } from '../../geometry/mesh/mesh';
import { Lines } from '../../geometry/lines/lines';
export interface MarchinCubesBuilder<T> {
    addVertex(x: number, y: number, z: number): number;
    addNormal(x: number, y: number, z: number): void;
    addGroup(group: number): void;
    addTriangle(vertList: number[], a: number, b: number, c: number, edgeFilter: number): void;
    get(): T;
}
export declare function MarchinCubesMeshBuilder(vertexChunkSize: number, mesh?: Mesh): MarchinCubesBuilder<Mesh>;
export declare function MarchinCubesLinesBuilder(vertexChunkSize: number, lines?: Lines): MarchinCubesBuilder<Lines>;
