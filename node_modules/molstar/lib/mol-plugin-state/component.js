/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { shallowMergeArray } from '../mol-util/object';
import { RxEventHelper } from '../mol-util/rx-event-helper';
import { arraySetRemove } from '../mol-util/array';
export class PluginComponent {
    constructor() {
        this.subs = void 0;
    }
    subscribe(obs, action) {
        if (typeof this.subs === 'undefined')
            this.subs = [];
        let sub = obs.subscribe(action);
        this.subs.push(sub);
        return {
            unsubscribe: () => {
                if (sub && this.subs && arraySetRemove(this.subs, sub)) {
                    sub.unsubscribe();
                    sub = void 0;
                }
            }
        };
    }
    get ev() {
        return this._ev || (this._ev = RxEventHelper.create());
    }
    dispose() {
        if (this._ev)
            this._ev.dispose();
        if (this.subs) {
            for (const s of this.subs)
                s.unsubscribe();
            this.subs = void 0;
        }
    }
}
export class StatefulPluginComponent extends PluginComponent {
    updateState(...states) {
        const latest = this.state;
        const s = shallowMergeArray(latest, states);
        if (s !== latest) {
            this._state = s;
            return true;
        }
        return false;
    }
    get state() {
        return this._state;
    }
    constructor(initialState) {
        super();
        this._state = initialState;
    }
}
