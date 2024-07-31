"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeometryExporterUI = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sukolsak Sakshuwong <sukolsak@stanford.edu>
 */
const rxjs_1 = require("rxjs");
const base_1 = require("../../mol-plugin-ui/base");
const common_1 = require("../../mol-plugin-ui/controls/common");
const icons_1 = require("../../mol-plugin-ui/controls/icons");
const parameters_1 = require("../../mol-plugin-ui/controls/parameters");
const download_1 = require("../../mol-util/download");
const controls_1 = require("./controls");
class GeometryExporterUI extends base_1.CollapsableControls {
    constructor() {
        super(...arguments);
        this.save = async () => {
            try {
                this.setState({ busy: true });
                const data = await this.controls.exportGeometry();
                (0, download_1.download)(data.blob, data.filename);
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
        return this._controls || (this._controls = new controls_1.GeometryControls(this.plugin));
    }
    defaultState() {
        return {
            header: 'Export Geometry',
            isCollapsed: true,
            brand: { accent: 'cyan', svg: icons_1.CubeSendSvg }
        };
    }
    renderControls() {
        var _a, _b, _c, _d;
        if (this.isARSupported === undefined) {
            this.isARSupported = !!((_b = (_a = document.createElement('a').relList) === null || _a === void 0 ? void 0 : _a.supports) === null || _b === void 0 ? void 0 : _b.call(_a, 'ar'));
        }
        const ctrl = this.controls;
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: controls_1.GeometryParams, values: ctrl.behaviors.params.value, onChangeValues: xs => ctrl.behaviors.params.next(xs), isDisabled: this.state.busy }), (0, jsx_runtime_1.jsx)(common_1.Button, { icon: icons_1.GetAppSvg, onClick: this.save, style: { marginTop: 1 }, disabled: this.state.busy || !((_c = this.plugin.canvas3d) === null || _c === void 0 ? void 0 : _c.reprCount.value), children: "Save" }), this.isARSupported && ctrl.behaviors.params.value.format === 'usdz' &&
                    (0, jsx_runtime_1.jsx)(common_1.Button, { icon: icons_1.CubeScanSvg, onClick: this.viewInAR, style: { marginTop: 1 }, disabled: this.state.busy || !((_d = this.plugin.canvas3d) === null || _d === void 0 ? void 0 : _d.reprCount.value), children: "View in AR" })] });
    }
    componentDidMount() {
        if (!this.plugin.canvas3d)
            return;
        const merged = (0, rxjs_1.merge)(this.controls.behaviors.params, this.plugin.canvas3d.reprCount);
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
exports.GeometryExporterUI = GeometryExporterUI;
