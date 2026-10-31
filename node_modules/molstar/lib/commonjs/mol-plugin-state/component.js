"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatefulPluginComponent = exports.PluginComponent = void 0;
const object_1 = require("../mol-util/object");
const rx_event_helper_1 = require("../mol-util/rx-event-helper");
const array_1 = require("../mol-util/array");
class PluginComponent {
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
                if (sub && this.subs && (0, array_1.arraySetRemove)(this.subs, sub)) {
                    sub.unsubscribe();
                    sub = void 0;
                }
            }
        };
    }
    get ev() {
        return this._ev || (this._ev = rx_event_helper_1.RxEventHelper.create());
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
exports.PluginComponent = PluginComponent;
class StatefulPluginComponent extends PluginComponent {
    updateState(...states) {
        const latest = this.state;
        const s = (0, object_1.shallowMergeArray)(latest, states);
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
exports.StatefulPluginComponent = StatefulPluginComponent;
