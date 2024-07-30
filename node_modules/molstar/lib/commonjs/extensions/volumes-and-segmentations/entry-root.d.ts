/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { BehaviorSubject } from 'rxjs';
import { PluginStateObject } from '../../mol-plugin-state/objects';
import { PluginBehavior } from '../../mol-plugin/behavior';
import { PluginContext } from '../../mol-plugin/context';
import { StateObjectCell, StateSelection, StateTransform } from '../../mol-state';
import { Choice } from '../../mol-util/param-choice';
import { ParamDefinition } from '../../mol-util/param-definition';
import { VolumeApiV2 } from './volseg-api/api';
import { Segment } from './volseg-api/data';
import { MetadataWrapper } from './volseg-api/utils';
import { VolsegVolumeData, SimpleVolumeParamValues } from './entry-volume';
export declare const MAX_VOXELS: number;
export declare const BOX: [[number, number, number], [number, number, number]] | null;
declare const SourceChoice: Choice<"emdb" | "empiar" | "idr", "emdb">;
export type Source = Choice.Values<typeof SourceChoice>;
export declare function createLoadVolsegParams(plugin?: PluginContext, entrylists?: {
    [source: string]: string[];
}): {
    serverUrl: ParamDefinition.Text<string>;
    source: ParamDefinition.Mapped<ParamDefinition.NamedParams<unknown, string>>;
};
type LoadVolsegParamValues = ParamDefinition.Values<ReturnType<typeof createLoadVolsegParams>>;
export declare function createVolsegEntryParams(plugin?: PluginContext): {
    serverUrl: ParamDefinition.Text<string>;
    source: ParamDefinition.Select<"emdb" | "empiar" | "idr">;
    entryId: ParamDefinition.Text<string>;
};
type VolsegEntryParamValues = ParamDefinition.Values<ReturnType<typeof createVolsegEntryParams>>;
export declare namespace VolsegEntryParamValues {
    function fromLoadVolsegParamValues(params: LoadVolsegParamValues): VolsegEntryParamValues;
}
declare const VolsegEntry_base: {
    new (data: VolsegEntryData, props?: {
        label: string;
        description?: string;
    } | undefined): {
        id: import("../../mol-util").UUID;
        type: PluginStateObject.TypeInfo;
        label: string;
        description?: string;
        data: VolsegEntryData;
    };
    type: PluginStateObject.TypeInfo;
    is(obj?: import("../../mol-state").StateObject): obj is import("../../mol-state").StateObject<VolsegEntryData, PluginStateObject.TypeInfo>;
};
export declare class VolsegEntry extends VolsegEntry_base {
}
export declare class VolsegEntryData extends PluginBehavior.WithSubscribers<VolsegEntryParamValues> {
    plugin: PluginContext;
    ref: string;
    api: VolumeApiV2;
    source: Source;
    /** Number part of entry ID; e.g. '1832' */
    entryNumber: string;
    /** Full entry ID; e.g. 'emd-1832' */
    entryId: string;
    metadata: MetadataWrapper;
    pdbs: string[];
    readonly volumeData: VolsegVolumeData;
    private readonly latticeSegmentationData;
    private readonly meshSegmentationData;
    private readonly modelData;
    private highlightRequest;
    private getStateNode;
    currentState: BehaviorSubject<ParamDefinition.Values<{
        volumeType: ParamDefinition.Select<"off" | "direct-volume" | "isosurface">;
        volumeIsovalueKind: ParamDefinition.Select<string>;
        volumeIsovalueValue: ParamDefinition.Numeric;
        volumeOpacity: ParamDefinition.Numeric;
        segmentOpacity: ParamDefinition.Numeric;
        selectedSegment: ParamDefinition.Numeric;
        visibleSegments: ParamDefinition.ObjectList<ParamDefinition.Normalize<{
            segmentId: number;
        }>>;
        visibleModels: ParamDefinition.ObjectList<ParamDefinition.Normalize<{
            pdbId: string;
        }>>;
    }>>;
    currentVolume: BehaviorSubject<StateTransform<import("../../mol-state").StateTransformer<PluginStateObject.Volume.Data, PluginStateObject.Volume.Representation3D, ParamDefinition.Normalize<{
        type: ParamDefinition.NamedParams<any, string>;
        colorTheme: ParamDefinition.NamedParams<any, string>;
        sizeTheme: ParamDefinition.NamedParams<any, string>;
    }>>> | undefined>;
    private constructor();
    private initialize;
    static create(plugin: PluginContext, params: VolsegEntryParamValues): Promise<VolsegEntryData>;
    register(ref: string): Promise<void>;
    unregister(): Promise<void>;
    loadVolume(): Promise<void>;
    loadSegmentations(): Promise<void>;
    actionHighlightSegment(segment?: Segment): void;
    actionToggleSegment(segment: number): Promise<void>;
    actionToggleAllSegments(): Promise<void>;
    actionSelectSegment(segment?: number): Promise<void>;
    actionSetOpacity(opacity: number): Promise<void>;
    actionShowFittedModel(pdbIds: string[]): Promise<void>;
    actionSetVolumeVisual(type: 'isosurface' | 'direct-volume' | 'off'): Promise<void>;
    actionUpdateVolumeVisual(params: SimpleVolumeParamValues): Promise<void>;
    private actionShowSegments;
    private highlightSegment;
    private selectSegment;
    private updateStateNode;
    /** Find the nodes under this entry root which have all of the given tags. */
    findNodesByTags(...tags: string[]): StateSelection.CellSeq<StateObjectCell<import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, StateTransform<import("../../mol-state").StateTransformer<import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, any>>>>;
    newUpdate(): import("../../mol-state").StateBuilder.To<import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, import("../../mol-state").StateTransformer<import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, any>>;
    private readonly labelProvider;
    private getSegmentIdFromLoci;
    setTryUseGpu(tryUseGpu: boolean): Promise<void>;
    setSelectionMode(selectSegments: boolean): Promise<void>;
}
export {};
