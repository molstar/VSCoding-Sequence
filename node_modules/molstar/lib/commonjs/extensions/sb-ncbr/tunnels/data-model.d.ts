/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Dušan Veľký <dvelky@mail.muni.cz>
 */
import { WebGLContext } from '../../../mol-gl/webgl/context';
import { PluginStateObject } from '../../../mol-plugin-state/objects';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
export interface Profile {
    Charge: number;
    Radius: number;
    FreeRadius: number;
    T: number;
    Distance: number;
    X: number;
    Y: number;
    Z: number;
}
export interface Layerweightedproperties {
    Hydrophobicity: number;
    Hydropathy: number;
    Polarity: number;
    Mutability: number;
}
export interface LayerGeometry {
    MinRadius: number;
    MinFreeRadius: number;
    StartDistance: number;
    EndDistance: number;
    LocalMinimum: boolean;
    Bottleneck: boolean;
    bottleneck: boolean;
}
export interface Properties {
    Charge: number;
    NumPositives: number;
    NumNegatives: number;
    Hydrophobicity: number;
    Hydropathy: number;
    Polarity: number;
    Mutability: number;
}
export interface LayersInfo {
    LayerGeometry: LayerGeometry;
    Residues: string[];
    FlowIndices: string[];
    Properties: Properties;
}
export interface Layers {
    ResidueFlow: string[];
    HetResidues: any[];
    LayerWeightedProperties: Layerweightedproperties;
    LayersInfo: LayersInfo[];
}
export interface TunnelDB {
    Type: string;
    Id: string;
    Cavity: string;
    Auto: boolean;
    Properties: Properties;
    Profile: Profile[];
    Layers: Layers;
}
export interface ChannelsDBdata {
    'CSATunnels_MOLE': TunnelDB[];
    'CSATunnels_Caver': TunnelDB[];
    'ReviewedChannels_MOLE': TunnelDB[];
    'ReviewedChannels_Caver': TunnelDB[];
    'CofactorTunnels_MOLE': TunnelDB[];
    'CofactorTunnels_Caver': TunnelDB[];
    'TransmembranePores_MOLE': TunnelDB[];
    'TransmembranePores_Caver': TunnelDB[];
    'ProcognateTunnels_MOLE': TunnelDB[];
    'ProcognateTunnels_Caver': TunnelDB[];
    'AlphaFillTunnels_MOLE': TunnelDB[];
    'AlphaFillTunnels_Caver': TunnelDB[];
}
export interface ChannelsCache {
    Channels: ChannelsDBdata;
}
export interface Tunnel {
    data: Profile[];
    props: {
        highlight_label?: string;
        type?: string;
        id?: string;
        label?: string;
        description?: string;
    };
}
export declare const TunnelShapeParams: {
    webgl: PD.Value<WebGLContext | null>;
    colorTheme: PD.Color;
    visual: PD.Mapped<PD.NamedParams<PD.Normalize<{
        resolution: number;
    }>, "spheres"> | PD.NamedParams<PD.Normalize<{
        resolution: number;
    }>, "mesh">>;
    samplingRate: PD.Numeric;
    showRadii: PD.BooleanParam;
};
declare const TunnelStateObject_base: {
    new (data: {
        tunnel: Tunnel;
    }, props?: {
        label: string;
        description?: string;
    } | undefined): {
        id: import("../../../mol-util").UUID;
        type: PluginStateObject.TypeInfo;
        label: string;
        description?: string;
        data: {
            tunnel: Tunnel;
        };
    };
    type: PluginStateObject.TypeInfo;
    is(obj?: import("../../../mol-state").StateObject): obj is import("../../../mol-state").StateObject<{
        tunnel: Tunnel;
    }, PluginStateObject.TypeInfo>;
};
export declare class TunnelStateObject extends TunnelStateObject_base {
}
declare const TunnelsStateObject_base: {
    new (data: {
        tunnels: Tunnel[];
    }, props?: {
        label: string;
        description?: string;
    } | undefined): {
        id: import("../../../mol-util").UUID;
        type: PluginStateObject.TypeInfo;
        label: string;
        description?: string;
        data: {
            tunnels: Tunnel[];
        };
    };
    type: PluginStateObject.TypeInfo;
    is(obj?: import("../../../mol-state").StateObject): obj is import("../../../mol-state").StateObject<{
        tunnels: Tunnel[];
    }, PluginStateObject.TypeInfo>;
};
export declare class TunnelsStateObject extends TunnelsStateObject_base {
}
export {};
