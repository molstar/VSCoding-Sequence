/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Structure } from '../mol-model/structure';
import { PluginContext } from './context';
import { EmdbDownloadProvider } from '../mol-plugin-state/actions/volume';
import { StructureRepresentationPresetProvider } from '../mol-plugin-state/builder/structure/representation-preset';
import { SaccharideCompIdMapType } from '../mol-model/structure/structure/carbohydrates/constants';
export declare class PluginConfigItem<T = any> {
    key: string;
    defaultValue?: T | undefined;
    toString(): string;
    valueOf(): string;
    constructor(key: string, defaultValue?: T | undefined);
}
declare function item<T>(key: string, defaultValue?: T): PluginConfigItem<T>;
export declare const PluginConfig: {
    item: typeof item;
    General: {
        IsBusyTimeoutMs: PluginConfigItem<number>;
        DisableAntialiasing: PluginConfigItem<boolean>;
        DisablePreserveDrawingBuffer: PluginConfigItem<boolean>;
        PixelScale: PluginConfigItem<number>;
        PickScale: PluginConfigItem<number>;
        Transparency: PluginConfigItem<"blended" | "wboit" | "dpoit">;
        PreferWebGl1: PluginConfigItem<boolean>;
        AllowMajorPerformanceCaveat: PluginConfigItem<boolean>;
        PowerPreference: PluginConfigItem<WebGLPowerPreference | undefined>;
    };
    State: {
        DefaultServer: PluginConfigItem<string>;
        CurrentServer: PluginConfigItem<string>;
        HistoryCapacity: PluginConfigItem<number>;
    };
    VolumeStreaming: {
        Enabled: PluginConfigItem<boolean>;
        DefaultServer: PluginConfigItem<string>;
        CanStream: PluginConfigItem<(s: Structure, plugin: PluginContext) => boolean>;
        EmdbHeaderServer: PluginConfigItem<string>;
    };
    Viewport: {
        ShowExpand: PluginConfigItem<boolean>;
        ShowControls: PluginConfigItem<boolean>;
        ShowSettings: PluginConfigItem<boolean>;
        ShowSelectionMode: PluginConfigItem<boolean>;
        ShowAnimation: PluginConfigItem<boolean>;
        ShowTrajectoryControls: PluginConfigItem<boolean>;
    };
    Download: {
        DefaultPdbProvider: PluginConfigItem<"rcsb" | "pdbe" | "pdbj">;
        DefaultEmdbProvider: PluginConfigItem<EmdbDownloadProvider>;
    };
    Structure: {
        SizeThresholds: PluginConfigItem<{
            smallResidueCount: number;
            mediumResidueCount: number;
            largeResidueCount: number;
            highSymmetryUnitCount: number;
            fiberResidueCount: number;
        }>;
        DefaultRepresentationPreset: PluginConfigItem<string>;
        DefaultRepresentationPresetParams: PluginConfigItem<StructureRepresentationPresetProvider.CommonParams>;
        SaccharideCompIdMapType: PluginConfigItem<SaccharideCompIdMapType>;
    };
    Background: {
        Styles: PluginConfigItem<[import("../mol-util/param-definition").ParamDefinition.Values<{
            variant: import("../mol-util/param-definition").ParamDefinition.Mapped<import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<unknown>, "off"> | import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                coverage: string;
                opacity: number;
                saturation: number;
                lightness: number;
                source: import("../mol-util/param-definition").ParamDefinition.NamedParams<any, "url"> | import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/assets").Asset.File | null, "file">;
                blur: number;
            }>, "image"> | import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                centerColor: import("../mol-util/color").Color;
                edgeColor: import("../mol-util/color").Color;
                ratio: number;
                coverage: string;
            }>, "radialGradient"> | import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                opacity: number;
                saturation: number;
                lightness: number;
                faces: import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                    nx: any;
                    ny: any;
                    nz: any;
                    px: any;
                    py: any;
                    pz: any;
                }>, "urls"> | import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                    nx: any;
                    ny: any;
                    nz: any;
                    px: any;
                    py: any;
                    pz: any;
                }>, "files">;
                blur: number;
                rotation: import("../mol-util/param-definition").ParamDefinition.Normalize<{
                    x: any;
                    y: any;
                    z: any;
                }>;
            }>, "skybox"> | import("../mol-util/param-definition").ParamDefinition.NamedParams<import("../mol-util/param-definition").ParamDefinition.Normalize<{
                topColor: import("../mol-util/color").Color;
                bottomColor: import("../mol-util/color").Color;
                ratio: number;
                coverage: string;
            }>, "horizontalGradient">>;
        }>, string][]>;
    };
};
export declare class PluginConfigManager {
    private _config;
    get<T>(key: PluginConfigItem<T>): T | undefined;
    set<T>(key: PluginConfigItem<T>, value: T): void;
    delete<T>(key: PluginConfigItem<T>): void;
    constructor(initial?: [PluginConfigItem, unknown][]);
}
export {};
