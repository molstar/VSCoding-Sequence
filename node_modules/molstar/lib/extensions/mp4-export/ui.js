import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { merge } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CollapsableControls } from '../../mol-plugin-ui/base';
import { Button } from '../../mol-plugin-ui/controls/common';
import { CameraOutlinedSvg, GetAppSvg, Icon, SubscriptionsOutlinedSvg } from '../../mol-plugin-ui/controls/icons';
import { ParameterControls } from '../../mol-plugin-ui/controls/parameters';
import { download } from '../../mol-util/download';
import { Mp4AnimationParams, Mp4Controls } from './controls';
export class Mp4EncoderUI extends CollapsableControls {
    constructor() {
        super(...arguments);
        this.save = () => {
            download(new Blob([this.state.data.movie]), this.state.data.filename);
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
        return this._controls || (this._controls = new Mp4Controls(this.plugin));
    }
    defaultState() {
        return {
            header: 'Export Animation',
            isCollapsed: true,
            brand: { accent: 'cyan', svg: SubscriptionsOutlinedSvg }
        };
    }
    downloadControls() {
        return _jsxs(_Fragment, { children: [_jsx("div", { className: 'msp-control-offset msp-help-text', children: _jsx("div", { className: 'msp-help-description', style: { textAlign: 'center' }, children: "Rendering successful!" }) }), _jsx(Button, { icon: GetAppSvg, onClick: this.save, style: { marginTop: 1 }, children: "Save Animation" }), _jsx(Button, { onClick: () => this.setState({ data: void 0 }), style: { marginTop: 6 }, children: "Clear" })] });
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
        return _jsxs(_Fragment, { children: [_jsx(ParameterControls, { params: ctrl.behaviors.animations.value, values: { current: current === null || current === void 0 ? void 0 : current.anim.name }, onChangeValues: xs => ctrl.setCurrent(xs.current), isDisabled: this.state.busy }), current && _jsx(ParameterControls, { params: current.params, values: current.values, onChangeValues: xs => ctrl.setCurrentParams(xs), isDisabled: this.state.busy }), _jsx("div", { className: 'msp-control-offset msp-help-text', children: _jsxs("div", { className: 'msp-help-description', style: { textAlign: 'center' }, children: ["Resolution: ", info.width, "x", info.height, _jsx("br", {}), "Adjust in viewport using ", _jsx(Icon, { svg: CameraOutlinedSvg, inline: true })] }) }), _jsx(ParameterControls, { params: Mp4AnimationParams, values: ctrl.behaviors.params.value, onChangeValues: xs => ctrl.behaviors.params.next(xs), isDisabled: this.state.busy }), _jsx(Button, { onClick: this.generate, style: { marginTop: 1 }, disabled: this.state.busy || !canApply.canApply, commit: canApply.canApply ? 'on' : 'off', children: canApply.canApply ? 'Render' : (_a = canApply.reason) !== null && _a !== void 0 ? _a : 'Invalid params/state' })] });
    }
    componentDidMount() {
        const merged = merge(this.controls.behaviors.animations, this.controls.behaviors.current, this.controls.behaviors.canApply, this.controls.behaviors.info, this.controls.behaviors.params);
        this.subscribe(merged.pipe(debounceTime(10)), () => {
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
