"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted from LiteMol (c) David Sehnal
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginToastManager = void 0;
const component_1 = require("../../mol-plugin-state/component");
const immutable_1 = require("immutable");
const commands_1 = require("../commands");
class PluginToastManager extends component_1.StatefulPluginComponent {
    findByKey(key) {
        return this.state.entries.find(e => !!e && e.key === key);
    }
    show(toast) {
        let entries = this.state.entries;
        let e = void 0;
        const id = ++this.serialId;
        let serialNumber;
        if (toast.key && (e = this.findByKey(toast.key))) {
            if (e.timeout !== void 0)
                clearTimeout(e.timeout);
            serialNumber = e.serialNumber;
            entries = entries.remove(e.id);
        }
        else {
            serialNumber = ++this.serialNumber;
        }
        e = {
            id,
            serialNumber,
            key: toast.key,
            title: toast.title,
            message: toast.message,
            timeout: this.timeout(id, toast.timeoutMs),
            hide: () => this.hideId(id)
        };
        if (this.updateState({ entries: entries.set(id, e) }))
            this.events.changed.next(void 0);
    }
    timeout(id, delay) {
        if (delay === void 0)
            return void 0;
        if (delay < 0)
            delay = 500;
        return setTimeout(() => {
            const e = this.state.entries.get(id);
            e.timeout = void 0;
            this.hide(e);
        }, delay);
    }
    hideId(id) {
        this.hide(this.state.entries.get(id));
    }
    hide(e) {
        if (!e)
            return;
        if (e.timeout !== void 0)
            clearTimeout(e.timeout);
        e.hide = void 0;
        if (this.updateState({ entries: this.state.entries.delete(e.id) }))
            this.events.changed.next(void 0);
    }
    constructor(plugin) {
        super({ entries: (0, immutable_1.OrderedMap)() });
        this.events = {
            changed: this.ev()
        };
        this.serialNumber = 0;
        this.serialId = 0;
        commands_1.PluginCommands.Toast.Show.subscribe(plugin, e => this.show(e));
        commands_1.PluginCommands.Toast.Hide.subscribe(plugin, e => this.hide(this.findByKey(e.key)));
    }
}
exports.PluginToastManager = PluginToastManager;
