/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { Mesh } from '../../mol-geo/geometry/mesh/mesh';
import { CifFile } from '../../mol-io/reader/cif';
import { Box3D } from '../../mol-math/geometry';
import { Shape } from '../../mol-model/shape';
import { PluginStateObject } from '../../mol-plugin-state/objects';
import { PluginContext } from '../../mol-plugin/context';
import { StateObjectRef, StateObjectSelector, StateTransformer } from '../../mol-state';
import { Color } from '../../mol-util/color';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
export declare const BACKGROUND_OPACITY = 0.2;
export declare const FOREROUND_OPACITY = 1;
export declare const VolsegTransform: StateTransformer.Builder.Root;
/** Data type for `MeshlistStateObject` - list of meshes */
export interface MeshlistData {
    segmentId: number;
    segmentName: string;
    detail: number;
    meshIds: number[];
    mesh: Mesh;
    /** Reference to the object which created this meshlist (e.g. `MeshStreaming.Behavior`) */
    ownerId?: string;
}
export declare namespace MeshlistData {
    function empty(): MeshlistData;
    function fromCIF(data: CifFile, segmentId: number, segmentName: string, detail: number): Promise<MeshlistData>;
    function stats(meshListData: MeshlistData): string;
    function getShape(data: MeshlistData, color: Color): Shape<Mesh>;
    function combineBBoxes(boxes: (Box3D | null)[]): Box3D | null;
    function bbox(data: MeshlistData): Box3D | null;
    function allVerticesUsed(data: MeshlistData): boolean;
}
declare const MeshlistStateObject_base: {
    new (data: MeshlistData, props?: {
        label: string;
        description?: string;
    } | undefined): {
        id: import("../../mol-util").UUID;
        type: PluginStateObject.TypeInfo;
        label: string;
        description?: string;
        data: MeshlistData;
    };
    type: PluginStateObject.TypeInfo;
    is(obj?: import("../../mol-state").StateObject): obj is import("../../mol-state").StateObject<MeshlistData, PluginStateObject.TypeInfo>;
};
export declare class MeshlistStateObject extends MeshlistStateObject_base {
}
export declare const ParseMeshlistTransformer: StateTransformer<PluginStateObject.Format.Cif, MeshlistStateObject, PD.Normalize<{
    label: string;
    segmentId: number;
    segmentName: string;
    detail: number;
    ownerId: string;
}>>;
export declare const MeshShapeTransformer: StateTransformer<MeshlistStateObject, PluginStateObject.Shape.Provider, PD.Normalize<{
    color: Color | undefined;
}>>;
/** Download data and create state tree hierarchy down to visual representation. */
export declare function createMeshFromUrl(plugin: PluginContext, meshDataUrl: string, segmentId: number, detail: number, collapseTree: boolean, color?: Color, parent?: StateObjectSelector | StateObjectRef, transparentIfBboxAbove?: number, name?: string, ownerId?: string): Promise<string>;
export {};
