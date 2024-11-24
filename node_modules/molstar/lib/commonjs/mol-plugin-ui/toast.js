"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Toasts = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted from LiteMol (c) David Sehnal
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
const base_1 = require("./base");
const common_1 = require("./controls/common");
const icons_1 = require("./controls/icons");
class ToastEntry extends base_1.PluginUIComponent {
    constructor() {
        super(...arguments);
        this.hide = () => {
            const entry = this.props.entry;
            (entry.hide || function () { }).call(null);
        };
    }
    render() {
        const entry = this.props.entry;
        const message = typeof entry.message === 'string'
            ? (0, jsx_runtime_1.jsx)("div", { dangerouslySetInnerHTML: { __html: entry.message } })
            // @ts-ignore // TODO: handle type better
            : (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(entry.message, {}) });
        return (0, jsx_runtime_1.jsxs)("div", { className: 'msp-toast-entry', children: [(0, jsx_runtime_1.jsx)("div", { className: 'msp-toast-title', onClick: () => this.hide(), children: entry.title }), (0, jsx_runtime_1.jsx)("div", { className: 'msp-toast-message', children: message }), (0, jsx_runtime_1.jsx)("div", { className: 'msp-toast-clear' }), (0, jsx_runtime_1.jsx)("div", { className: 'msp-toast-hide', children: (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.CancelSvg, onClick: this.hide, title: 'Hide', className: 'msp-no-hover-outline' }) })] });
    }
}
class Toasts extends base_1.PluginUIComponent {
    componentDidMount() {
        this.subscribe(this.plugin.managers.toast.events.changed, () => this.forceUpdate());
    }
    render() {
        const state = this.plugin.managers.toast.state;
        if (!state.entries.count())
            return null;
        const entries = [];
        state.entries.forEach((t, k) => entries.push(t));
        entries.sort(function (x, y) { return x.serialNumber - y.serialNumber; });
        return (0, jsx_runtime_1.jsx)("div", { className: 'msp-toast-container', children: entries.map(e => (0, jsx_runtime_1.jsx)(ToastEntry, { entry: e }, e.serialNumber)) });
    }
}
exports.Toasts = Toasts;
