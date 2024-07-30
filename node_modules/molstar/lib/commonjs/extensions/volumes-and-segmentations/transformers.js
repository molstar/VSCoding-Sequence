"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolsegGlobalStateFromRoot = exports.VolsegStateFromEntry = exports.VolsegEntryFromRoot = void 0;
const objects_1 = require("../../mol-plugin-state/objects");
const mol_state_1 = require("../../mol-state");
const mol_task_1 = require("../../mol-task");
const entry_root_1 = require("./entry-root");
const entry_state_1 = require("./entry-state");
const global_state_1 = require("./global-state");
exports.VolsegEntryFromRoot = objects_1.PluginStateTransform.BuiltIn({
    name: 'volseg-entry-from-root',
    display: { name: 'Vol & Seg Entry', description: 'Vol & Seg Entry' },
    from: objects_1.PluginStateObject.Root,
    to: entry_root_1.VolsegEntry,
    params: (a, plugin) => (0, entry_root_1.createVolsegEntryParams)(plugin),
})({
    apply({ a, params }, plugin) {
        return mol_task_1.Task.create('Load Vol & Seg Entry', async () => {
            const data = await entry_root_1.VolsegEntryData.create(plugin, params);
            return new entry_root_1.VolsegEntry(data, { label: data.entryId, description: 'Vol & Seg Entry' });
        });
    },
    update({ b, oldParams, newParams }) {
        Object.assign(newParams, oldParams);
        console.error('Changing params of existing VolsegEntry node is not allowed');
        return mol_state_1.StateTransformer.UpdateResult.Unchanged;
    }
});
exports.VolsegStateFromEntry = objects_1.PluginStateTransform.BuiltIn({
    name: entry_state_1.VOLSEG_STATE_FROM_ENTRY_TRANSFORMER_NAME,
    display: { name: 'Vol & Seg Entry State', description: 'Vol & Seg Entry State' },
    from: entry_root_1.VolsegEntry,
    to: entry_state_1.VolsegState,
    params: entry_state_1.VolsegStateParams,
})({
    apply({ a, params }, plugin) {
        return mol_task_1.Task.create('Create Vol & Seg Entry State', async () => {
            return new entry_state_1.VolsegState(params, { label: 'State' });
        });
    }
});
exports.VolsegGlobalStateFromRoot = objects_1.PluginStateTransform.BuiltIn({
    name: 'volseg-global-state-from-root',
    display: { name: 'Vol & Seg Global State', description: 'Vol & Seg Global State' },
    from: objects_1.PluginStateObject.Root,
    to: global_state_1.VolsegGlobalState,
    params: global_state_1.VolsegGlobalStateParams,
})({
    apply({ a, params }, plugin) {
        return mol_task_1.Task.create('Create Vol & Seg Global State', async () => {
            const data = new global_state_1.VolsegGlobalStateData(plugin, params);
            return new global_state_1.VolsegGlobalState(data, { label: 'Global State', description: 'Vol & Seg Global State' });
        });
    },
    update({ b, oldParams, newParams }) {
        b.data.currentState.next(newParams);
        return mol_state_1.StateTransformer.UpdateResult.Updated;
    }
});
