"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewportCanvas = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
const React = tslib_1.__importStar(require("react"));
const base_1 = require("../base");
class ViewportCanvas extends base_1.PluginUIComponent {
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
            return (0, jsx_runtime_1.jsx)(C, {});
        }
        return (0, jsx_runtime_1.jsx)("div", { className: 'msp-no-webgl', children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { children: (0, jsx_runtime_1.jsx)("b", { children: "WebGL does not seem to be available." }) }), (0, jsx_runtime_1.jsx)("p", { children: "This can be caused by an outdated browser, graphics card driver issue, or bad weather. Sometimes, just restarting the browser helps. Also, make sure hardware acceleration is enabled in your browser." }), (0, jsx_runtime_1.jsxs)("p", { children: ["For a list of supported browsers, refer to ", (0, jsx_runtime_1.jsx)("a", { href: 'http://caniuse.com/#feat=webgl', target: '_blank', children: "http://caniuse.com/#feat=webgl" }), "."] })] }) });
    }
    render() {
        if (this.state.noWebGl)
            return this.renderMissing();
        const Logo = this.props.logo;
        return (0, jsx_runtime_1.jsx)("div", { className: this.props.parentClassName || 'msp-viewport', style: this.props.parentStyle, ref: this.container, children: (this.state.showLogo && Logo) && (0, jsx_runtime_1.jsx)(Logo, {}) });
    }
}
exports.ViewportCanvas = ViewportCanvas;
