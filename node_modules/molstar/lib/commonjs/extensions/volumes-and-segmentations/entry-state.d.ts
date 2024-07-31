/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { PluginStateObject } from '../../mol-plugin-state/objects';
import { Choice } from '../../mol-util/param-choice';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
export declare const VolumeTypeChoice: Choice<"off" | "direct-volume" | "isosurface", "isosurface">;
export type VolumeType = Choice.Values<typeof VolumeTypeChoice>;
export declare const VolsegStateParams: {
    volumeType: PD.Select<"off" | "direct-volume" | "isosurface">;
    volumeIsovalueKind: PD.Select<string>;
    volumeIsovalueValue: PD.Numeric;
    volumeOpacity: PD.Numeric;
    segmentOpacity: PD.Numeric;
    selectedSegment: PD.Numeric;
    visibleSegments: PD.ObjectList<PD.Normalize<{
        segmentId: number;
    }>>;
    visibleModels: PD.ObjectList<PD.Normalize<{
        pdbId: string;
    }>>;
};
export type VolsegStateData = PD.Values<typeof VolsegStateParams>;
declare const VolsegState_base: {
    new (data: PD.Values<{
        volumeType: PD.Select<"off" | "direct-volume" | "isosurface">;
        volumeIsovalueKind: PD.Select<string>;
        volumeIsovalueValue: PD.Numeric;
        volumeOpacity: PD.Numeric;
        segmentOpacity: PD.Numeric;
        selectedSegment: PD.Numeric;
        visibleSegments: PD.ObjectList<PD.Normalize<{
            segmentId: number;
        }>>;
        visibleModels: PD.ObjectList<PD.Normalize<{
            pdbId: string;
        }>>;
    }>, props?: {
        label: string;
        description?: string;
    } | undefined): {
        id: import("../../mol-util").UUID;
        type: PluginStateObject.TypeInfo;
        label: string;
        description?: string;
        data: PD.Values<{
            volumeType: PD.Select<"off" | "direct-volume" | "isosurface">;
            volumeIsovalueKind: PD.Select<string>;
            volumeIsovalueValue: PD.Numeric;
            volumeOpacity: PD.Numeric;
            segmentOpacity: PD.Numeric;
            selectedSegment: PD.Numeric;
            visibleSegments: PD.ObjectList<PD.Normalize<{
                segmentId: number;
            }>>;
            visibleModels: PD.ObjectList<PD.Normalize<{
                pdbId: string;
            }>>;
        }>;
    };
    type: PluginStateObject.TypeInfo;
    is(obj?: import("../../mol-state").StateObject): obj is import("../../mol-state").StateObject<PD.Values<{
        volumeType: PD.Select<"off" | "direct-volume" | "isosurface">;
        volumeIsovalueKind: PD.Select<string>;
        volumeIsovalueValue: PD.Numeric;
        volumeOpacity: PD.Numeric;
        segmentOpacity: PD.Numeric;
        selectedSegment: PD.Numeric;
        visibleSegments: PD.ObjectList<PD.Normalize<{
            segmentId: number;
        }>>;
        visibleModels: PD.ObjectList<PD.Normalize<{
            pdbId: string;
        }>>;
    }>, PluginStateObject.TypeInfo>;
};
export declare class VolsegState extends VolsegState_base {
}
export declare const VOLSEG_STATE_FROM_ENTRY_TRANSFORMER_NAME = "volseg-state-from-entry";
export {};
