import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PluginCommands } from '../../mol-plugin/commands';
import { PluginUIComponent } from '../base';
import { Button, ExpandGroup, ToggleButton } from '../controls/common';
import { CopySvg, CropFreeSvg, CropOrginalSvg, CropSvg, GetAppSvg } from '../controls/icons';
import { ParameterControls } from '../controls/parameters';
import { ScreenshotPreview } from '../controls/screenshot';
import { useBehavior } from '../hooks/use-behavior';
import { LocalStateSnapshotParams, StateExportImportControls } from '../state/snapshots';
export class DownloadScreenshotControls extends PluginUIComponent {
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
                PluginCommands.Toast.Show(this.plugin, {
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
            PluginCommands.State.Snapshots.OpenFile(this.plugin, { file: e.target.files[0] });
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
        return _jsxs("div", { children: [this.state.showPreview && _jsxs("div", { className: 'msp-image-preview', children: [_jsx(ScreenshotPreview, { plugin: this.plugin }), _jsx(CropControls, { plugin: this.plugin })] }), _jsxs("div", { className: 'msp-flex-row', children: [!this.state.imageData && _jsx(Button, { icon: CopySvg, onClick: hasClipboardApi ? this.copy : this.copyImg, disabled: this.state.isDisabled, children: "Copy" }), this.state.imageData && _jsx(Button, { onClick: () => this.setState({ imageData: void 0 }), disabled: this.state.isDisabled, children: "Clear" }), _jsx(Button, { icon: GetAppSvg, onClick: this.download, disabled: this.state.isDisabled, children: "Download" })] }), this.state.imageData && _jsxs("div", { className: 'msp-row msp-copy-image-wrapper', children: [_jsx("div", { children: "Right click below + Copy Image" }), _jsx("img", { src: this.state.imageData, style: { width: '100%', height: 32, display: 'block' } })] }), _jsx(ScreenshotParams, { plugin: this.plugin, isDisabled: this.state.isDisabled }), _jsxs(ExpandGroup, { header: 'State', children: [_jsx(StateExportImportControls, { onAction: this.props.close }), _jsx(ExpandGroup, { header: 'Save Options', initiallyExpanded: false, noOffset: true, children: _jsx(LocalStateSnapshotParams, {}) })] })] });
    }
}
function ScreenshotParams({ plugin, isDisabled }) {
    const helper = plugin.helpers.viewportScreenshot;
    const values = useBehavior(helper === null || helper === void 0 ? void 0 : helper.behaviors.values);
    if (!helper)
        return null;
    return _jsx(ParameterControls, { params: helper.params, values: values, onChangeValues: v => helper.behaviors.values.next(v), isDisabled: isDisabled });
}
function CropControls({ plugin }) {
    const helper = plugin.helpers.viewportScreenshot;
    const cropParams = useBehavior(helper === null || helper === void 0 ? void 0 : helper.behaviors.cropParams);
    useBehavior(helper === null || helper === void 0 ? void 0 : helper.behaviors.relativeCrop);
    if (!helper || !cropParams)
        return null;
    return _jsxs("div", { style: { width: '100%', height: '24px', marginTop: '8px' }, children: [_jsx(ToggleButton, { icon: CropOrginalSvg, title: 'Auto-crop', inline: true, isSelected: cropParams.auto, style: { background: 'transparent', float: 'left', width: 'auto', height: '24px', lineHeight: '24px' }, toggle: () => helper.toggleAutocrop(), label: 'Auto-crop ' + (cropParams.auto ? 'On' : 'Off') }), !cropParams.auto && _jsx(Button, { icon: CropSvg, title: 'Crop', style: { background: 'transparent', float: 'right', height: '24px', lineHeight: '24px', width: '24px', padding: '0' }, onClick: () => helper.autocrop() }), !cropParams.auto && !helper.isFullFrame && _jsx(Button, { icon: CropFreeSvg, title: 'Reset Crop', style: { background: 'transparent', float: 'right', height: '24px', lineHeight: '24px', width: '24px', padding: '0' }, onClick: () => helper.resetCrop() })] });
}
