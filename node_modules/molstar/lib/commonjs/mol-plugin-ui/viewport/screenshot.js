"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownloadScreenshotControls = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const commands_1 = require("../../mol-plugin/commands");
const base_1 = require("../base");
const common_1 = require("../controls/common");
const icons_1 = require("../controls/icons");
const parameters_1 = require("../controls/parameters");
const screenshot_1 = require("../controls/screenshot");
const use_behavior_1 = require("../hooks/use-behavior");
const snapshots_1 = require("../state/snapshots");
class DownloadScreenshotControls extends base_1.PluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = {
            showPreview: true,
            isDisabled: false
        };
        this.download = () => {
            var _a;
            (_a = this.plugin.helpers.viewportScreenshot) === null || _a === void 0 ? void 0 : _a.download();
            this.props.close();
        };
        this.copy = async () => {
            var _a;
            try {
                await ((_a = this.plugin.helpers.viewportScreenshot) === null || _a === void 0 ? void 0 : _a.copyToClipboard());
                commands_1.PluginCommands.Toast.Show(this.plugin, {
                    message: 'Copied to clipboard.',
                    title: 'Screenshot',
                    timeoutMs: 1500
                });
            }
            catch (_b) {
                return this.copyImg();
            }
        };
        this.copyImg = async () => {
            var _a;
            const src = await ((_a = this.plugin.helpers.viewportScreenshot) === null || _a === void 0 ? void 0 : _a.getImageDataUri());
            this.setState({ imageData: src });
        };
        this.open = (e) => {
            if (!e.target.files || !e.target.files[0])
                return;
            commands_1.PluginCommands.State.Snapshots.OpenFile(this.plugin, { file: e.target.files[0] });
        };
    }
    componentDidMount() {
        this.subscribe(this.plugin.state.data.behaviors.isUpdating, v => {
            this.setState({ isDisabled: v });
        });
    }
    componentWillUnmount() {
        super.componentWillUnmount();
        this.setState({ imageData: void 0 });
    }
    render() {
        var _a;
        const hasClipboardApi = !!((_a = navigator.clipboard) === null || _a === void 0 ? void 0 : _a.write);
        return (0, jsx_runtime_1.jsxs)("div", { children: [this.state.showPreview && (0, jsx_runtime_1.jsxs)("div", { className: 'msp-image-preview', children: [(0, jsx_runtime_1.jsx)(screenshot_1.ScreenshotPreview, { plugin: this.plugin }), (0, jsx_runtime_1.jsx)(CropControls, { plugin: this.plugin })] }), (0, jsx_runtime_1.jsxs)("div", { className: 'msp-flex-row', children: [!this.state.imageData && (0, jsx_runtime_1.jsx)(common_1.Button, { icon: icons_1.CopySvg, onClick: hasClipboardApi ? this.copy : this.copyImg, disabled: this.state.isDisabled, children: "Copy" }), this.state.imageData && (0, jsx_runtime_1.jsx)(common_1.Button, { onClick: () => this.setState({ imageData: void 0 }), disabled: this.state.isDisabled, children: "Clear" }), (0, jsx_runtime_1.jsx)(common_1.Button, { icon: icons_1.GetAppSvg, onClick: this.download, disabled: this.state.isDisabled, children: "Download" })] }), this.state.imageData && (0, jsx_runtime_1.jsxs)("div", { className: 'msp-row msp-copy-image-wrapper', children: [(0, jsx_runtime_1.jsx)("div", { children: "Right click below + Copy Image" }), (0, jsx_runtime_1.jsx)("img", { src: this.state.imageData, style: { width: '100%', height: 32, display: 'block' } })] }), (0, jsx_runtime_1.jsx)(ScreenshotParams, { plugin: this.plugin, isDisabled: this.state.isDisabled }), (0, jsx_runtime_1.jsxs)(common_1.ExpandGroup, { header: 'State', children: [(0, jsx_runtime_1.jsx)(snapshots_1.StateExportImportControls, { onAction: this.props.close }), (0, jsx_runtime_1.jsx)(common_1.ExpandGroup, { header: 'Save Options', initiallyExpanded: false, noOffset: true, children: (0, jsx_runtime_1.jsx)(snapshots_1.LocalStateSnapshotParams, {}) })] })] });
    }
}
exports.DownloadScreenshotControls = DownloadScreenshotControls;
function ScreenshotParams({ plugin, isDisabled }) {
    const helper = plugin.helpers.viewportScreenshot;
    const values = (0, use_behavior_1.useBehavior)(helper === null || helper === void 0 ? void 0 : helper.behaviors.values);
    if (!helper)
        return null;
    return (0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: helper.params, values: values, onChangeValues: v => helper.behaviors.values.next(v), isDisabled: isDisabled });
}
function CropControls({ plugin }) {
    const helper = plugin.helpers.viewportScreenshot;
    const cropParams = (0, use_behavior_1.useBehavior)(helper === null || helper === void 0 ? void 0 : helper.behaviors.cropParams);
    (0, use_behavior_1.useBehavior)(helper === null || helper === void 0 ? void 0 : helper.behaviors.relativeCrop);
    if (!helper || !cropParams)
        return null;
    return (0, jsx_runtime_1.jsxs)("div", { style: { width: '100%', height: '24px', marginTop: '8px' }, children: [(0, jsx_runtime_1.jsx)(common_1.ToggleButton, { icon: icons_1.CropOrginalSvg, title: 'Auto-crop', inline: true, isSelected: cropParams.auto, style: { background: 'transparent', float: 'left', width: 'auto', height: '24px', lineHeight: '24px' }, toggle: () => helper.toggleAutocrop(), label: 'Auto-crop ' + (cropParams.auto ? 'On' : 'Off') }), !cropParams.auto && (0, jsx_runtime_1.jsx)(common_1.Button, { icon: icons_1.CropSvg, title: 'Crop', style: { background: 'transparent', float: 'right', height: '24px', lineHeight: '24px', width: '24px', padding: '0' }, onClick: () => helper.autocrop() }), !cropParams.auto && !helper.isFullFrame && (0, jsx_runtime_1.jsx)(common_1.Button, { icon: icons_1.CropFreeSvg, title: 'Reset Crop', style: { background: 'transparent', float: 'right', height: '24px', lineHeight: '24px', width: '24px', padding: '0' }, onClick: () => helper.resetCrop() })] });
}
