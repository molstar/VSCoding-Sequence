"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeftPanelControls = exports.CustomImportControls = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const rxjs_1 = require("rxjs");
const canvas3d_1 = require("../mol-canvas3d/canvas3d");
const commands_1 = require("../mol-plugin/commands");
const mol_state_1 = require("../mol-state");
const base_1 = require("./base");
const common_1 = require("./controls/common");
const icons_1 = require("./controls/icons");
const parameters_1 = require("./controls/parameters");
const actions_1 = require("./state/actions");
const snapshots_1 = require("./state/snapshots");
const tree_1 = require("./state/tree");
const help_1 = require("./viewport/help");
class CustomImportControls extends base_1.PluginUIComponent {
    componentDidMount() {
        this.subscribe(this.plugin.state.behaviors.events.changed, () => this.forceUpdate());
    }
    render() {
        const controls = [];
        this.plugin.customImportControls.forEach((Controls, key) => {
            controls.push((0, jsx_runtime_1.jsx)(Controls, { initiallyCollapsed: this.props.initiallyCollapsed }, key));
        });
        return controls.length > 0 ? (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: controls }) : null;
    }
}
exports.CustomImportControls = CustomImportControls;
class LeftPanelControls extends base_1.PluginUIComponent {
    constructor() {
        var _a;
        super(...arguments);
        this.state = { tab: this.plugin.behaviors.layout.leftPanelTabName.value };
        this.set = (tab) => {
            if (this.state.tab === tab) {
                this.setState({ tab: 'none' }, () => this.plugin.behaviors.layout.leftPanelTabName.next('none'));
                commands_1.PluginCommands.Layout.Update(this.plugin, { state: { regionState: { ...this.plugin.layout.state.regionState, left: 'collapsed' } } });
                return;
            }
            this.setState({ tab }, () => this.plugin.behaviors.layout.leftPanelTabName.next(tab));
            if (this.plugin.layout.state.regionState.left !== 'full') {
                commands_1.PluginCommands.Layout.Update(this.plugin, { state: { regionState: { ...this.plugin.layout.state.regionState, left: 'full' } } });
            }
        };
        this.tabs = {
            'none': (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, {}),
            'root': (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(common_1.SectionHeader, { icon: icons_1.HomeOutlinedSvg, title: 'Home' }), (0, jsx_runtime_1.jsx)(actions_1.StateObjectActions, { state: this.plugin.state.data, nodeRef: mol_state_1.StateTransform.RootRef, hideHeader: true, initiallyCollapsed: true, alwaysExpandFirst: true }), (0, jsx_runtime_1.jsx)(CustomImportControls, {}), ((_a = this.plugin.spec.components) === null || _a === void 0 ? void 0 : _a.remoteState) !== 'none' && (0, jsx_runtime_1.jsx)(snapshots_1.RemoteStateSnapshots, { listOnly: true })] }),
            'data': (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(common_1.SectionHeader, { icon: icons_1.AccountTreeOutlinedSvg, title: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(RemoveAllButton, {}), " State Tree"] }) }), (0, jsx_runtime_1.jsx)(tree_1.StateTree, { state: this.plugin.state.data })] }),
            'states': (0, jsx_runtime_1.jsx)(snapshots_1.StateSnapshots, {}),
            'settings': (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(common_1.SectionHeader, { icon: icons_1.TuneSvg, title: 'Plugin Settings' }), (0, jsx_runtime_1.jsx)(FullSettings, {})] }),
            'help': (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(common_1.SectionHeader, { icon: icons_1.HelpOutlineSvg, title: 'Help' }), (0, jsx_runtime_1.jsx)(help_1.HelpContent, {})] })
        };
    }
    componentDidMount() {
        this.subscribe(this.plugin.behaviors.layout.leftPanelTabName, tab => {
            if (this.state.tab !== tab)
                this.setState({ tab });
            if (tab === 'none' && this.plugin.layout.state.regionState.left !== 'collapsed') {
                commands_1.PluginCommands.Layout.Update(this.plugin, { state: { regionState: { ...this.plugin.layout.state.regionState, left: 'collapsed' } } });
            }
        });
        this.subscribe(this.plugin.state.data.events.changed, ({ state }) => {
            if (this.state.tab !== 'data')
                return;
            if (state.cells.size === 1)
                this.set('root');
        });
    }
    render() {
        const tab = this.state.tab;
        return (0, jsx_runtime_1.jsxs)("div", { className: 'msp-left-panel-controls', children: [(0, jsx_runtime_1.jsxs)("div", { className: 'msp-left-panel-controls-buttons', children: [(0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.HomeOutlinedSvg, toggleState: tab === 'root', transparent: true, onClick: () => this.set('root'), title: 'Home' }), (0, jsx_runtime_1.jsx)(DataIcon, { set: this.set }), (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.SaveOutlinedSvg, toggleState: tab === 'states', transparent: true, onClick: () => this.set('states'), title: 'Plugin State' }), (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.HelpOutlineSvg, toggleState: tab === 'help', transparent: true, onClick: () => this.set('help'), title: 'Help' }), (0, jsx_runtime_1.jsx)("div", { className: 'msp-left-panel-controls-buttons-bottom', children: (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.TuneSvg, toggleState: tab === 'settings', transparent: true, onClick: () => this.set('settings'), title: 'Settings' }) })] }), (0, jsx_runtime_1.jsx)("div", { className: 'msp-scrollable-container', children: this.tabs[tab] })] });
    }
}
exports.LeftPanelControls = LeftPanelControls;
class DataIcon extends base_1.PluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = { changed: false };
    }
    get tab() {
        return this.plugin.behaviors.layout.leftPanelTabName.value;
    }
    componentDidMount() {
        this.subscribe(this.plugin.behaviors.layout.leftPanelTabName, tab => {
            if (this.tab === 'data')
                this.setState({ changed: false });
            else
                this.forceUpdate();
        });
        this.subscribe(this.plugin.state.data.events.changed, state => {
            if (this.tab !== 'data')
                this.setState({ changed: true });
        });
    }
    render() {
        return (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.AccountTreeOutlinedSvg, toggleState: this.tab === 'data', transparent: true, onClick: () => this.props.set('data'), title: 'State Tree', style: { position: 'relative' }, extraContent: this.state.changed ? (0, jsx_runtime_1.jsx)("div", { className: 'msp-left-panel-controls-button-data-dirty' }) : void 0 });
    }
}
class FullSettings extends base_1.PluginUIComponent {
    constructor() {
        super(...arguments);
        this.setSettings = (p) => {
            commands_1.PluginCommands.Canvas3D.SetSettings(this.plugin, { settings: { [p.name]: p.value } });
        };
        this.setCanvas3DContextProps = (p) => {
            var _a;
            (_a = this.plugin.canvas3dContext) === null || _a === void 0 ? void 0 : _a.setProps({ [p.name]: p.value });
            this.plugin.events.canvas3d.settingsUpdated.next(void 0);
        };
    }
    componentDidMount() {
        this.subscribe(this.plugin.events.canvas3d.settingsUpdated, () => this.forceUpdate());
        this.subscribe(this.plugin.layout.events.updated, () => this.forceUpdate());
        if (this.plugin.canvas3d) {
            this.subscribe(this.plugin.canvas3d.camera.stateChanged.pipe((0, rxjs_1.throttleTime)(500, undefined, { leading: true, trailing: true })), state => {
                if (state.radiusMax !== undefined || state.radius !== undefined) {
                    this.forceUpdate();
                }
            });
        }
    }
    render() {
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [this.plugin.canvas3d && this.plugin.canvas3dContext && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(common_1.SectionHeader, { title: 'Viewport' }), (0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: canvas3d_1.Canvas3DParams, values: this.plugin.canvas3d.props, onChange: this.setSettings }), (0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: canvas3d_1.Canvas3DContext.Params, values: this.plugin.canvas3dContext.props, onChange: this.setCanvas3DContextProps })] }), (0, jsx_runtime_1.jsx)(common_1.SectionHeader, { title: 'Behavior' }), (0, jsx_runtime_1.jsx)(tree_1.StateTree, { state: this.plugin.state.behaviors })] });
    }
}
class RemoveAllButton extends base_1.PluginUIComponent {
    constructor() {
        super(...arguments);
        this.remove = (e) => {
            e.preventDefault();
            commands_1.PluginCommands.State.RemoveObject(this.plugin, { state: this.plugin.state.data, ref: mol_state_1.StateTransform.RootRef });
        };
    }
    componentDidMount() {
        this.subscribe(this.plugin.state.events.cell.created, e => {
            if (e.cell.transform.parent === mol_state_1.StateTransform.RootRef)
                this.forceUpdate();
        });
        this.subscribe(this.plugin.state.events.cell.removed, e => {
            if (e.parent === mol_state_1.StateTransform.RootRef)
                this.forceUpdate();
        });
    }
    render() {
        const count = this.plugin.state.data.tree.children.get(mol_state_1.StateTransform.RootRef).size;
        if (count === 0)
            return null;
        return (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.DeleteOutlinedSvg, onClick: this.remove, title: 'Remove All', style: { display: 'inline-block' }, small: true, className: 'msp-no-hover-outline', transparent: true });
    }
}
