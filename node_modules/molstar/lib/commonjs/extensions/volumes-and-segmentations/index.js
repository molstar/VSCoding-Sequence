"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadVolseg = exports.Volseg = exports.VolsegVolumeServerConfig = void 0;
const objects_1 = require("../../mol-plugin-state/objects");
const behavior_1 = require("../../mol-plugin/behavior");
const config_1 = require("../../mol-plugin/config");
const mol_state_1 = require("../../mol-state");
const mol_task_1 = require("../../mol-task");
const api_1 = require("./volseg-api/api");
const entry_root_1 = require("./entry-root");
const global_state_1 = require("./global-state");
const helpers_1 = require("./helpers");
const transformers_1 = require("./transformers");
const ui_1 = require("./ui");
const DEBUGGING = typeof window !== 'undefined' ? ((_a = window === null || window === void 0 ? void 0 : window.location) === null || _a === void 0 ? void 0 : _a.hostname) === 'localhost' : false;
exports.VolsegVolumeServerConfig = {
    // DefaultServer: new PluginConfigItem('volseg-volume-server', DEFAULT_VOLUME_SERVER_V2),
    DefaultServer: new config_1.PluginConfigItem('volseg-volume-server', DEBUGGING ? 'http://localhost:9000/v2' : api_1.DEFAULT_VOLSEG_SERVER),
};
exports.Volseg = behavior_1.PluginBehavior.create({
    name: 'volseg',
    category: 'misc',
    display: {
        name: 'Volseg',
        description: 'Volseg'
    },
    ctor: class extends behavior_1.PluginBehavior.Handler {
        register() {
            this.ctx.state.data.actions.add(exports.LoadVolseg);
            this.ctx.customStructureControls.set('volseg', ui_1.VolsegUI);
            this.initializeEntryLists(); // do not await
            const entries = new Map();
            this.subscribeObservable(this.ctx.state.data.events.cell.created, o => {
                if (o.cell.obj instanceof entry_root_1.VolsegEntryData)
                    entries.set(o.ref, o.cell.obj);
            });
            this.subscribeObservable(this.ctx.state.data.events.cell.removed, o => {
                if (entries.has(o.ref)) {
                    entries.get(o.ref).dispose();
                    entries.delete(o.ref);
                }
            });
        }
        unregister() {
            this.ctx.state.data.actions.remove(exports.LoadVolseg);
            this.ctx.customStructureControls.delete('volseg');
        }
        async initializeEntryLists() {
            var _a;
            const apiUrl = (_a = this.ctx.config.get(exports.VolsegVolumeServerConfig.DefaultServer)) !== null && _a !== void 0 ? _a : api_1.DEFAULT_VOLSEG_SERVER;
            const api = new api_1.VolumeApiV2(apiUrl);
            const entryLists = await api.getEntryList(10 ** 6);
            Object.values(entryLists).forEach(l => l.sort());
            this.ctx.customState.volsegAvailableEntries = entryLists;
        }
    }
});
exports.LoadVolseg = mol_state_1.StateAction.build({
    display: { name: 'Load Volume & Segmentation' },
    from: objects_1.PluginStateObject.Root,
    params: (a, plugin) => {
        const res = (0, entry_root_1.createLoadVolsegParams)(plugin, plugin.customState.volsegAvailableEntries);
        return res;
    },
})(({ params, state }, ctx) => mol_task_1.Task.create('Loading Volume & Segmentation', taskCtx => {
    return state.transaction(async () => {
        const entryParams = entry_root_1.VolsegEntryParamValues.fromLoadVolsegParamValues(params);
        if (entryParams.entryId.trim().length === 0) {
            alert('Must specify Entry Id!');
            throw new Error('Specify Entry Id');
        }
        if (!entryParams.entryId.includes('-')) {
            // add source prefix if the user omitted it (e.g. 1832 -> emd-1832)
            entryParams.entryId = (0, helpers_1.createEntryId)(entryParams.source, entryParams.entryId);
        }
        ctx.behaviors.layout.leftPanelTabName.next('data');
        const globalStateNode = ctx.state.data.selectQ(q => q.ofType(global_state_1.VolsegGlobalState))[0];
        if (!globalStateNode) {
            await state.build().toRoot().apply(transformers_1.VolsegGlobalStateFromRoot, {}, { state: { isGhost: !DEBUGGING } }).commit();
        }
        const entryNode = await state.build().toRoot().apply(transformers_1.VolsegEntryFromRoot, entryParams).commit();
        await state.build().to(entryNode).apply(transformers_1.VolsegStateFromEntry, {}, { state: { isGhost: !DEBUGGING } }).commit();
        if (entryNode.data) {
            await entryNode.data.loadVolume();
            await entryNode.data.loadSegmentations();
        }
    }).runInContext(taskCtx);
}));
