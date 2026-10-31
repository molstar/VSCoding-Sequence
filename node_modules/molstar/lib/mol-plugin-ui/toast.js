import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted from LiteMol (c) David Sehnal
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { PluginUIComponent } from './base';
import { IconButton } from './controls/common';
import { CancelSvg } from './controls/icons';
class ToastEntry extends PluginUIComponent {
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
            ? _jsx("div", { dangerouslySetInnerHTML: { __html: entry.message } })
            // @ts-ignore // TODO: handle type better
            : _jsx("div", { children: _jsx(entry.message, {}) });
        return _jsxs("div", { className: 'msp-toast-entry', children: [_jsx("div", { className: 'msp-toast-title', onClick: () => this.hide(), children: entry.title }), _jsx("div", { className: 'msp-toast-message', children: message }), _jsx("div", { className: 'msp-toast-clear' }), _jsx("div", { className: 'msp-toast-hide', children: _jsx(IconButton, { svg: CancelSvg, onClick: this.hide, title: 'Hide', className: 'msp-no-hover-outline' }) })] });
    }
}
export class Toasts extends PluginUIComponent {
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
        return _jsx("div", { className: 'msp-toast-container', children: entries.map(e => _jsx(ToastEntry, { entry: e }, e.serialNumber)) });
    }
}
