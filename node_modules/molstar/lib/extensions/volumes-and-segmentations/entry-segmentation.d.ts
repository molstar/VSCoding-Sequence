/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { Segment } from './volseg-api/data';
import { VolsegEntryData } from './entry-root';
export declare class VolsegLatticeSegmentationData {
    private entryData;
    constructor(rootData: VolsegEntryData);
    loadSegmentation(): Promise<void>;
    private createPalette;
    updateOpacity(opacity: number): Promise<import("../../mol-state").StateObjectSelector<import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, import("../../mol-state").StateTransformer<import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, import("../../mol-state").StateObject<any, import("../../mol-state").StateObject.Type<any>>, any>>>;
    private makeLoci;
    highlightSegment(segment: Segment): Promise<void>;
    selectSegment(segment?: number): Promise<void>;
    /** Make visible the specified set of lattice segments */
    showSegments(segments: number[]): Promise<void>;
    setTryUseGpu(tryUseGpu: boolean): Promise<void>;
}
