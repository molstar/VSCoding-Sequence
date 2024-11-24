/**
 * Copyright (c) 2021-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sukolsak Sakshuwong <sukolsak@stanford.edu>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Box3D } from '../../mol-math/geometry';
import { RuntimeContext } from '../../mol-task';
import { MeshExporter, AddMeshInput } from './mesh-exporter';
export type UsdzData = {
    usdz: ArrayBuffer;
};
export declare class UsdzExporter extends MeshExporter<UsdzData> {
    readonly fileExtension = "usdz";
    private meshes;
    private materials;
    private materialMap;
    private centerTransform;
    private addMaterial;
    protected addMeshWithColors(input: AddMeshInput): Promise<void>;
    getData(ctx: RuntimeContext): Promise<{
        usdz: ArrayBufferLike;
    }>;
    getBlob(ctx: RuntimeContext): Promise<Blob>;
    constructor(boundingBox: Box3D, radius: number);
}
