"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataWrapper = void 0;
const color_1 = require("../../../mol-util/color");
class MetadataWrapper {
    constructor(rawMetadata) {
        this.raw = rawMetadata;
    }
    get allSegments() {
        var _a, _b;
        return (_b = (_a = this.raw.annotation) === null || _a === void 0 ? void 0 : _a.segment_list) !== null && _b !== void 0 ? _b : [];
    }
    get allSegmentIds() {
        return this.allSegments.map(segment => segment.id);
    }
    getSegment(segmentId) {
        if (!this.segmentMap) {
            this.segmentMap = {};
            for (const segment of this.allSegments) {
                this.segmentMap[segment.id] = segment;
            }
        }
        return this.segmentMap[segmentId];
    }
    getSegmentColor(segmentId) {
        var _a;
        const colorArray = (_a = this.getSegment(segmentId)) === null || _a === void 0 ? void 0 : _a.colour;
        return colorArray ? color_1.Color.fromNormalizedArray(colorArray, 0) : undefined;
    }
    /** Get the list of detail levels available for the given mesh segment. */
    getMeshDetailLevels(segmentId) {
        const segmentIds = this.raw.grid.segmentation_meshes.mesh_component_numbers.segment_ids;
        if (!segmentIds)
            return [];
        const details = segmentIds[segmentId].detail_lvls;
        return Object.keys(details).map(s => parseInt(s));
    }
    /** Get the worst available detail level that is not worse than preferredDetail.
     * If preferredDetail is null, get the worst detail level overall.
     * (worse = greater number) */
    getSufficientMeshDetail(segmentId, preferredDetail) {
        let availDetails = this.getMeshDetailLevels(segmentId);
        if (preferredDetail !== null) {
            availDetails = availDetails.filter(det => det <= preferredDetail);
        }
        return Math.max(...availDetails);
    }
    /** IDs of all segments available as meshes */
    get meshSegmentIds() {
        const segmentIds = this.raw.grid.segmentation_meshes.mesh_component_numbers.segment_ids;
        if (!segmentIds)
            return [];
        return Object.keys(segmentIds).map(s => parseInt(s));
    }
    get gridTotalVolume() {
        const [vx, vy, vz] = this.raw.grid.volumes.voxel_size[1];
        const [gx, gy, gz] = this.raw.grid.volumes.grid_dimensions;
        return vx * vy * vz * gx * gy * gz;
    }
}
exports.MetadataWrapper = MetadataWrapper;
