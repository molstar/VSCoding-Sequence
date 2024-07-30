"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolsegModelData = void 0;
const data_1 = require("../../mol-plugin-state/transforms/data");
const misc_1 = require("../../mol-plugin-state/transforms/misc");
const model_1 = require("../../mol-plugin-state/transforms/model");
const state_1 = require("../../mol-plugin/behavior/static/state");
class VolsegModelData {
    constructor(rootData) {
        this.entryData = rootData;
    }
    async loadPdb(pdbId, parent) {
        const url = `https://www.ebi.ac.uk/pdbe/entry-files/download/${pdbId}.bcif`;
        const dataNode = await this.entryData.plugin.build().to(parent).apply(data_1.Download, { url: url, isBinary: true }, { tags: ['fitted-model-data', `pdbid-${pdbId}`] }).commit();
        const cifNode = await this.entryData.plugin.build().to(dataNode).apply(data_1.ParseCif).commit();
        const trajectoryNode = await this.entryData.plugin.build().to(cifNode).apply(model_1.TrajectoryFromMmCif).commit();
        await this.entryData.plugin.builders.structure.hierarchy.applyPreset(trajectoryNode, 'default', { representationPreset: 'polymer-cartoon' });
        return dataNode;
    }
    async showPdbs(pdbIds) {
        var _a, _b, _c;
        const segmentsToShow = new Set(pdbIds);
        const visuals = this.entryData.findNodesByTags('fitted-model-data');
        for (const visual of visuals) {
            const theTag = (_b = (_a = visual.obj) === null || _a === void 0 ? void 0 : _a.tags) === null || _b === void 0 ? void 0 : _b.find(tag => tag.startsWith('pdbid-'));
            if (!theTag)
                continue;
            const id = theTag.split('-')[1];
            const visibility = segmentsToShow.has(id);
            (0, state_1.setSubtreeVisibility)(this.entryData.plugin.state.data, visual.transform.ref, !visibility); // true means hide, ¯\_(ツ)_/¯
            segmentsToShow.delete(id);
        }
        const segmentsToCreate = Array.from(segmentsToShow);
        if (segmentsToCreate.length === 0)
            return;
        let group = (_c = this.entryData.findNodesByTags('fitted-models-group')[0]) === null || _c === void 0 ? void 0 : _c.transform.ref;
        if (!group) {
            const newGroupNode = await this.entryData.newUpdate().apply(misc_1.CreateGroup, { label: 'Fitted Models' }, { tags: ['fitted-models-group'], state: { isCollapsed: true } }).commit();
            group = newGroupNode.ref;
        }
        const awaiting = [];
        for (const pdbId of segmentsToCreate) {
            awaiting.push(this.loadPdb(pdbId, group));
        }
        for (const promise of awaiting)
            await promise;
    }
}
exports.VolsegModelData = VolsegModelData;
