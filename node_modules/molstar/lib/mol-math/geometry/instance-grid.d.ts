/**
 * Copyright (c) 2022-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Sphere3D } from './primitives/sphere3d';
type TopGrid = {
    readonly batchSize: number;
    readonly batchCount: number;
    readonly batchOffsets: Uint32Array;
    readonly batchSpheres: Float32Array;
    readonly batchCell: Uint32Array;
};
type BottomGrid = {
    readonly cellSize: number;
    readonly cellCount: number;
    readonly cellOffsets: Uint32Array;
    readonly cellSpheres: Float32Array;
    readonly cellTransform: Float32Array;
    readonly cellInstance: Float32Array;
};
export type InstanceGrid = BottomGrid & TopGrid;
export type InstanceData = {
    instanceCount: number;
    instance: Float32Array;
    transform: Float32Array;
    invariantBoundingSphere: Sphere3D;
};
export declare function createEmptyInstanceGrid(): InstanceGrid;
export declare function calcInstanceGrid(instanceData: InstanceData, cellSize: number, batchSize: number): InstanceGrid;
export {};
