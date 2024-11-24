import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import * as React from 'react';
import { PluginUIComponent } from '../base';
export class ViewportCanvas extends PluginUIComponent {
    constructor() {
        super(...arguments);
        this.container = React.createRef();
        this.state = {
            noWebGl: false,
            showLogo: true
        };
        this.handleLogo = () => {
            var _a;
            this.setState({ showLogo: !((_a = this.plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.reprCount.value) });
        };
    }
    componentDidMount() {
        if (!this.container.current || !this.plugin.mount(this.container.current, { checkeredCanvasBackground: true })) {
            this.setState({ noWebGl: true });
            return;
        }
        this.handleLogo();
        this.subscribe(this.plugin.canvas3d.reprCount, this.handleLogo);
    }
    componentWillUnmount() {
        super.componentWillUnmount();
        this.plugin.unmount();
    }
    renderMissing() {
        if (this.props.noWebGl) {
            const C = this.props.noWebGl;
            return _jsx(C, {});
        }
        return _jsx("div", { className: 'msp-no-webgl', children: _jsxs("div", { children: [_jsx("p", { children: _jsx("b", { children: "WebGL does not seem to be available." }) }), _jsx("p", { children: "This can be caused by an outdated browser, graphics card driver issue, or bad weather. Sometimes, just restarting the browser helps. Also, make sure hardware acceleration is enabled in your browser." }), _jsxs("p", { children: ["For a list of supported browsers, refer to ", _jsx("a", { href: 'http://caniuse.com/#feat=webgl', target: '_blank', children: "http://caniuse.com/#feat=webgl" }), "."] })] }) });
    }
    render() {
        if (this.state.noWebGl)
            return this.renderMissing();
        const Logo = this.props.logo;
        return _jsx("div", { className: this.props.parentClassName || 'msp-viewport', style: this.props.parentStyle, ref: this.container, children: (this.state.showLogo && Logo) && _jsx(Logo, {}) });
    }
}
