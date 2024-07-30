/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { Color } from '../../../mol-util/color';
import { Metadata, Segment } from './data';
export declare class MetadataWrapper {
    raw: Metadata;
    private segmentMap?;
    constructor(rawMetadata: Metadata);
    get allSegments(): Segment[];
    get allSegmentIds(): number[];
    getSegment(segmentId: number): Segment | undefined;
    getSegmentColor(segmentId: number): Color | undefined;
    /** Get the list of detail levels available for the given mesh segment. */
    getMeshDetailLevels(segmentId: number): number[];
    /** Get the worst available detail level that is not worse than preferredDetail.
     * If preferredDetail is null, get the worst detail level overall.
     * (worse = greater number) */
    getSufficientMeshDetail(segmentId: number, preferredDetail: number | null): number;
    /** IDs of all segments available as meshes */
    get meshSegmentIds(): number[];
    get gridTotalVolume(): number;
}
