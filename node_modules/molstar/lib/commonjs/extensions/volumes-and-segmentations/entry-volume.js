"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolsegVolumeData = exports.SimpleVolumeParams = exports.VOLUME_VISUAL_TAG = void 0;
const tslib_1 = require("tslib");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const volume_1 = require("../../mol-model/volume");
const volume_representation_params_1 = require("../../mol-plugin-state/helpers/volume-representation-params");
const transforms_1 = require("../../mol-plugin-state/transforms");
const data_1 = require("../../mol-plugin-state/transforms/data");
const misc_1 = require("../../mol-plugin-state/transforms/misc");
const state_1 = require("../../mol-plugin/behavior/static/state");
const commands_1 = require("../../mol-plugin/commands");
const color_1 = require("../../mol-util/color");
const param_definition_1 = require("../../mol-util/param-definition");
const entry_root_1 = require("./entry-root");
const entry_state_1 = require("./entry-state");
const ExternalAPIs = tslib_1.__importStar(require("./external-api"));
const global_state_1 = require("./global-state");
const GROUP_TAG = 'volume-group';
exports.VOLUME_VISUAL_TAG = 'volume-visual';
const DIRECT_VOLUME_RELATIVE_PEAK_HALFWIDTH = 0.5;
;
exports.SimpleVolumeParams = {
    volumeType: entry_state_1.VolumeTypeChoice.PDSelect(),
    opacity: param_definition_1.ParamDefinition.Numeric(0.2, { min: 0, max: 1, step: 0.05 }, { hideIf: p => p.volumeType === 'off' }),
};
class VolsegVolumeData {
    constructor(rootData) {
        this.visualTypeParamCache = {};
        this.entryData = rootData;
    }
    async loadVolume() {
        var _a, _b, _c, _d;
        const hasVolumes = this.entryData.metadata.raw.grid.volumes.volume_downsamplings.length > 0;
        if (hasVolumes) {
            const isoLevelPromise = ExternalAPIs.tryGetIsovalue((_a = this.entryData.metadata.raw.grid.general.source_db_id) !== null && _a !== void 0 ? _a : this.entryData.entryId);
            let group = (_b = this.entryData.findNodesByTags(GROUP_TAG)[0]) === null || _b === void 0 ? void 0 : _b.transform.ref;
            if (!group) {
                const newGroupNode = await this.entryData.newUpdate().apply(misc_1.CreateGroup, { label: 'Volume' }, { tags: [GROUP_TAG], state: { isCollapsed: true } }).commit();
                group = newGroupNode.ref;
            }
            const url = this.entryData.api.volumeUrl(this.entryData.source, this.entryData.entryId, entry_root_1.BOX, entry_root_1.MAX_VOXELS);
            const data = await this.entryData.newUpdate().to(group).apply(data_1.Download, { url, isBinary: true, label: `Volume Data: ${url}` }).commit();
            const parsed = await this.entryData.plugin.dataFormats.get('dscif').parse(this.entryData.plugin, data);
            const volumeNode = (_d = (_c = parsed.volumes) === null || _c === void 0 ? void 0 : _c[0]) !== null && _d !== void 0 ? _d : parsed.volume;
            const volumeData = volumeNode.cell.obj.data;
            const volumeType = entry_state_1.VolsegStateParams.volumeType.defaultValue;
            let isovalue = await isoLevelPromise;
            if (!isovalue) {
                const stats = volumeData.grid.stats;
                const maxRelative = (stats.max - stats.mean) / stats.sigma;
                if (maxRelative > 1) {
                    isovalue = { kind: 'relative', value: 1.0 };
                }
                else {
                    isovalue = { kind: 'relative', value: maxRelative * 0.5 };
                }
            }
            const adjustedIsovalue = volume_1.Volume.adjustedIsoValue(volumeData, isovalue.value, isovalue.kind);
            const visualParams = this.createVolumeVisualParams(volumeData, volumeType);
            this.changeIsovalueInVolumeVisualParams(visualParams, adjustedIsovalue, volumeData.grid.stats);
            await this.entryData.newUpdate()
                .to(volumeNode)
                .apply(transforms_1.StateTransforms.Representation.VolumeRepresentation3D, visualParams, { tags: [exports.VOLUME_VISUAL_TAG], state: { isHidden: volumeType === 'off' } })
                .commit();
            return { isovalue: adjustedIsovalue };
        }
    }
    async setVolumeVisual(type) {
        var _a, _b;
        const visual = this.entryData.findNodesByTags(exports.VOLUME_VISUAL_TAG)[0];
        if (!visual)
            return;
        const oldParams = visual.transform.params;
        this.visualTypeParamCache[oldParams.type.name] = oldParams.type.params;
        if (type === 'off') {
            (0, state_1.setSubtreeVisibility)(this.entryData.plugin.state.data, visual.transform.ref, true); // true means hide, ¯\_(ツ)_/¯
        }
        else {
            (0, state_1.setSubtreeVisibility)(this.entryData.plugin.state.data, visual.transform.ref, false); // true means hide, ¯\_(ツ)_/¯
            if (oldParams.type.name === type)
                return;
            const newParams = {
                ...oldParams,
                type: {
                    name: type,
                    params: (_a = this.visualTypeParamCache[type]) !== null && _a !== void 0 ? _a : oldParams.type.params,
                }
            };
            const volumeStats = (_b = visual.obj) === null || _b === void 0 ? void 0 : _b.data.sourceData.grid.stats;
            if (!volumeStats)
                throw new Error(`Cannot get volume stats from volume visual ${visual.transform.ref}`);
            this.changeIsovalueInVolumeVisualParams(newParams, undefined, volumeStats);
            const update = this.entryData.newUpdate().to(visual.transform.ref).update(newParams);
            await commands_1.PluginCommands.State.Update(this.entryData.plugin, { state: this.entryData.plugin.state.data, tree: update, options: { doNotUpdateCurrent: true } });
        }
    }
    async updateVolumeVisual(newParams) {
        var _a, _b;
        const { volumeType, opacity } = newParams;
        const visual = this.entryData.findNodesByTags(exports.VOLUME_VISUAL_TAG)[0];
        if (!visual)
            return;
        const oldVisualParams = visual.transform.params;
        this.visualTypeParamCache[oldVisualParams.type.name] = oldVisualParams.type.params;
        if (volumeType === 'off') {
            (0, state_1.setSubtreeVisibility)(this.entryData.plugin.state.data, visual.transform.ref, true); // true means hide, ¯\_(ツ)_/¯
        }
        else {
            (0, state_1.setSubtreeVisibility)(this.entryData.plugin.state.data, visual.transform.ref, false); // true means hide, ¯\_(ツ)_/¯
            const newVisualParams = {
                ...oldVisualParams,
                type: {
                    name: volumeType,
                    params: (_a = this.visualTypeParamCache[volumeType]) !== null && _a !== void 0 ? _a : oldVisualParams.type.params,
                }
            };
            newVisualParams.type.params.alpha = opacity;
            const volumeStats = (_b = visual.obj) === null || _b === void 0 ? void 0 : _b.data.sourceData.grid.stats;
            if (!volumeStats)
                throw new Error(`Cannot get volume stats from volume visual ${visual.transform.ref}`);
            this.changeIsovalueInVolumeVisualParams(newVisualParams, undefined, volumeStats);
            const update = this.entryData.newUpdate().to(visual.transform.ref).update(newVisualParams);
            await commands_1.PluginCommands.State.Update(this.entryData.plugin, { state: this.entryData.plugin.state.data, tree: update, options: { doNotUpdateCurrent: true } });
        }
    }
    async setTryUseGpu(tryUseGpu) {
        const visuals = this.entryData.findNodesByTags(exports.VOLUME_VISUAL_TAG);
        for (const visual of visuals) {
            const oldParams = visual.transform.params;
            if (oldParams.type.params.tryUseGpu === !tryUseGpu) {
                const newParams = { ...oldParams, type: { ...oldParams.type, params: { ...oldParams.type.params, tryUseGpu: tryUseGpu } } };
                const update = this.entryData.newUpdate().to(visual.transform.ref).update(newParams);
                await commands_1.PluginCommands.State.Update(this.entryData.plugin, { state: this.entryData.plugin.state.data, tree: update, options: { doNotUpdateCurrent: true } });
            }
        }
    }
    getIsovalueFromState() {
        const { volumeIsovalueKind, volumeIsovalueValue } = this.entryData.currentState.value;
        return volumeIsovalueKind === 'relative'
            ? volume_1.Volume.IsoValue.relative(volumeIsovalueValue)
            : volume_1.Volume.IsoValue.absolute(volumeIsovalueValue);
    }
    createVolumeVisualParams(volume, type) {
        var _a;
        if (type === 'off')
            type = 'isosurface';
        return (0, volume_representation_params_1.createVolumeRepresentationParams)(this.entryData.plugin, volume, {
            type: type,
            typeParams: { alpha: 0.2, tryUseGpu: (_a = global_state_1.VolsegGlobalStateData.getGlobalState(this.entryData.plugin)) === null || _a === void 0 ? void 0 : _a.tryUseGpu },
            color: 'uniform',
            colorParams: { value: (0, color_1.Color)(0x121212) },
        });
    }
    changeIsovalueInVolumeVisualParams(params, isovalue, stats) {
        var _a;
        isovalue !== null && isovalue !== void 0 ? isovalue : (isovalue = this.getIsovalueFromState());
        switch (params.type.name) {
            case 'isosurface':
                params.type.params.isoValue = isovalue;
                params.type.params.tryUseGpu = (_a = global_state_1.VolsegGlobalStateData.getGlobalState(this.entryData.plugin)) === null || _a === void 0 ? void 0 : _a.tryUseGpu;
                break;
            case 'direct-volume':
                const absIso = volume_1.Volume.IsoValue.toAbsolute(isovalue, stats).absoluteValue;
                const fractIso = (absIso - stats.min) / (stats.max - stats.min);
                const peakHalfwidth = DIRECT_VOLUME_RELATIVE_PEAK_HALFWIDTH * stats.sigma / (stats.max - stats.min);
                params.type.params.controlPoints = [
                    linear_algebra_1.Vec2.create(Math.max(fractIso - peakHalfwidth, 0), 0),
                    linear_algebra_1.Vec2.create(fractIso, 1),
                    linear_algebra_1.Vec2.create(Math.min(fractIso + peakHalfwidth, 1), 0),
                ];
                break;
        }
    }
}
exports.VolsegVolumeData = VolsegVolumeData;
