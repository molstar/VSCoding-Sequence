/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Dušan Veľký <dvelky@mail.muni.cz>
 */
import { PluginStateObject } from '../../../mol-plugin-state/objects';
import { StateTransformer } from '../../../mol-state';
import { TunnelStateObject, Tunnel, TunnelsStateObject } from './data-model';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
export declare const TunnelsFromRawData: StateTransformer<PluginStateObject.Root, TunnelsStateObject, PD.Normalize<{
    data: Tunnel[];
}>>;
export declare const SelectTunnel: StateTransformer<TunnelsStateObject, TunnelStateObject, PD.Normalize<{
    index: number;
}>>;
export declare const TunnelFromRawData: StateTransformer<PluginStateObject.Root, TunnelStateObject, PD.Normalize<{
    data: Tunnel;
}>>;
export declare const TunnelShapeProvider: StateTransformer<TunnelStateObject, PluginStateObject.Shape.Provider, PD.Normalize<{
    webgl: import("../../../mol-gl/webgl/context").WebGLContext | null;
    colorTheme: import("../../../mol-util/color").Color;
    visual: PD.NamedParams<PD.Normalize<{
        resolution: any;
    }>, "spheres"> | PD.NamedParams<PD.Normalize<{
        resolution: any;
    }>, "mesh">;
    samplingRate: number;
    showRadii: boolean;
}>>;
