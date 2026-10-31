"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mp4EncoderUI = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const base_1 = require("../../mol-plugin-ui/base");
const common_1 = require("../../mol-plugin-ui/controls/common");
const icons_1 = require("../../mol-plugin-ui/controls/icons");
const parameters_1 = require("../../mol-plugin-ui/controls/parameters");
const download_1 = require("../../mol-util/download");
const controls_1 = require("./controls");
class Mp4EncoderUI extends base_1.CollapsableControls {
    constructor() {
        super(...arguments);
        this.save = () => {
            (0, download_1.download)(new Blob([this.state.data.movie]), this.state.data.filename);
        };
        this.generate = async () => {
            try {
                this.setState({ busy: true });
                const data = await this.controls.render();
                this.setState({ busy: false, data });
            }
            catch (e) {
                console.error(e);
                this.setState({ busy: false });
            }
        };
    }
    get controls() {
        return this._controls || (this._controls = new controls_1.Mp4Controls(this.plugin));
    }
    defaultState() {
        return {
            header: 'Export Animation',
            isCollapsed: true,
            brand: { accent: 'cyan', svg: icons_1.SubscriptionsOutlinedSvg }
        };
    }
    downloadControls() {
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: 'msp-control-offset msp-help-text', children: (0, jsx_runtime_1.jsx)("div", { className: 'msp-help-description', style: { textAlign: 'center' }, children: "Rendering successful!" }) }), (0, jsx_runtime_1.jsx)(common_1.Button, { icon: icons_1.GetAppSvg, onClick: this.save, style: { marginTop: 1 }, children: "Save Animation" }), (0, jsx_runtime_1.jsx)(common_1.Button, { onClick: () => this.setState({ data: void 0 }), style: { marginTop: 6 }, children: "Clear" })] });
    }
    renderControls() {
        var _a;
        if (this.state.data) {
            return this.downloadControls();
        }
        const ctrl = this.controls;
        const current = ctrl.behaviors.current.value;
        const info = ctrl.behaviors.info.value;
        const canApply = ctrl.behaviors.canApply.value;
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: ctrl.behaviors.animations.value, values: { current: current === null || current === void 0 ? void 0 : current.anim.name }, onChangeValues: xs => ctrl.setCurrent(xs.current), isDisabled: this.state.busy }), current && (0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: current.params, values: current.values, onChangeValues: xs => ctrl.setCurrentParams(xs), isDisabled: this.state.busy }), (0, jsx_runtime_1.jsx)("div", { className: 'msp-control-offset msp-help-text', children: (0, jsx_runtime_1.jsxs)("div", { className: 'msp-help-description', style: { textAlign: 'center' }, children: ["Resolution: ", info.width, "x", info.height, (0, jsx_runtime_1.jsx)("br", {}), "Adjust in viewport using ", (0, jsx_runtime_1.jsx)(icons_1.Icon, { svg: icons_1.CameraOutlinedSvg, inline: true })] }) }), (0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: controls_1.Mp4AnimationParams, values: ctrl.behaviors.params.value, onChangeValues: xs => ctrl.behaviors.params.next(xs), isDisabled: this.state.busy }), (0, jsx_runtime_1.jsx)(common_1.Button, { onClick: this.generate, style: { marginTop: 1 }, disabled: this.state.busy || !canApply.canApply, commit: canApply.canApply ? 'on' : 'off', children: canApply.canApply ? 'Render' : (_a = canApply.reason) !== null && _a !== void 0 ? _a : 'Invalid params/state' })] });
    }
    componentDidMount() {
        const merged = (0, rxjs_1.merge)(this.controls.behaviors.animations, this.controls.behaviors.current, this.controls.behaviors.canApply, this.controls.behaviors.info, this.controls.behaviors.params);
        this.subscribe(merged.pipe((0, operators_1.debounceTime)(10)), () => {
            if (!this.state.isCollapsed)
                this.forceUpdate();
        });
    }
    componentWillUnmount() {
        var _a;
        super.componentWillUnmount();
        (_a = this._controls) === null || _a === void 0 ? void 0 : _a.dispose();
        this._controls = void 0;
    }
}
exports.Mp4EncoderUI = Mp4EncoderUI;
