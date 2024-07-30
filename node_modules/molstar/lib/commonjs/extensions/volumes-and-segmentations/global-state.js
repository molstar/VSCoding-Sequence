"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolsegGlobalStateData = exports.VolsegGlobalState = exports.VolsegGlobalStateParams = void 0;
const rxjs_1 = require("rxjs");
const objects_1 = require("../../mol-plugin-state/objects");
const behavior_1 = require("../../mol-plugin/behavior");
const param_definition_1 = require("../../mol-util/param-definition");
const entry_root_1 = require("./entry-root");
const helpers_1 = require("./helpers");
exports.VolsegGlobalStateParams = {
    tryUseGpu: param_definition_1.ParamDefinition.Boolean(true, { description: 'Attempt using GPU for faster rendering. \nCaution: with some hardware setups, this might render some objects incorrectly or not at all.' }),
    selectionMode: param_definition_1.ParamDefinition.Boolean(true, { description: 'Allow selecting/deselecting a segment by clicking on it.' }),
};
class VolsegGlobalState extends objects_1.PluginStateObject.CreateBehavior({ name: 'Vol & Seg Global State' }) {
}
exports.VolsegGlobalState = VolsegGlobalState;
class VolsegGlobalStateData extends behavior_1.PluginBehavior.WithSubscribers {
    constructor(plugin, params) {
        super(plugin, params);
        this.currentState = new rxjs_1.BehaviorSubject(param_definition_1.ParamDefinition.getDefaultValues(exports.VolsegGlobalStateParams));
        this.currentState.next(params);
    }
    register(ref) {
        this.ref = ref;
    }
    unregister() {
        this.ref = '';
    }
    isRegistered() {
        return this.ref !== '';
    }
    async updateState(plugin, state) {
        const oldState = this.currentState.value;
        const promises = [];
        const allEntries = plugin.state.data.selectQ(q => q.ofType(entry_root_1.VolsegEntry)).map(cell => { var _a; return (_a = cell.obj) === null || _a === void 0 ? void 0 : _a.data; }).filter(helpers_1.isDefined);
        if (state.tryUseGpu !== undefined && state.tryUseGpu !== oldState.tryUseGpu) {
            for (const entry of allEntries) {
                promises.push(entry.setTryUseGpu(state.tryUseGpu));
            }
        }
        if (state.selectionMode !== undefined && state.selectionMode !== oldState.selectionMode) {
            for (const entry of allEntries) {
                promises.push(entry.setSelectionMode(state.selectionMode));
            }
        }
        await Promise.all(promises);
        await plugin.build().to(this.ref).update(state).commit();
    }
    static getGlobalState(plugin) {
        var _a, _b;
        return (_b = (_a = plugin.state.data.selectQ(q => q.ofType(VolsegGlobalState))[0]) === null || _a === void 0 ? void 0 : _a.obj) === null || _b === void 0 ? void 0 : _b.data.currentState.value;
    }
}
exports.VolsegGlobalStateData = VolsegGlobalStateData;
