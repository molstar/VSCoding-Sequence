/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { PluginStateObject } from '../../../mol-plugin-state/objects';
import { StateAction, StateTransformer } from '../../../mol-state';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { MeshStreaming } from './behavior';
import { MeshServerInfo } from './server-info';
export declare const MeshServerTransformer: StateTransformer<PluginStateObject.Root, MeshServerInfo, PD.Normalize<{
    serverUrl: string;
    source: "emdb" | "empiar";
    entryId: string;
}>>;
export declare const MeshStreamingTransformer: StateTransformer<MeshServerInfo, MeshStreaming, PD.Normalize<{
    view: PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
        detail: any;
    }>, "all"> | PD.NamedParams<PD.Normalize<{
        baseDetail: any;
        focusDetail: any;
        selectedSegment: any;
    }>, "select">;
}>>;
export declare const MeshVisualGroupTransformer: StateTransformer<MeshStreaming, PluginStateObject.Group, PD.Normalize<{
    label: string;
    description: string;
    segmentId: number;
    opacity: number;
}>>;
export declare const MeshVisualTransformer: StateTransformer<MeshStreaming, PluginStateObject.Shape.Representation3D, PD.Normalize<{
    ref: string;
    tag: string;
    opacity: number;
}>>;
export declare const InitMeshStreaming: StateAction<PluginStateObject.Root, void, PD.Normalize<{
    serverUrl: string;
    source: "emdb" | "empiar";
    entryId: string;
}>>;
