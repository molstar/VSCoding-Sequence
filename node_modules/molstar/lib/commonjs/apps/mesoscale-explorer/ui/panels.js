"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RightPanel = exports.LeftPanel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2022-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
const ui_1 = require("../../../extensions/mp4-export/ui");
const base_1 = require("../../../mol-plugin-ui/base");
const common_1 = require("../../../mol-plugin-ui/controls/common");
const parameters_1 = require("../../../mol-plugin-ui/controls/parameters");
const commands_1 = require("../../../mol-plugin/commands");
const measurements_1 = require("../../../mol-plugin-ui/structure/measurements");
const state_1 = require("../data/state");
const entities_1 = require("./entities");
const states_1 = require("./states");
const param_definition_1 = require("../../../mol-util/param-definition");
const icons_1 = require("../../../mol-plugin-ui/controls/icons");
const renderer_1 = require("../../../mol-gl/renderer");
const trackball_1 = require("../../../mol-canvas3d/controls/trackball");
const Spacer = () => (0, jsx_runtime_1.jsx)("div", { style: { height: '2em' } });
const ViewportParams = {
    renderer: param_definition_1.ParamDefinition.Group(renderer_1.RendererParams),
    trackball: param_definition_1.ParamDefinition.Group(trackball_1.TrackballControlsParams),
};
class ViewportSettingsUI extends base_1.CollapsableControls {
    constructor() {
        super(...arguments);
        this.setSettings = (p) => {
            commands_1.PluginCommands.Canvas3D.SetSettings(this.plugin, { settings: { [p.name]: p.value } });
        };
    }
    defaultState() {
        return {
            header: 'Viewport Settings',
            isCollapsed: true,
            brand: { accent: 'cyan', svg: icons_1.TuneSvg }
        };
    }
    renderControls() {
        return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: this.plugin.canvas3d && this.plugin.canvas3dContext && (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: ViewportParams, values: this.plugin.canvas3d.props, onChange: this.setSettings }) }) });
    }
    componentDidMount() {
        this.subscribe(this.plugin.events.canvas3d.settingsUpdated, () => this.forceUpdate());
        this.subscribe(this.plugin.layout.events.updated, () => this.forceUpdate());
    }
}
class LeftPanel extends base_1.PluginUIComponent {
    render() {
        var _a;
        const customState = this.plugin.customState;
        return (0, jsx_runtime_1.jsxs)("div", { className: 'msp-scrollable-container', children: [customState.driver && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(states_1.ExplorerInfo, {}), (0, jsx_runtime_1.jsx)(Spacer, {})] }), (0, jsx_runtime_1.jsx)(common_1.SectionHeader, { title: 'Database' }), (0, jsx_runtime_1.jsx)(states_1.DatabaseControls, {}), (0, jsx_runtime_1.jsx)(Spacer, {}), (0, jsx_runtime_1.jsx)(common_1.SectionHeader, { title: 'Open' }), (0, jsx_runtime_1.jsx)(states_1.LoaderControls, {}), (0, jsx_runtime_1.jsx)(Spacer, {}), ((_a = customState.examples) === null || _a === void 0 ? void 0 : _a.length) && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(common_1.SectionHeader, { title: 'Example' }), (0, jsx_runtime_1.jsx)(states_1.ExampleControls, {}), (0, jsx_runtime_1.jsx)(Spacer, {})] }), (0, jsx_runtime_1.jsx)(common_1.SectionHeader, { title: 'Session' }), (0, jsx_runtime_1.jsx)(states_1.SessionControls, {}), (0, jsx_runtime_1.jsx)(Spacer, {}), (0, jsx_runtime_1.jsx)(common_1.SectionHeader, { title: 'Snapshots' }), (0, jsx_runtime_1.jsx)(states_1.SnapshotControls, {}), (0, jsx_runtime_1.jsx)(Spacer, {}), (0, jsx_runtime_1.jsx)(ui_1.Mp4EncoderUI, {}), (0, jsx_runtime_1.jsx)(ViewportSettingsUI, {})] });
    }
}
exports.LeftPanel = LeftPanel;
class RightPanel extends base_1.PluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = {
            isDisabled: false,
        };
    }
    get hasModelInfo() {
        return (state_1.MesoscaleState.has(this.plugin) &&
            !!(state_1.MesoscaleState.get(this.plugin).description ||
                state_1.MesoscaleState.get(this.plugin).link));
    }
    get hasFocusInfo() {
        return (state_1.MesoscaleState.has(this.plugin) &&
            !!(state_1.MesoscaleState.get(this.plugin).focusInfo !== ''));
    }
    componentDidMount() {
        this.subscribe(this.plugin.state.data.behaviors.isUpdating, v => {
            this.setState({ isDisabled: v });
        });
        this.subscribe(this.plugin.state.events.cell.stateUpdated, e => {
            if (!this.state.isDisabled && state_1.MesoscaleState.has(this.plugin) && state_1.MesoscaleState.ref(this.plugin) === e.ref) {
                this.forceUpdate();
            }
        });
        this.subscribe(this.plugin.managers.structure.selection.events.changed, e => {
            if (!this.state.isDisabled) {
                this.forceUpdate();
            }
        });
    }
    render() {
        return (0, jsx_runtime_1.jsxs)("div", { className: 'msp-scrollable-container', children: [this.hasModelInfo && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(common_1.SectionHeader, { title: 'Model' }), (0, jsx_runtime_1.jsx)(entities_1.ModelInfo, {}), (0, jsx_runtime_1.jsx)(Spacer, {})] }), (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(common_1.SectionHeader, { title: 'Selection' }), (0, jsx_runtime_1.jsx)(entities_1.SelectionInfo, {}), (0, jsx_runtime_1.jsx)(Spacer, {}), (0, jsx_runtime_1.jsx)(measurements_1.StructureMeasurementsControls, { initiallyCollapsed: true })] }), (0, jsx_runtime_1.jsx)(states_1.MesoQuickStylesControls, {}), (0, jsx_runtime_1.jsx)(Spacer, {}), (0, jsx_runtime_1.jsx)(common_1.SectionHeader, { title: 'Entities' }), (0, jsx_runtime_1.jsx)(entities_1.EntityControls, {}), (0, jsx_runtime_1.jsx)(Spacer, {}), this.hasFocusInfo && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(common_1.SectionHeader, { title: 'Focus Info' }), (0, jsx_runtime_1.jsx)(entities_1.FocusInfo, {}), (0, jsx_runtime_1.jsx)(Spacer, {})] })] });
    }
}
exports.RightPanel = RightPanel;
