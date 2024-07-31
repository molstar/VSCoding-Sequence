/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { BehaviorSubject } from 'rxjs';
import { PluginStateObject } from '../../mol-plugin-state/objects';
import { PluginBehavior } from '../../mol-plugin/behavior';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { VolsegEntry } from './entry-root';
import { isDefined } from './helpers';
export const VolsegGlobalStateParams = {
    tryUseGpu: PD.Boolean(true, { description: 'Attempt using GPU for faster rendering. \nCaution: with some hardware setups, this might render some objects incorrectly or not at all.' }),
    selectionMode: PD.Boolean(true, { description: 'Allow selecting/deselecting a segment by clicking on it.' }),
};
export class VolsegGlobalState extends PluginStateObject.CreateBehavior({ name: 'Vol & Seg Global State' }) {
}
export class VolsegGlobalStateData extends PluginBehavior.WithSubscribers {
    constructor(plugin, params) {
        super(plugin, params);
        this.currentState = new BehaviorSubject(PD.getDefaultValues(VolsegGlobalStateParams));
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
        const allEntries = plugin.state.data.selectQ(q => q.ofType(VolsegEntry)).map(cell => { var _a; return (_a = cell.obj) === null || _a === void 0 ? void 0 : _a.data; }).filter(isDefined);
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
