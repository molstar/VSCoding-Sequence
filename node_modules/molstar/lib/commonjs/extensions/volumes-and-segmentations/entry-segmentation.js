"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolsegLatticeSegmentationData = void 0;
const volume_1 = require("../../mol-model/volume");
const volume_representation_params_1 = require("../../mol-plugin-state/helpers/volume-representation-params");
const transforms_1 = require("../../mol-plugin-state/transforms");
const data_1 = require("../../mol-plugin-state/transforms/data");
const misc_1 = require("../../mol-plugin-state/transforms/misc");
const volume_2 = require("../../mol-plugin-state/transforms/volume");
const commands_1 = require("../../mol-plugin/commands");
const color_1 = require("../../mol-util/color");
const entry_root_1 = require("./entry-root");
const global_state_1 = require("./global-state");
const GROUP_TAG = 'lattice-segmentation-group';
const SEGMENT_VISUAL_TAG = 'lattice-segment-visual';
const DEFAULT_SEGMENT_COLOR = color_1.Color.fromNormalizedRgb(0.8, 0.8, 0.8);
class VolsegLatticeSegmentationData {
    constructor(rootData) {
        this.entryData = rootData;
    }
    async loadSegmentation() {
        var _a, _b, _c;
        const hasLattices = this.entryData.metadata.raw.grid.segmentation_lattices.segmentation_lattice_ids.length > 0;
        if (hasLattices) {
            const url = this.entryData.api.latticeUrl(this.entryData.source, this.entryData.entryId, 0, entry_root_1.BOX, entry_root_1.MAX_VOXELS);
            let group = (_a = this.entryData.findNodesByTags(GROUP_TAG)[0]) === null || _a === void 0 ? void 0 : _a.transform.ref;
            if (!group) {
                const newGroupNode = await this.entryData.newUpdate().apply(misc_1.CreateGroup, { label: 'Segmentation', description: 'Lattice' }, { tags: [GROUP_TAG], state: { isCollapsed: true } }).commit();
                group = newGroupNode.ref;
            }
            const segmentLabels = this.entryData.metadata.allSegments.map(seg => ({ id: seg.id, label: seg.biological_annotation.name ? `<b>${seg.biological_annotation.name}</b>` : '' }));
            const volumeNode = await this.entryData.newUpdate().to(group)
                .apply(data_1.Download, { url, isBinary: true, label: `Segmentation Data: ${url}` })
                .apply(data_1.ParseCif)
                .apply(volume_2.VolumeFromSegmentationCif, { blockHeader: 'SEGMENTATION_DATA', segmentLabels: segmentLabels, ownerId: this.entryData.ref })
                .commit();
            const volumeData = volumeNode.data;
            const segmentation = volume_1.Volume.Segmentation.get(volumeData);
            const segmentIds = Array.from((_b = segmentation === null || segmentation === void 0 ? void 0 : segmentation.segments.keys()) !== null && _b !== void 0 ? _b : []);
            await this.entryData.newUpdate().to(volumeNode)
                .apply(transforms_1.StateTransforms.Representation.VolumeRepresentation3D, (0, volume_representation_params_1.createVolumeRepresentationParams)(this.entryData.plugin, volumeData, {
                type: 'segment',
                typeParams: { tryUseGpu: (_c = global_state_1.VolsegGlobalStateData.getGlobalState(this.entryData.plugin)) === null || _c === void 0 ? void 0 : _c.tryUseGpu },
                color: 'volume-segment',
                colorParams: { palette: this.createPalette(segmentIds) },
            }), { tags: [SEGMENT_VISUAL_TAG] }).commit();
        }
    }
    createPalette(segmentIds) {
        const colorMap = new Map();
        for (const segment of this.entryData.metadata.allSegments) {
            const color = color_1.Color.fromNormalizedArray(segment.colour, 0);
            colorMap.set(segment.id, color);
        }
        if (colorMap.size === 0)
            return undefined;
        for (const segid of segmentIds) {
            colorMap.get(segid);
        }
        const colors = segmentIds.map(segid => { var _a; return (_a = colorMap.get(segid)) !== null && _a !== void 0 ? _a : DEFAULT_SEGMENT_COLOR; });
        return { name: 'colors', params: { list: { kind: 'set', colors: colors } } };
    }
    async updateOpacity(opacity) {
        const reprs = this.entryData.findNodesByTags(SEGMENT_VISUAL_TAG);
        const update = this.entryData.newUpdate();
        for (const s of reprs) {
            update.to(s).update(transforms_1.StateTransforms.Representation.VolumeRepresentation3D, p => { p.type.params.alpha = opacity; });
        }
        return await update.commit();
    }
    makeLoci(segments) {
        var _a;
        const vis = this.entryData.findNodesByTags(SEGMENT_VISUAL_TAG)[0];
        if (!vis)
            return undefined;
        const repr = (_a = vis.obj) === null || _a === void 0 ? void 0 : _a.data.repr;
        const wholeLoci = repr.getAllLoci()[0];
        if (!wholeLoci || !volume_1.Volume.Segment.isLoci(wholeLoci))
            return undefined;
        return { loci: volume_1.Volume.Segment.Loci(wholeLoci.volume, segments), repr: repr };
    }
    async highlightSegment(segment) {
        const segmentLoci = this.makeLoci([segment.id]);
        if (!segmentLoci)
            return;
        this.entryData.plugin.managers.interactivity.lociHighlights.highlight(segmentLoci, false);
    }
    async selectSegment(segment) {
        if (segment === undefined || segment < 0)
            return;
        const segmentLoci = this.makeLoci([segment]);
        if (!segmentLoci)
            return;
        this.entryData.plugin.managers.interactivity.lociSelects.select(segmentLoci, false);
    }
    /** Make visible the specified set of lattice segments */
    async showSegments(segments) {
        var _a;
        const repr = this.entryData.findNodesByTags(SEGMENT_VISUAL_TAG)[0];
        if (!repr)
            return;
        const selectedSegment = this.entryData.currentState.value.selectedSegment;
        const mustReselect = segments.includes(selectedSegment) && !((_a = repr.params) === null || _a === void 0 ? void 0 : _a.values.type.params.segments.includes(selectedSegment));
        const update = this.entryData.newUpdate();
        update.to(repr).update(transforms_1.StateTransforms.Representation.VolumeRepresentation3D, p => { p.type.params.segments = segments; });
        await update.commit();
        if (mustReselect) {
            await this.selectSegment(this.entryData.currentState.value.selectedSegment);
        }
    }
    async setTryUseGpu(tryUseGpu) {
        const visuals = this.entryData.findNodesByTags(SEGMENT_VISUAL_TAG);
        for (const visual of visuals) {
            const oldParams = visual.transform.params;
            if (oldParams.type.params.tryUseGpu === !tryUseGpu) {
                const newParams = { ...oldParams, type: { ...oldParams.type, params: { ...oldParams.type.params, tryUseGpu: tryUseGpu } } };
                const update = this.entryData.newUpdate().to(visual.transform.ref).update(newParams);
                await commands_1.PluginCommands.State.Update(this.entryData.plugin, { state: this.entryData.plugin.state.data, tree: update, options: { doNotUpdateCurrent: true } });
            }
        }
    }
}
exports.VolsegLatticeSegmentationData = VolsegLatticeSegmentationData;
