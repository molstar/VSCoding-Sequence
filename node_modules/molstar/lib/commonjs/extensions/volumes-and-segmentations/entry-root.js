"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolsegEntryData = exports.VolsegEntry = exports.VolsegEntryParamValues = exports.BOX = exports.MAX_VOXELS = void 0;
exports.createLoadVolsegParams = createLoadVolsegParams;
exports.createVolsegEntryParams = createVolsegEntryParams;
const tslib_1 = require("tslib");
const rxjs_1 = require("rxjs");
const _1 = require(".");
const shape_1 = require("../../mol-model/shape");
const volume_1 = require("../../mol-model/volume");
const objects_1 = require("../../mol-plugin-state/objects");
const behavior_1 = require("../../mol-plugin/behavior");
const commands_1 = require("../../mol-plugin/commands");
const mol_state_1 = require("../../mol-state");
const mol_util_1 = require("../../mol-util");
const param_choice_1 = require("../../mol-util/param-choice");
const param_definition_1 = require("../../mol-util/param-definition");
const api_1 = require("./volseg-api/api");
const utils_1 = require("./volseg-api/utils");
const entry_meshes_1 = require("./entry-meshes");
const entry_models_1 = require("./entry-models");
const entry_segmentation_1 = require("./entry-segmentation");
const entry_state_1 = require("./entry-state");
const entry_volume_1 = require("./entry-volume");
const ExternalAPIs = tslib_1.__importStar(require("./external-api"));
const global_state_1 = require("./global-state");
const helpers_1 = require("./helpers");
exports.MAX_VOXELS = 10 ** 7;
// export const MAX_VOXELS = 10 ** 2; // DEBUG
exports.BOX = null;
// export const BOX: [[number, number, number], [number, number, number]] | null = [[-90, -90, -90], [90, 90, 90]]; // DEBUG
const MAX_ANNOTATIONS_IN_LABEL = 6;
const SourceChoice = new param_choice_1.Choice({ emdb: 'EMDB', empiar: 'EMPIAR', idr: 'IDR' }, 'emdb');
function createLoadVolsegParams(plugin, entrylists = {}) {
    var _a;
    const defaultVolumeServer = (_a = plugin === null || plugin === void 0 ? void 0 : plugin.config.get(_1.VolsegVolumeServerConfig.DefaultServer)) !== null && _a !== void 0 ? _a : api_1.DEFAULT_VOLSEG_SERVER;
    return {
        serverUrl: param_definition_1.ParamDefinition.Text(defaultVolumeServer),
        source: param_definition_1.ParamDefinition.Mapped(SourceChoice.values[0], SourceChoice.options, src => entryParam(entrylists[src])),
    };
}
function entryParam(entries = []) {
    const options = entries.map(e => [e, e]);
    options.push(['__custom__', 'Custom']);
    return param_definition_1.ParamDefinition.Group({
        entryId: param_definition_1.ParamDefinition.Select(options[0][0], options, { description: 'Choose an entry from the list, or choose "Custom" and type any entry ID (useful when using other than default server).' }),
        customEntryId: param_definition_1.ParamDefinition.Text('', { hideIf: p => p.entryId !== '__custom__', description: 'Entry identifier, including the source prefix, e.g. "emd-1832"' }),
    }, { isFlat: true });
}
function createVolsegEntryParams(plugin) {
    var _a;
    const defaultVolumeServer = (_a = plugin === null || plugin === void 0 ? void 0 : plugin.config.get(_1.VolsegVolumeServerConfig.DefaultServer)) !== null && _a !== void 0 ? _a : api_1.DEFAULT_VOLSEG_SERVER;
    return {
        serverUrl: param_definition_1.ParamDefinition.Text(defaultVolumeServer),
        source: SourceChoice.PDSelect(),
        entryId: param_definition_1.ParamDefinition.Text('emd-1832', { description: 'Entry identifier, including the source prefix, e.g. "emd-1832"' }),
    };
}
var VolsegEntryParamValues;
(function (VolsegEntryParamValues) {
    function fromLoadVolsegParamValues(params) {
        let entryId = params.source.params.entryId;
        if (entryId === '__custom__') {
            entryId = params.source.params.customEntryId;
        }
        return {
            serverUrl: params.serverUrl,
            source: params.source.name,
            entryId: entryId
        };
    }
    VolsegEntryParamValues.fromLoadVolsegParamValues = fromLoadVolsegParamValues;
})(VolsegEntryParamValues || (exports.VolsegEntryParamValues = VolsegEntryParamValues = {}));
class VolsegEntry extends objects_1.PluginStateObject.CreateBehavior({ name: 'Vol & Seg Entry' }) {
}
exports.VolsegEntry = VolsegEntry;
class VolsegEntryData extends behavior_1.PluginBehavior.WithSubscribers {
    constructor(plugin, params) {
        super(plugin, params);
        this.ref = '';
        this.volumeData = new entry_volume_1.VolsegVolumeData(this);
        this.latticeSegmentationData = new entry_segmentation_1.VolsegLatticeSegmentationData(this);
        this.meshSegmentationData = new entry_meshes_1.VolsegMeshSegmentationData(this);
        this.modelData = new entry_models_1.VolsegModelData(this);
        this.highlightRequest = new rxjs_1.Subject();
        this.getStateNode = (0, helpers_1.lazyGetter)(() => this.plugin.state.data.selectQ(q => q.byRef(this.ref).subtree().ofType(entry_state_1.VolsegState))[0], 'Missing VolsegState node. Must first create VolsegState for this VolsegEntry.');
        this.currentState = new rxjs_1.BehaviorSubject(param_definition_1.ParamDefinition.getDefaultValues(entry_state_1.VolsegStateParams));
        this.currentVolume = new rxjs_1.BehaviorSubject(undefined);
        this.labelProvider = {
            label: (loci) => {
                const segmentId = this.getSegmentIdFromLoci(loci);
                if (segmentId === undefined)
                    return;
                const segment = this.metadata.getSegment(segmentId);
                if (!segment)
                    return;
                const annotLabels = segment.biological_annotation.external_references.map(annot => `${(0, helpers_1.applyEllipsis)(annot.label)} [${annot.resource}:${annot.accession}]`);
                if (annotLabels.length === 0)
                    return;
                if (annotLabels.length > MAX_ANNOTATIONS_IN_LABEL + 1) {
                    const nHidden = annotLabels.length - MAX_ANNOTATIONS_IN_LABEL;
                    annotLabels.length = MAX_ANNOTATIONS_IN_LABEL;
                    annotLabels.push(`(${nHidden} more annotations, click on the segment to see all)`);
                }
                return '<hr class="msp-highlight-info-hr"/>' + annotLabels.filter(helpers_1.isDefined).join('<br/>');
            }
        };
        this.plugin = plugin;
        this.api = new api_1.VolumeApiV2(params.serverUrl);
        this.source = params.source;
        this.entryId = params.entryId;
        this.entryNumber = (0, helpers_1.splitEntryId)(this.entryId).entryNumber;
    }
    async initialize() {
        var _a;
        const metadata = await this.api.getMetadata(this.source, this.entryId);
        this.metadata = new utils_1.MetadataWrapper(metadata);
        this.pdbs = await ExternalAPIs.getPdbIdsForEmdbEntry((_a = this.metadata.raw.grid.general.source_db_id) !== null && _a !== void 0 ? _a : this.entryId);
        // TODO use Asset?
    }
    static async create(plugin, params) {
        const result = new VolsegEntryData(plugin, params);
        await result.initialize();
        return result;
    }
    async register(ref) {
        var _a;
        this.ref = ref;
        this.plugin.managers.lociLabels.addProvider(this.labelProvider);
        try {
            const params = (_a = this.getStateNode().obj) === null || _a === void 0 ? void 0 : _a.data;
            if (params) {
                this.currentState.next(params);
            }
        }
        catch (_b) {
            // do nothing
        }
        const volumeVisual = this.findNodesByTags(entry_volume_1.VOLUME_VISUAL_TAG)[0];
        if (volumeVisual)
            this.currentVolume.next(volumeVisual.transform);
        let volumeRef;
        this.subscribeObservable(this.plugin.state.data.events.cell.stateUpdated, e => {
            var _a, _b;
            try {
                (this.getStateNode());
            }
            catch (_c) {
                return;
            } // if state not does not exist yet
            if (e.cell.transform.ref === this.getStateNode().transform.ref) {
                const newState = (_a = this.getStateNode().obj) === null || _a === void 0 ? void 0 : _a.data;
                if (newState && !(0, mol_util_1.shallowEqualObjects)(newState, this.currentState.value)) { // avoid repeated update
                    this.currentState.next(newState);
                }
            }
            else if ((_b = e.cell.transform.tags) === null || _b === void 0 ? void 0 : _b.includes(entry_volume_1.VOLUME_VISUAL_TAG)) {
                if (e.ref === volumeRef) {
                    this.currentVolume.next(e.cell.transform);
                }
                else if (mol_state_1.StateSelection.findAncestor(this.plugin.state.data.tree, this.plugin.state.data.cells, e.ref, a => a.transform.ref === ref)) {
                    volumeRef = e.ref;
                    this.currentVolume.next(e.cell.transform);
                }
            }
        });
        this.subscribeObservable(this.plugin.state.data.events.cell.removed, e => {
            if (e.ref === volumeRef) {
                volumeRef = undefined;
                this.currentVolume.next(undefined);
            }
        });
        this.subscribeObservable(this.plugin.behaviors.interaction.click, async (e) => {
            const loci = e.current.loci;
            const clickedSegment = this.getSegmentIdFromLoci(loci);
            if (clickedSegment === undefined)
                return;
            if (clickedSegment === this.currentState.value.selectedSegment) {
                this.actionSelectSegment(undefined);
            }
            else {
                this.actionSelectSegment(clickedSegment);
            }
        });
        this.subscribeObservable(this.highlightRequest.pipe((0, rxjs_1.throttleTime)(50, undefined, { leading: true, trailing: true })), async (segment) => await this.highlightSegment(segment));
        this.subscribeObservable(this.currentState.pipe((0, rxjs_1.distinctUntilChanged)((a, b) => a.selectedSegment === b.selectedSegment)), async (state) => {
            var _a;
            if ((_a = global_state_1.VolsegGlobalStateData.getGlobalState(this.plugin)) === null || _a === void 0 ? void 0 : _a.selectionMode)
                await this.selectSegment(state.selectedSegment);
        });
    }
    async unregister() {
        this.plugin.managers.lociLabels.removeProvider(this.labelProvider);
    }
    async loadVolume() {
        const result = await this.volumeData.loadVolume();
        if (result) {
            const isovalue = result.isovalue.kind === 'relative' ? result.isovalue.relativeValue : result.isovalue.absoluteValue;
            await this.updateStateNode({ volumeIsovalueKind: result.isovalue.kind, volumeIsovalueValue: isovalue });
        }
    }
    async loadSegmentations() {
        await this.latticeSegmentationData.loadSegmentation();
        await this.meshSegmentationData.loadSegmentation();
        await this.actionShowSegments(this.metadata.allSegmentIds);
    }
    actionHighlightSegment(segment) {
        this.highlightRequest.next(segment);
    }
    async actionToggleSegment(segment) {
        const current = this.currentState.value.visibleSegments.map(seg => seg.segmentId);
        if (current.includes(segment)) {
            await this.actionShowSegments(current.filter(s => s !== segment));
        }
        else {
            await this.actionShowSegments([...current, segment]);
        }
    }
    async actionToggleAllSegments() {
        const current = this.currentState.value.visibleSegments.map(seg => seg.segmentId);
        if (current.length !== this.metadata.allSegments.length) {
            await this.actionShowSegments(this.metadata.allSegmentIds);
        }
        else {
            await this.actionShowSegments([]);
        }
    }
    async actionSelectSegment(segment) {
        if (segment !== undefined && this.currentState.value.visibleSegments.find(s => s.segmentId === segment) === undefined) {
            // first make the segment visible if it is not
            await this.actionToggleSegment(segment);
        }
        await this.updateStateNode({ selectedSegment: segment });
    }
    async actionSetOpacity(opacity) {
        var _a;
        if (opacity === ((_a = this.getStateNode().obj) === null || _a === void 0 ? void 0 : _a.data.segmentOpacity))
            return;
        this.latticeSegmentationData.updateOpacity(opacity);
        this.meshSegmentationData.updateOpacity(opacity);
        await this.updateStateNode({ segmentOpacity: opacity });
    }
    async actionShowFittedModel(pdbIds) {
        await this.modelData.showPdbs(pdbIds);
        await this.updateStateNode({ visibleModels: pdbIds.map(pdbId => ({ pdbId: pdbId })) });
    }
    async actionSetVolumeVisual(type) {
        await this.volumeData.setVolumeVisual(type);
        await this.updateStateNode({ volumeType: type });
    }
    async actionUpdateVolumeVisual(params) {
        await this.volumeData.updateVolumeVisual(params);
        await this.updateStateNode({
            volumeType: params.volumeType,
            volumeOpacity: params.opacity,
        });
    }
    async actionShowSegments(segments) {
        await this.latticeSegmentationData.showSegments(segments);
        await this.meshSegmentationData.showSegments(segments);
        await this.updateStateNode({ visibleSegments: segments.map(s => ({ segmentId: s })) });
    }
    async highlightSegment(segment) {
        await commands_1.PluginCommands.Interactivity.ClearHighlights(this.plugin);
        if (segment) {
            await this.latticeSegmentationData.highlightSegment(segment);
            await this.meshSegmentationData.highlightSegment(segment);
        }
    }
    async selectSegment(segment) {
        this.plugin.managers.interactivity.lociSelects.deselectAll();
        await this.latticeSegmentationData.selectSegment(segment);
        await this.meshSegmentationData.selectSegment(segment);
        await this.highlightSegment();
    }
    async updateStateNode(params) {
        const oldParams = this.getStateNode().transform.params;
        const newParams = { ...oldParams, ...params };
        const state = this.plugin.state.data;
        const update = state.build().to(this.getStateNode().transform.ref).update(newParams);
        await commands_1.PluginCommands.State.Update(this.plugin, { state, tree: update, options: { doNotUpdateCurrent: true } });
    }
    /** Find the nodes under this entry root which have all of the given tags. */
    findNodesByTags(...tags) {
        return this.plugin.state.data.selectQ(q => {
            let builder = q.byRef(this.ref).subtree();
            for (const tag of tags)
                builder = builder.withTag(tag);
            return builder;
        });
    }
    newUpdate() {
        if (this.ref !== '') {
            return this.plugin.build().to(this.ref);
        }
        else {
            return this.plugin.build().toRoot();
        }
    }
    getSegmentIdFromLoci(loci) {
        var _a;
        if (volume_1.Volume.Segment.isLoci(loci) && loci.volume._propertyData.ownerId === this.ref) {
            if (loci.segments.length === 1) {
                return loci.segments[0];
            }
        }
        if (shape_1.ShapeGroup.isLoci(loci)) {
            const meshData = ((_a = loci.shape.sourceData) !== null && _a !== void 0 ? _a : {});
            if (meshData.ownerId === this.ref && meshData.segmentId !== undefined) {
                return meshData.segmentId;
            }
        }
    }
    async setTryUseGpu(tryUseGpu) {
        await Promise.all([
            this.volumeData.setTryUseGpu(tryUseGpu),
            this.latticeSegmentationData.setTryUseGpu(tryUseGpu),
        ]);
    }
    async setSelectionMode(selectSegments) {
        if (selectSegments) {
            await this.selectSegment(this.currentState.value.selectedSegment);
        }
        else {
            this.plugin.managers.interactivity.lociSelects.deselectAll();
        }
    }
}
exports.VolsegEntryData = VolsegEntryData;
