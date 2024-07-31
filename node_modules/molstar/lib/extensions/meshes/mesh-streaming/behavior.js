/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { distinctUntilChanged, map } from 'rxjs';
import { CIF } from '../../../mol-io/reader/cif';
import { Box3D } from '../../../mol-math/geometry';
import { PluginStateObject } from '../../../mol-plugin-state/objects';
import { PluginBehavior } from '../../../mol-plugin/behavior';
import { PluginCommands } from '../../../mol-plugin/commands';
import { UUID } from '../../../mol-util';
import { Asset } from '../../../mol-util/assets';
import { ColorNames } from '../../../mol-util/color/names';
import { Choice } from '../../../mol-util/param-choice';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { MetadataWrapper } from '../../volumes-and-segmentations/volseg-api/utils';
import { MeshlistData } from '../mesh-extension';
const DEFAULT_SEGMENT_NAME = 'Untitled segment';
const DEFAULT_SEGMENT_COLOR = ColorNames.lightgray;
export const NO_SEGMENT = -1;
/** Maximum (worst) detail level available in GUI (TODO set actual maximum possible value) */
const MAX_DETAIL = 10;
const DEFAULT_DETAIL = 7; // TODO decide a reasonable default
/** Segments whose bounding box volume is above this value (relative to the overall bounding box) are considered as background segments */
export const BACKGROUND_SEGMENT_VOLUME_THRESHOLD = 0.5;
export class MeshStreaming extends PluginStateObject.CreateBehavior({ name: 'Mesh Streaming' }) {
}
(function (MeshStreaming) {
    let Params;
    (function (Params) {
        Params.ViewTypeChoice = new Choice({ off: 'Off', select: 'Select', all: 'All' }, 'select'); // TODO add camera target?
        function create(options) {
            return {
                view: PD.MappedStatic('select', {
                    'off': PD.Group({}),
                    'select': PD.Group({
                        baseDetail: PD.Numeric(DEFAULT_DETAIL, { min: 1, max: MAX_DETAIL, step: 1 }, { description: 'Detail level for the non-selected segments (lower number = better)' }),
                        focusDetail: PD.Numeric(1, { min: 1, max: MAX_DETAIL, step: 1 }, { description: 'Detail level for the selected segment (lower number = better)' }),
                        selectedSegment: PD.Numeric(NO_SEGMENT, {}, { isHidden: true }),
                    }, { isFlat: true }),
                    'all': PD.Group({
                        detail: PD.Numeric(DEFAULT_DETAIL, { min: 1, max: MAX_DETAIL, step: 1 }, { description: 'Detail level for all segments (lower number = better)' })
                    }, { isFlat: true }),
                }, { description: '"Off" hides all segments. \n"Select" shows all segments in lower detail, clicked segment in better detail. "All" shows all segment in the same level.' }),
            };
        }
        Params.create = create;
        function copyValues(params) {
            return {
                view: {
                    name: params.view.name,
                    params: { ...params.view.params },
                }
            };
        }
        Params.copyValues = copyValues;
        function valuesEqual(p, q) {
            if (p.view.name !== q.view.name)
                return false;
            for (const key in p.view.params) {
                if (p.view.params[key] !== q.view.params[key])
                    return false;
            }
            return true;
        }
        Params.valuesEqual = valuesEqual;
        function detailsEqual(p, q) {
            switch (p.view.name) {
                case 'off':
                    return q.view.name === 'off';
                case 'select':
                    return q.view.name === 'select' && p.view.params.baseDetail === q.view.params.baseDetail && p.view.params.focusDetail === q.view.params.focusDetail;
                case 'all':
                    return q.view.name === 'all' && p.view.params.detail === q.view.params.detail;
                default:
                    throw new Error('Not implemented');
            }
        }
        Params.detailsEqual = detailsEqual;
    })(Params = MeshStreaming.Params || (MeshStreaming.Params = {}));
    let VisualInfo;
    (function (VisualInfo) {
        VisualInfo.DetailTypes = ['low', 'high'];
        function tagFor(segmentId, detail) {
            return `${detail}-${segmentId}`;
        }
        VisualInfo.tagFor = tagFor;
    })(VisualInfo = MeshStreaming.VisualInfo || (MeshStreaming.VisualInfo = {}));
    class Behavior extends PluginBehavior.WithSubscribers {
        constructor(plugin, data, params) {
            super(plugin, params);
            this.ref = '';
            this.backgroundSegments = {};
            this.focusObservable = this.plugin.behaviors.interaction.click.pipe(// QUESTION is this OK way to get focused segment?
            map(evt => evt.current.loci), map(loci => (loci.kind === 'group-loci') ? loci.shape.sourceData : null), map(data => ((data === null || data === void 0 ? void 0 : data.ownerId) === this.id) ? data : null), // do not process shapes created by others
            distinctUntilChanged((old, current) => (old === null || old === void 0 ? void 0 : old.segmentId) === (current === null || current === void 0 ? void 0 : current.segmentId)));
            this.focusSubscription = undefined;
            this.backgroundSegmentsInitialized = false;
            this.id = UUID.create22();
            this.parentData = data;
        }
        register(ref) {
            this.ref = ref;
        }
        unregister() {
            if (this.focusSubscription) {
                this.focusSubscription.unsubscribe();
                this.focusSubscription = undefined;
            }
            // TODO empty cache here (if used)
        }
        selectSegment(segmentId) {
            if (this.params.view.name === 'select') {
                if (this.params.view.params.selectedSegment === segmentId)
                    return;
                const newParams = Params.copyValues(this.params);
                if (newParams.view.name === 'select') {
                    newParams.view.params.selectedSegment = segmentId;
                }
                const state = this.plugin.state.data;
                const update = state.build().to(this.ref).update(newParams);
                PluginCommands.State.Update(this.plugin, { state, tree: update, options: { doNotUpdateCurrent: true } });
            }
        }
        async update(params) {
            const oldParams = this.params;
            this.params = params;
            if (!this.metadata) {
                const response = await fetch(this.getMetadataUrl());
                const rawMetadata = await response.json();
                this.metadata = new MetadataWrapper(rawMetadata);
            }
            if (!this.visuals) {
                this.initVisualInfos();
            }
            else if (!Params.detailsEqual(this.params, oldParams)) {
                this.updateVisualInfoDetails();
            }
            switch (params.view.name) {
                case 'off':
                    await this.disableVisuals();
                    break;
                case 'select':
                    await this.enableVisuals(params.view.params.selectedSegment);
                    break;
                case 'all':
                    await this.enableVisuals();
                    break;
                default:
                    throw new Error('Not implemented');
            }
            if (params.view.name !== 'off' && !this.backgroundSegmentsInitialized) {
                this.guessBackgroundSegments();
                this.backgroundSegmentsInitialized = true;
            }
            if (params.view.name === 'select' && !this.focusSubscription) {
                this.focusSubscription = this.subscribeObservable(this.focusObservable, data => { var _a; this.selectSegment((_a = data === null || data === void 0 ? void 0 : data.segmentId) !== null && _a !== void 0 ? _a : NO_SEGMENT); });
            }
            else if (params.view.name !== 'select' && this.focusSubscription) {
                this.focusSubscription.unsubscribe();
                this.focusSubscription = undefined;
            }
            return true;
        }
        getMetadataUrl() {
            return `${this.parentData.serverUrl}/${this.parentData.source}/${this.parentData.entryId}/metadata`;
        }
        getMeshUrl(segment, detail) {
            return `${this.parentData.serverUrl}/${this.parentData.source}/${this.parentData.entryId}/mesh_bcif/${segment}/${detail}`;
        }
        initVisualInfos() {
            var _a, _b, _c, _d, _e;
            const visuals = {};
            for (const segid of this.metadata.meshSegmentIds) {
                const name = (_c = (_b = (_a = this.metadata) === null || _a === void 0 ? void 0 : _a.getSegment(segid)) === null || _b === void 0 ? void 0 : _b.biological_annotation.name) !== null && _c !== void 0 ? _c : DEFAULT_SEGMENT_NAME;
                const color = (_e = (_d = this.metadata) === null || _d === void 0 ? void 0 : _d.getSegmentColor(segid)) !== null && _e !== void 0 ? _e : DEFAULT_SEGMENT_COLOR;
                for (const detailType of VisualInfo.DetailTypes) {
                    const visual = {
                        tag: VisualInfo.tagFor(segid, detailType),
                        segmentId: segid,
                        segmentName: name,
                        detailType: detailType,
                        detail: -1, // to be set at the end
                        color: color,
                        visible: false,
                        data: undefined,
                    };
                    visuals[visual.tag] = visual;
                }
            }
            this.visuals = visuals;
            this.updateVisualInfoDetails();
        }
        updateVisualInfoDetails() {
            let highDetail;
            let lowDetail;
            switch (this.params.view.name) {
                case 'off':
                    lowDetail = undefined;
                    highDetail = undefined;
                    break;
                case 'select':
                    lowDetail = this.params.view.params.baseDetail;
                    highDetail = this.params.view.params.focusDetail;
                    break;
                case 'all':
                    lowDetail = this.params.view.params.detail;
                    highDetail = undefined;
                    break;
            }
            for (const tag in this.visuals) {
                const visual = this.visuals[tag];
                const preferredDetail = (visual.detailType === 'high') ? highDetail : lowDetail;
                if (preferredDetail !== undefined) {
                    visual.detail = this.metadata.getSufficientMeshDetail(visual.segmentId, preferredDetail);
                }
            }
        }
        async enableVisuals(highDetailSegment) {
            for (const tag in this.visuals) {
                const visual = this.visuals[tag];
                const requiredDetailType = visual.segmentId === highDetailSegment ? 'high' : 'low';
                if (visual.detailType === requiredDetailType) {
                    visual.data = await this.getMeshData(visual);
                    visual.visible = true;
                }
                else {
                    visual.visible = false;
                }
            }
        }
        async disableVisuals() {
            for (const tag in this.visuals) {
                const visual = this.visuals[tag];
                visual.visible = false;
            }
        }
        /** Fetch data in current `visual.detail`, or return already fetched data (if available in the correct detail). */
        async getMeshData(visual) {
            if (visual.data && visual.data.detail === visual.detail) {
                // Do not recreate
                return visual.data;
            }
            // TODO cache
            const url = this.getMeshUrl(visual.segmentId, visual.detail);
            const urlAsset = Asset.getUrlAsset(this.plugin.managers.asset, url);
            const asset = await this.plugin.runTask(this.plugin.managers.asset.resolve(urlAsset, 'binary'));
            const parsed = await this.plugin.runTask(CIF.parseBinary(asset.data));
            if (parsed.isError) {
                throw new Error(`Failed parsing CIF file from ${url}`);
            }
            const meshlistData = await MeshlistData.fromCIF(parsed.result, visual.segmentId, visual.segmentName, visual.detail);
            meshlistData.ownerId = this.id;
            // const bbox = MeshlistData.bbox(meshlistData);
            // const bboxVolume = bbox ? MS.Box3D.volume(bbox) : 0.0;
            // console.log(`BBox ${visual.segmentId}: ${Math.round(bboxVolume! / 1e6)} M`, bbox); // DEBUG
            return meshlistData;
        }
        async guessBackgroundSegments() {
            const bboxes = {};
            for (const tag in this.visuals) {
                const visual = this.visuals[tag];
                if (visual.detailType === 'low' && visual.data) {
                    const bbox = MeshlistData.bbox(visual.data);
                    if (bbox) {
                        bboxes[visual.segmentId] = bbox;
                    }
                }
            }
            const totalBbox = MeshlistData.combineBBoxes(Object.values(bboxes));
            const totalVolume = totalBbox ? Box3D.volume(totalBbox) : 0.0;
            // console.log(`BBox total: ${Math.round(totalVolume! / 1e6)} M`, totalBbox); // DEBUG
            const isBgSegment = {};
            for (const segid in bboxes) {
                const bbox = bboxes[segid];
                const bboxVolume = Box3D.volume(bbox);
                isBgSegment[segid] = (bboxVolume > totalVolume * BACKGROUND_SEGMENT_VOLUME_THRESHOLD);
                // console.log(`BBox ${segid}: ${Math.round(bboxVolume! / 1e6)} M, ${bboxVolume / totalVolume}`, bbox); // DEBUG
            }
            this.backgroundSegments = isBgSegment;
        }
        getDescription() {
            return Params.ViewTypeChoice.prettyName(this.params.view.name);
        }
    }
    MeshStreaming.Behavior = Behavior;
})(MeshStreaming || (MeshStreaming = {}));
