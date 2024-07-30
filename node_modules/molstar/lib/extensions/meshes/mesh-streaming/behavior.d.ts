/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { PluginStateObject } from '../../../mol-plugin-state/objects';
import { PluginBehavior } from '../../../mol-plugin/behavior';
import { PluginContext } from '../../../mol-plugin/context';
import { UUID } from '../../../mol-util';
import { Color } from '../../../mol-util/color';
import { Choice } from '../../../mol-util/param-choice';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { MeshlistData } from '../mesh-extension';
import { MeshServerInfo } from './server-info';
export declare const NO_SEGMENT = -1;
/** Segments whose bounding box volume is above this value (relative to the overall bounding box) are considered as background segments */
export declare const BACKGROUND_SEGMENT_VOLUME_THRESHOLD = 0.5;
declare const MeshStreaming_base: {
    new (data: MeshStreaming.Behavior, props?: {
        label: string;
        description?: string;
    } | undefined): {
        id: UUID;
        type: PluginStateObject.TypeInfo;
        label: string;
        description?: string;
        data: MeshStreaming.Behavior;
    };
    type: PluginStateObject.TypeInfo;
    is(obj?: import("../../../mol-state").StateObject): obj is import("../../../mol-state").StateObject<MeshStreaming.Behavior, PluginStateObject.TypeInfo>;
};
export declare class MeshStreaming extends MeshStreaming_base {
}
export declare namespace MeshStreaming {
    namespace Params {
        const ViewTypeChoice: Choice<"all" | "select" | "off", "select">;
        type ViewType = Choice.Values<typeof ViewTypeChoice>;
        function create(options: MeshServerInfo.Data): {
            view: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
                detail: number;
            }>, "all"> | PD.NamedParams<PD.Normalize<{
                baseDetail: number;
                focusDetail: number;
                selectedSegment: number;
            }>, "select">>;
        };
        type Definition = ReturnType<typeof create>;
        type Values = PD.Values<Definition>;
        function copyValues(params: Values): Values;
        function valuesEqual(p: Values, q: Values): boolean;
        function detailsEqual(p: Values, q: Values): boolean;
    }
    interface VisualInfo {
        tag: string;
        segmentId: number;
        segmentName: string;
        detailType: VisualInfo.DetailType;
        detail: number;
        color: Color;
        visible: boolean;
        data?: MeshlistData;
    }
    namespace VisualInfo {
        type DetailType = 'low' | 'high';
        const DetailTypes: DetailType[];
        function tagFor(segmentId: number, detail: DetailType): string;
    }
    class Behavior extends PluginBehavior.WithSubscribers<Params.Values> {
        private id;
        private ref;
        parentData: MeshServerInfo.Data;
        private metadata?;
        visuals?: {
            [tag: string]: VisualInfo;
        };
        backgroundSegments: {
            [segmentId: number]: boolean;
        };
        private focusObservable;
        private focusSubscription?;
        private backgroundSegmentsInitialized;
        constructor(plugin: PluginContext, data: MeshServerInfo.Data, params: Params.Values);
        register(ref: string): void;
        unregister(): void;
        selectSegment(segmentId: number): void;
        update(params: Params.Values): Promise<boolean>;
        private getMetadataUrl;
        private getMeshUrl;
        private initVisualInfos;
        private updateVisualInfoDetails;
        private enableVisuals;
        private disableVisuals;
        /** Fetch data in current `visual.detail`, or return already fetched data (if available in the correct detail). */
        private getMeshData;
        private guessBackgroundSegments;
        getDescription(): string;
    }
}
export {};
