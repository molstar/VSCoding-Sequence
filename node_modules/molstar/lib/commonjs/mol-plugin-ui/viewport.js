"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Viewport = exports.Logo = exports.ViewportControls = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const rxjs_1 = require("rxjs");
const commands_1 = require("../mol-plugin/commands");
const config_1 = require("../mol-plugin/config");
const base_1 = require("./base");
const common_1 = require("./controls/common");
const icons_1 = require("./controls/icons");
const selection_1 = require("./structure/selection");
const canvas_1 = require("./viewport/canvas");
const screenshot_1 = require("./viewport/screenshot");
const simple_settings_1 = require("./viewport/simple-settings");
class ViewportControls extends base_1.PluginUIComponent {
    constructor() {
        super(...arguments);
        this.allCollapsedState = {
            isSettingsExpanded: false,
            isScreenshotExpanded: false,
        };
        this.state = {
            ...this.allCollapsedState,
            isCameraResetEnabled: true,
        };
        this.resetCamera = () => {
            commands_1.PluginCommands.Camera.Reset(this.plugin, {});
        };
        this.toggleSettingsExpanded = this.toggle('isSettingsExpanded');
        this.toggleScreenshotExpanded = this.toggle('isScreenshotExpanded');
        this.toggleControls = () => {
            commands_1.PluginCommands.Layout.Update(this.plugin, { state: { showControls: !this.plugin.layout.state.showControls } });
        };
        this.toggleExpanded = () => {
            commands_1.PluginCommands.Layout.Update(this.plugin, { state: { isExpanded: !this.plugin.layout.state.isExpanded } });
        };
        this.setSettings = (p) => {
            commands_1.PluginCommands.Canvas3D.SetSettings(this.plugin, { settings: { [p.name]: p.value } });
        };
        this.setLayout = (p) => {
            commands_1.PluginCommands.Layout.Update(this.plugin, { state: { [p.name]: p.value } });
        };
        this.screenshot = () => {
            var _a;
            (_a = this.plugin.helpers.viewportScreenshot) === null || _a === void 0 ? void 0 : _a.download();
        };
        this.enableCameraReset = (enable) => {
            this.setState(old => ({ ...old, isCameraResetEnabled: enable }));
        };
    }
    toggle(panel) {
        return (e) => {
            this.setState(old => ({ ...old, ...this.allCollapsedState, [panel]: !this.state[panel] }));
            e === null || e === void 0 ? void 0 : e.currentTarget.blur();
        };
    }
    componentDidMount() {
        this.subscribe(this.plugin.events.canvas3d.settingsUpdated, () => this.forceUpdate());
        this.subscribe(this.plugin.layout.events.updated, () => this.forceUpdate());
        if (this.plugin.canvas3d) {
            this.subscribe(this.plugin.canvas3d.camera.stateChanged.pipe((0, rxjs_1.throttleTime)(500, undefined, { leading: true, trailing: true })), snapshot => this.enableCameraReset(snapshot.radius !== 0 && snapshot.radiusMax !== 0));
        }
    }
    icon(icon, onClick, title, isOn = true) {
        return (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icon, toggleState: isOn, onClick: onClick, title: title, style: { background: 'transparent' } });
    }
    render() {
        return (0, jsx_runtime_1.jsxs)("div", { className: 'msp-viewport-controls', children: [(0, jsx_runtime_1.jsxs)("div", { className: 'msp-viewport-controls-buttons', children: [(0, jsx_runtime_1.jsxs)("div", { className: 'msp-hover-box-wrapper', children: [(0, jsx_runtime_1.jsx)("div", { className: 'msp-semi-transparent-background' }), this.icon(icons_1.AutorenewSvg, this.resetCamera, 'Reset Zoom'), (0, jsx_runtime_1.jsx)("div", { className: 'msp-hover-box-body', children: (0, jsx_runtime_1.jsxs)("div", { className: 'msp-flex-column', children: [(0, jsx_runtime_1.jsx)("div", { className: 'msp-flex-row', children: (0, jsx_runtime_1.jsx)(common_1.Button, { onClick: () => this.resetCamera(), disabled: !this.state.isCameraResetEnabled, title: 'Set camera zoom to fit the visible scene into view', children: "Reset Zoom" }) }), (0, jsx_runtime_1.jsx)("div", { className: 'msp-flex-row', children: (0, jsx_runtime_1.jsx)(common_1.Button, { onClick: () => commands_1.PluginCommands.Camera.OrientAxes(this.plugin), disabled: !this.state.isCameraResetEnabled, title: 'Align principal component axes of the loaded structures to the screen axes (\u201Clay flat\u201D)', children: "Orient Axes" }) }), (0, jsx_runtime_1.jsx)("div", { className: 'msp-flex-row', children: (0, jsx_runtime_1.jsx)(common_1.Button, { onClick: () => commands_1.PluginCommands.Camera.ResetAxes(this.plugin), disabled: !this.state.isCameraResetEnabled, title: 'Align Cartesian axes to the screen axes', children: "Reset Axes" }) })] }) }), (0, jsx_runtime_1.jsx)("div", { className: 'msp-hover-box-spacer' })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: 'msp-semi-transparent-background' }), this.icon(icons_1.CameraOutlinedSvg, this.toggleScreenshotExpanded, 'Screenshot / State Snapshot', this.state.isScreenshotExpanded)] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: 'msp-semi-transparent-background' }), this.plugin.config.get(config_1.PluginConfig.Viewport.ShowControls) && this.icon(icons_1.BuildOutlinedSvg, this.toggleControls, 'Toggle Controls Panel', this.plugin.layout.state.showControls), this.plugin.config.get(config_1.PluginConfig.Viewport.ShowExpand) && this.icon(icons_1.FullscreenSvg, this.toggleExpanded, 'Toggle Expanded Viewport', this.plugin.layout.state.isExpanded), this.plugin.config.get(config_1.PluginConfig.Viewport.ShowSettings) && this.icon(icons_1.TuneSvg, this.toggleSettingsExpanded, 'Settings / Controls Info', this.state.isSettingsExpanded)] }), this.plugin.config.get(config_1.PluginConfig.Viewport.ShowSelectionMode) && (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: 'msp-semi-transparent-background' }), (0, jsx_runtime_1.jsx)(selection_1.ToggleSelectionModeButton, {})] })] }), this.state.isScreenshotExpanded && (0, jsx_runtime_1.jsx)("div", { className: 'msp-viewport-controls-panel', children: (0, jsx_runtime_1.jsx)(common_1.ControlGroup, { header: 'Screenshot / State', title: 'Click to close.', initialExpanded: true, hideExpander: true, hideOffset: true, onHeaderClick: this.toggleScreenshotExpanded, topRightIcon: icons_1.CloseSvg, noTopMargin: true, childrenClassName: 'msp-viewport-controls-panel-controls', children: (0, jsx_runtime_1.jsx)(screenshot_1.DownloadScreenshotControls, { close: this.toggleScreenshotExpanded }) }) }), this.state.isSettingsExpanded && (0, jsx_runtime_1.jsx)("div", { className: 'msp-viewport-controls-panel', children: (0, jsx_runtime_1.jsx)(common_1.ControlGroup, { header: 'Settings / Controls Info', title: 'Click to close.', initialExpanded: true, hideExpander: true, hideOffset: true, onHeaderClick: this.toggleSettingsExpanded, topRightIcon: icons_1.CloseSvg, noTopMargin: true, childrenClassName: 'msp-viewport-controls-panel-controls', children: (0, jsx_runtime_1.jsx)(simple_settings_1.SimpleSettingsControl, {}) }) })] });
    }
}
exports.ViewportControls = ViewportControls;
const Logo = () => (0, jsx_runtime_1.jsx)("a", { className: 'msp-logo', href: 'https://molstar.org', target: '_blank' });
exports.Logo = Logo;
const Viewport = () => (0, jsx_runtime_1.jsx)(canvas_1.ViewportCanvas, { logo: exports.Logo });
exports.Viewport = Viewport;
