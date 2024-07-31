"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolsegMeshSegmentationData = void 0;
const misc_1 = require("../../mol-plugin-state/transforms/misc");
const representation_1 = require("../../mol-plugin-state/transforms/representation");
const state_1 = require("../../mol-plugin/behavior/static/state");
const commands_1 = require("../../mol-plugin/commands");
const color_1 = require("../../mol-util/color");
const names_1 = require("../../mol-util/color/names");
const behavior_1 = require("../meshes/mesh-streaming/behavior");
const mesh_extension_1 = require("../meshes/mesh-extension");
const DEFAULT_MESH_DETAIL = 5; // null means worst
class VolsegMeshSegmentationData {
    constructor(rootData) {
        this.entryData = rootData;
    }
    async loadSegmentation() {
        const hasMeshes = this.entryData.metadata.meshSegmentIds.length > 0;
        if (hasMeshes) {
            await this.showSegments(this.entryData.metadata.allSegmentIds);
        }
    }
    updateOpacity(opacity) {
        const visuals = this.entryData.findNodesByTags('mesh-segment-visual');
        const update = this.entryData.newUpdate();
        for (const visual of visuals) {
            update.to(visual).update(representation_1.ShapeRepresentation3D, p => { p.alpha = opacity; });
        }
        return update.commit();
    }
    async highlightSegment(segment) {
        const visuals = this.entryData.findNodesByTags('mesh-segment-visual', `segment-${segment.id}`);
        for (const visual of visuals) {
            await commands_1.PluginCommands.Interactivity.Object.Highlight(this.entryData.plugin, { state: this.entryData.plugin.state.data, ref: visual.transform.ref });
        }
    }
    async selectSegment(segment) {
        var _a;
        if (segment === undefined || segment < 0)
            return;
        const visuals = this.entryData.findNodesByTags('mesh-segment-visual', `segment-${segment}`);
        const reprNode = (_a = visuals[0]) === null || _a === void 0 ? void 0 : _a.obj;
        if (!reprNode)
            return;
        const loci = reprNode.data.repr.getAllLoci()[0];
        if (!loci)
            return;
        this.entryData.plugin.managers.interactivity.lociSelects.select({ loci: loci, repr: reprNode.data.repr }, false);
    }
    /** Make visible the specified set of mesh segments */
    async showSegments(segments) {
        var _a, _b, _c, _d;
        const segmentsToShow = new Set(segments);
        const visuals = this.entryData.findNodesByTags('mesh-segment-visual');
        for (const visual of visuals) {
            const theTag = (_b = (_a = visual.obj) === null || _a === void 0 ? void 0 : _a.tags) === null || _b === void 0 ? void 0 : _b.find(tag => tag.startsWith('segment-'));
            if (!theTag)
                continue;
            const id = parseInt(theTag.split('-')[1]);
            const visibility = segmentsToShow.has(id);
            (0, state_1.setSubtreeVisibility)(this.entryData.plugin.state.data, visual.transform.ref, !visibility); // true means hide, ¯\_(ツ)_/¯
            segmentsToShow.delete(id);
        }
        const segmentsToCreate = this.entryData.metadata.meshSegmentIds.filter(seg => segmentsToShow.has(seg));
        if (segmentsToCreate.length === 0)
            return;
        let group = (_c = this.entryData.findNodesByTags('mesh-segmentation-group')[0]) === null || _c === void 0 ? void 0 : _c.transform.ref;
        if (!group) {
            const newGroupNode = await this.entryData.newUpdate().apply(misc_1.CreateGroup, { label: 'Segmentation', description: 'Mesh' }, { tags: ['mesh-segmentation-group'], state: { isCollapsed: true } }).commit();
            group = newGroupNode.ref;
        }
        const totalVolume = this.entryData.metadata.gridTotalVolume;
        const awaiting = [];
        for (const seg of segmentsToCreate) {
            const segment = this.entryData.metadata.getSegment(seg);
            if (!segment)
                continue;
            const detail = this.entryData.metadata.getSufficientMeshDetail(seg, DEFAULT_MESH_DETAIL);
            const color = segment.colour.length >= 3 ? color_1.Color.fromNormalizedArray(segment.colour, 0) : names_1.ColorNames.gray;
            const url = this.entryData.api.meshUrl_Bcif(this.entryData.source, this.entryData.entryId, seg, detail);
            const label = (_d = segment.biological_annotation.name) !== null && _d !== void 0 ? _d : `Segment ${seg}`;
            const meshPromise = (0, mesh_extension_1.createMeshFromUrl)(this.entryData.plugin, url, seg, detail, true, color, group, behavior_1.BACKGROUND_SEGMENT_VOLUME_THRESHOLD * totalVolume, `<b>${label}</b>`, this.entryData.ref);
            awaiting.push(meshPromise);
        }
        for (const promise of awaiting)
            await promise;
    }
}
exports.VolsegMeshSegmentationData = VolsegMeshSegmentationData;
