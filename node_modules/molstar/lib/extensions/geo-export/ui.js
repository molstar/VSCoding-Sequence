import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sukolsak Sakshuwong <sukolsak@stanford.edu>
 */
import { merge } from 'rxjs';
import { CollapsableControls } from '../../mol-plugin-ui/base';
import { Button } from '../../mol-plugin-ui/controls/common';
import { GetAppSvg, CubeScanSvg, CubeSendSvg } from '../../mol-plugin-ui/controls/icons';
import { ParameterControls } from '../../mol-plugin-ui/controls/parameters';
import { download } from '../../mol-util/download';
import { GeometryParams, GeometryControls } from './controls';
export class GeometryExporterUI extends CollapsableControls {
    constructor() {
        super(...arguments);
        this.save = async () => {
            try {
                this.setState({ busy: true });
                const data = await this.controls.exportGeometry();
                download(data.blob, data.filename);
            }
            catch (e) {
                console.error(e);
            }
            finally {
                this.setState({ busy: false });
            }
        };
        this.viewInAR = async () => {
            try {
                this.setState({ busy: true });
                const data = await this.controls.exportGeometry();
                const a = document.createElement('a');
                a.rel = 'ar';
                a.href = URL.createObjectURL(data.blob);
                // For in-place viewing of USDZ on iOS, the link must contain a single child that is either an img or picture.
                // https://webkit.org/blog/8421/viewing-augmented-reality-assets-in-safari-for-ios/
                a.appendChild(document.createElement('img'));
                setTimeout(() => URL.revokeObjectURL(a.href), 4E4); // 40s
                setTimeout(() => a.dispatchEvent(new MouseEvent('click')));
            }
            catch (e) {
                console.error(e);
            }
            finally {
                this.setState({ busy: false });
            }
        };
    }
    get controls() {
        return this._controls || (this._controls = new GeometryControls(this.plugin));
    }
    defaultState() {
        return {
            header: 'Export Geometry',
            isCollapsed: true,
            brand: { accent: 'cyan', svg: CubeSendSvg }
        };
    }
    renderControls() {
        var _a, _b, _c, _d;
        if (this.isARSupported === undefined) {
            this.isARSupported = !!((_b = (_a = document.createElement('a').relList) === null || _a === void 0 ? void 0 : _a.supports) === null || _b === void 0 ? void 0 : _b.call(_a, 'ar'));
        }
        const ctrl = this.controls;
        return _jsxs(_Fragment, { children: [_jsx(ParameterControls, { params: GeometryParams, values: ctrl.behaviors.params.value, onChangeValues: xs => ctrl.behaviors.params.next(xs), isDisabled: this.state.busy }), _jsx(Button, { icon: GetAppSvg, onClick: this.save, style: { marginTop: 1 }, disabled: this.state.busy || !((_c = this.plugin.canvas3d) === null || _c === void 0 ? void 0 : _c.reprCount.value), children: "Save" }), this.isARSupported && ctrl.behaviors.params.value.format === 'usdz' &&
                    _jsx(Button, { icon: CubeScanSvg, onClick: this.viewInAR, style: { marginTop: 1 }, disabled: this.state.busy || !((_d = this.plugin.canvas3d) === null || _d === void 0 ? void 0 : _d.reprCount.value), children: "View in AR" })] });
    }
    componentDidMount() {
        if (!this.plugin.canvas3d)
            return;
        const merged = merge(this.controls.behaviors.params, this.plugin.canvas3d.reprCount);
        this.subscribe(merged, () => {
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
