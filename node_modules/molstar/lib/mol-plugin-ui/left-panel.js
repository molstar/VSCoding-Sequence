import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { throttleTime } from 'rxjs';
import { Canvas3DContext, Canvas3DParams } from '../mol-canvas3d/canvas3d';
import { PluginCommands } from '../mol-plugin/commands';
import { StateTransform } from '../mol-state';
import { PluginUIComponent } from './base';
import { IconButton, SectionHeader } from './controls/common';
import { AccountTreeOutlinedSvg, DeleteOutlinedSvg, HelpOutlineSvg, HomeOutlinedSvg, SaveOutlinedSvg, TuneSvg } from './controls/icons';
import { ParameterControls } from './controls/parameters';
import { StateObjectActions } from './state/actions';
import { RemoteStateSnapshots, StateSnapshots } from './state/snapshots';
import { StateTree } from './state/tree';
import { HelpContent } from './viewport/help';
export class CustomImportControls extends PluginUIComponent {
    componentDidMount() {
        this.subscribe(this.plugin.state.behaviors.events.changed, () => this.forceUpdate());
    }
    render() {
        const controls = [];
        this.plugin.customImportControls.forEach((Controls, key) => {
            controls.push(_jsx(Controls, { initiallyCollapsed: this.props.initiallyCollapsed }, key));
        });
        return controls.length > 0 ? _jsx(_Fragment, { children: controls }) : null;
    }
}
export class LeftPanelControls extends PluginUIComponent {
    constructor() {
        var _a;
        super(...arguments);
        this.state = { tab: this.plugin.behaviors.layout.leftPanelTabName.value };
        this.set = (tab) => {
            if (this.state.tab === tab) {
                this.setState({ tab: 'none' }, () => this.plugin.behaviors.layout.leftPanelTabName.next('none'));
                PluginCommands.Layout.Update(this.plugin, { state: { regionState: { ...this.plugin.layout.state.regionState, left: 'collapsed' } } });
                return;
            }
            this.setState({ tab }, () => this.plugin.behaviors.layout.leftPanelTabName.next(tab));
            if (this.plugin.layout.state.regionState.left !== 'full') {
                PluginCommands.Layout.Update(this.plugin, { state: { regionState: { ...this.plugin.layout.state.regionState, left: 'full' } } });
            }
        };
        this.tabs = {
            'none': _jsx(_Fragment, {}),
            'root': _jsxs(_Fragment, { children: [_jsx(SectionHeader, { icon: HomeOutlinedSvg, title: 'Home' }), _jsx(StateObjectActions, { state: this.plugin.state.data, nodeRef: StateTransform.RootRef, hideHeader: true, initiallyCollapsed: true, alwaysExpandFirst: true }), _jsx(CustomImportControls, {}), ((_a = this.plugin.spec.components) === null || _a === void 0 ? void 0 : _a.remoteState) !== 'none' && _jsx(RemoteStateSnapshots, { listOnly: true })] }),
            'data': _jsxs(_Fragment, { children: [_jsx(SectionHeader, { icon: AccountTreeOutlinedSvg, title: _jsxs(_Fragment, { children: [_jsx(RemoveAllButton, {}), " State Tree"] }) }), _jsx(StateTree, { state: this.plugin.state.data })] }),
            'states': _jsx(StateSnapshots, {}),
            'settings': _jsxs(_Fragment, { children: [_jsx(SectionHeader, { icon: TuneSvg, title: 'Plugin Settings' }), _jsx(FullSettings, {})] }),
            'help': _jsxs(_Fragment, { children: [_jsx(SectionHeader, { icon: HelpOutlineSvg, title: 'Help' }), _jsx(HelpContent, {})] })
        };
    }
    componentDidMount() {
        this.subscribe(this.plugin.behaviors.layout.leftPanelTabName, tab => {
            if (this.state.tab !== tab)
                this.setState({ tab });
            if (tab === 'none' && this.plugin.layout.state.regionState.left !== 'collapsed') {
                PluginCommands.Layout.Update(this.plugin, { state: { regionState: { ...this.plugin.layout.state.regionState, left: 'collapsed' } } });
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
        return _jsxs("div", { className: 'msp-left-panel-controls', children: [_jsxs("div", { className: 'msp-left-panel-controls-buttons', children: [_jsx(IconButton, { svg: HomeOutlinedSvg, toggleState: tab === 'root', transparent: true, onClick: () => this.set('root'), title: 'Home' }), _jsx(DataIcon, { set: this.set }), _jsx(IconButton, { svg: SaveOutlinedSvg, toggleState: tab === 'states', transparent: true, onClick: () => this.set('states'), title: 'Plugin State' }), _jsx(IconButton, { svg: HelpOutlineSvg, toggleState: tab === 'help', transparent: true, onClick: () => this.set('help'), title: 'Help' }), _jsx("div", { className: 'msp-left-panel-controls-buttons-bottom', children: _jsx(IconButton, { svg: TuneSvg, toggleState: tab === 'settings', transparent: true, onClick: () => this.set('settings'), title: 'Settings' }) })] }), _jsx("div", { className: 'msp-scrollable-container', children: this.tabs[tab] })] });
    }
}
class DataIcon extends PluginUIComponent {
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
        return _jsx(IconButton, { svg: AccountTreeOutlinedSvg, toggleState: this.tab === 'data', transparent: true, onClick: () => this.props.set('data'), title: 'State Tree', style: { position: 'relative' }, extraContent: this.state.changed ? _jsx("div", { className: 'msp-left-panel-controls-button-data-dirty' }) : void 0 });
    }
}
class FullSettings extends PluginUIComponent {
    constructor() {
        super(...arguments);
        this.setSettings = (p) => {
            PluginCommands.Canvas3D.SetSettings(this.plugin, { settings: { [p.name]: p.value } });
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
            this.subscribe(this.plugin.canvas3d.camera.stateChanged.pipe(throttleTime(500, undefined, { leading: true, trailing: true })), state => {
                if (state.radiusMax !== undefined || state.radius !== undefined) {
                    this.forceUpdate();
                }
            });
        }
    }
    render() {
        return _jsxs(_Fragment, { children: [this.plugin.canvas3d && this.plugin.canvas3dContext && _jsxs(_Fragment, { children: [_jsx(SectionHeader, { title: 'Viewport' }), _jsx(ParameterControls, { params: Canvas3DParams, values: this.plugin.canvas3d.props, onChange: this.setSettings }), _jsx(ParameterControls, { params: Canvas3DContext.Params, values: this.plugin.canvas3dContext.props, onChange: this.setCanvas3DContextProps })] }), _jsx(SectionHeader, { title: 'Behavior' }), _jsx(StateTree, { state: this.plugin.state.behaviors })] });
    }
}
class RemoveAllButton extends PluginUIComponent {
    constructor() {
        super(...arguments);
        this.remove = (e) => {
            e.preventDefault();
            PluginCommands.State.RemoveObject(this.plugin, { state: this.plugin.state.data, ref: StateTransform.RootRef });
        };
    }
    componentDidMount() {
        this.subscribe(this.plugin.state.events.cell.created, e => {
            if (e.cell.transform.parent === StateTransform.RootRef)
                this.forceUpdate();
        });
        this.subscribe(this.plugin.state.events.cell.removed, e => {
            if (e.parent === StateTransform.RootRef)
                this.forceUpdate();
        });
    }
    render() {
        const count = this.plugin.state.data.tree.children.get(StateTransform.RootRef).size;
        if (count === 0)
            return null;
        return _jsx(IconButton, { svg: DeleteOutlinedSvg, onClick: this.remove, title: 'Remove All', style: { display: 'inline-block' }, small: true, className: 'msp-no-hover-outline', transparent: true });
    }
}
