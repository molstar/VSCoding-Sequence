import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { throttleTime } from 'rxjs';
import { PluginCommands } from '../mol-plugin/commands';
import { PluginConfig } from '../mol-plugin/config';
import { PluginUIComponent } from './base';
import { Button, ControlGroup, IconButton } from './controls/common';
import { AutorenewSvg, BuildOutlinedSvg, CameraOutlinedSvg, CloseSvg, FullscreenSvg, TuneSvg } from './controls/icons';
import { ToggleSelectionModeButton } from './structure/selection';
import { ViewportCanvas } from './viewport/canvas';
import { DownloadScreenshotControls } from './viewport/screenshot';
import { SimpleSettingsControl } from './viewport/simple-settings';
export class ViewportControls extends PluginUIComponent {
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
            PluginCommands.Camera.Reset(this.plugin, {});
        };
        this.toggleSettingsExpanded = this.toggle('isSettingsExpanded');
        this.toggleScreenshotExpanded = this.toggle('isScreenshotExpanded');
        this.toggleControls = () => {
            PluginCommands.Layout.Update(this.plugin, { state: { showControls: !this.plugin.layout.state.showControls } });
        };
        this.toggleExpanded = () => {
            PluginCommands.Layout.Update(this.plugin, { state: { isExpanded: !this.plugin.layout.state.isExpanded } });
        };
        this.setSettings = (p) => {
            PluginCommands.Canvas3D.SetSettings(this.plugin, { settings: { [p.name]: p.value } });
        };
        this.setLayout = (p) => {
            PluginCommands.Layout.Update(this.plugin, { state: { [p.name]: p.value } });
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
            this.subscribe(this.plugin.canvas3d.camera.stateChanged.pipe(throttleTime(500, undefined, { leading: true, trailing: true })), snapshot => this.enableCameraReset(snapshot.radius !== 0 && snapshot.radiusMax !== 0));
        }
    }
    icon(icon, onClick, title, isOn = true) {
        return _jsx(IconButton, { svg: icon, toggleState: isOn, onClick: onClick, title: title, style: { background: 'transparent' } });
    }
    render() {
        return _jsxs("div", { className: 'msp-viewport-controls', children: [_jsxs("div", { className: 'msp-viewport-controls-buttons', children: [_jsxs("div", { className: 'msp-hover-box-wrapper', children: [_jsx("div", { className: 'msp-semi-transparent-background' }), this.icon(AutorenewSvg, this.resetCamera, 'Reset Zoom'), _jsx("div", { className: 'msp-hover-box-body', children: _jsxs("div", { className: 'msp-flex-column', children: [_jsx("div", { className: 'msp-flex-row', children: _jsx(Button, { onClick: () => this.resetCamera(), disabled: !this.state.isCameraResetEnabled, title: 'Set camera zoom to fit the visible scene into view', children: "Reset Zoom" }) }), _jsx("div", { className: 'msp-flex-row', children: _jsx(Button, { onClick: () => PluginCommands.Camera.OrientAxes(this.plugin), disabled: !this.state.isCameraResetEnabled, title: 'Align principal component axes of the loaded structures to the screen axes (\u201Clay flat\u201D)', children: "Orient Axes" }) }), _jsx("div", { className: 'msp-flex-row', children: _jsx(Button, { onClick: () => PluginCommands.Camera.ResetAxes(this.plugin), disabled: !this.state.isCameraResetEnabled, title: 'Align Cartesian axes to the screen axes', children: "Reset Axes" }) })] }) }), _jsx("div", { className: 'msp-hover-box-spacer' })] }), _jsxs("div", { children: [_jsx("div", { className: 'msp-semi-transparent-background' }), this.icon(CameraOutlinedSvg, this.toggleScreenshotExpanded, 'Screenshot / State Snapshot', this.state.isScreenshotExpanded)] }), _jsxs("div", { children: [_jsx("div", { className: 'msp-semi-transparent-background' }), this.plugin.config.get(PluginConfig.Viewport.ShowControls) && this.icon(BuildOutlinedSvg, this.toggleControls, 'Toggle Controls Panel', this.plugin.layout.state.showControls), this.plugin.config.get(PluginConfig.Viewport.ShowExpand) && this.icon(FullscreenSvg, this.toggleExpanded, 'Toggle Expanded Viewport', this.plugin.layout.state.isExpanded), this.plugin.config.get(PluginConfig.Viewport.ShowSettings) && this.icon(TuneSvg, this.toggleSettingsExpanded, 'Settings / Controls Info', this.state.isSettingsExpanded)] }), this.plugin.config.get(PluginConfig.Viewport.ShowSelectionMode) && _jsxs("div", { children: [_jsx("div", { className: 'msp-semi-transparent-background' }), _jsx(ToggleSelectionModeButton, {})] })] }), this.state.isScreenshotExpanded && _jsx("div", { className: 'msp-viewport-controls-panel', children: _jsx(ControlGroup, { header: 'Screenshot / State', title: 'Click to close.', initialExpanded: true, hideExpander: true, hideOffset: true, onHeaderClick: this.toggleScreenshotExpanded, topRightIcon: CloseSvg, noTopMargin: true, childrenClassName: 'msp-viewport-controls-panel-controls', children: _jsx(DownloadScreenshotControls, { close: this.toggleScreenshotExpanded }) }) }), this.state.isSettingsExpanded && _jsx("div", { className: 'msp-viewport-controls-panel', children: _jsx(ControlGroup, { header: 'Settings / Controls Info', title: 'Click to close.', initialExpanded: true, hideExpander: true, hideOffset: true, onHeaderClick: this.toggleSettingsExpanded, topRightIcon: CloseSvg, noTopMargin: true, childrenClassName: 'msp-viewport-controls-panel-controls', children: _jsx(SimpleSettingsControl, {}) }) })] });
    }
}
export const Logo = () => _jsx("a", { className: 'msp-logo', href: 'https://molstar.org', target: '_blank' });
export const Viewport = () => _jsx(ViewportCanvas, { logo: Logo });
