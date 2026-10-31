import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { OrderedMap } from 'immutable';
import * as React from 'react';
import { PluginCommands } from '../../mol-plugin/commands';
import { PluginConfig } from '../../mol-plugin/config';
import { PluginState } from '../../mol-plugin/state';
import { shallowEqualObjects } from '../../mol-util';
import { formatTimespan } from '../../mol-util/now';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { urlCombine } from '../../mol-util/url';
import { PluginUIComponent, PurePluginUIComponent } from '../base';
import { Button, ControlRow, ExpandGroup, IconButton, SectionHeader } from '../controls/common';
import { Icon, SaveOutlinedSvg, GetAppSvg, OpenInBrowserSvg, WarningSvg, DeleteOutlinedSvg, AddSvg, ArrowUpwardSvg, SwapHorizSvg, ArrowDownwardSvg, RefreshSvg, CloudUploadSvg, CheckSvg, TuneSvg } from '../controls/icons';
import { ParamHelp, ParameterControls, ToggleParamHelpButton } from '../controls/parameters';
export class StateSnapshots extends PluginUIComponent {
    render() {
        var _a;
        return _jsxs("div", { children: [_jsx(SectionHeader, { icon: SaveOutlinedSvg, title: 'Plugin State' }), _jsx("div", { style: { marginBottom: '10px' }, children: _jsx(ExpandGroup, { header: 'Save Options', initiallyExpanded: false, children: _jsx(LocalStateSnapshotParams, {}) }) }), _jsx(LocalStateSnapshots, {}), _jsx(LocalStateSnapshotList, {}), _jsx(SectionHeader, { title: 'Save as File', accent: 'blue' }), _jsx(StateExportImportControls, {}), ((_a = this.plugin.spec.components) === null || _a === void 0 ? void 0 : _a.remoteState) !== 'none' && _jsx(RemoteStateSnapshots, {})] });
    }
}
export class StateExportImportControls extends PluginUIComponent {
    constructor() {
        super(...arguments);
        this.downloadToFileJson = () => {
            var _a, _b;
            (_b = (_a = this.props).onAction) === null || _b === void 0 ? void 0 : _b.call(_a);
            PluginCommands.State.Snapshots.DownloadToFile(this.plugin, { type: 'json' });
        };
        this.downloadToFileZip = () => {
            var _a, _b;
            (_b = (_a = this.props).onAction) === null || _b === void 0 ? void 0 : _b.call(_a);
            PluginCommands.State.Snapshots.DownloadToFile(this.plugin, { type: 'zip' });
        };
        this.open = (e) => {
            var _a, _b;
            if (!e.target.files || !e.target.files[0]) {
                this.plugin.log.error('No state file selected');
                return;
            }
            (_b = (_a = this.props).onAction) === null || _b === void 0 ? void 0 : _b.call(_a);
            PluginCommands.State.Snapshots.OpenFile(this.plugin, { file: e.target.files[0] });
        };
    }
    render() {
        return _jsxs(_Fragment, { children: [_jsxs("div", { className: 'msp-flex-row', children: [_jsx(Button, { icon: GetAppSvg, onClick: this.downloadToFileJson, title: 'Save the state description. Input data are loaded using the provided sources. Does not work if local files are used as input.', children: "State" }), _jsx(Button, { icon: GetAppSvg, onClick: this.downloadToFileZip, title: 'Save the state including the input data.', children: "Session" }), _jsxs("div", { className: 'msp-btn msp-btn-block msp-btn-action msp-loader-msp-btn-file', children: [_jsx(Icon, { svg: OpenInBrowserSvg, inline: true }), " Open ", _jsx("input", { onChange: this.open, type: 'file', multiple: false, accept: '.molx,.molj' })] })] }), _jsxs("div", { className: 'msp-help-text', style: { padding: '10px' }, children: [_jsx(Icon, { svg: WarningSvg }), " This is an experimental feature and stored states/sessions might not be openable in a future version."] })] });
    }
}
export class LocalStateSnapshotParams extends PluginUIComponent {
    componentDidMount() {
        this.subscribe(this.plugin.state.snapshotParams, () => this.forceUpdate());
    }
    render() {
        return _jsx(ParameterControls, { params: PluginState.SnapshotParams, values: this.plugin.state.snapshotParams.value, onChangeValues: this.plugin.state.setSnapshotParams });
    }
}
export class LocalStateSnapshots extends PluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = { params: PD.getDefaultValues(LocalStateSnapshots.Params) };
        this.add = () => {
            PluginCommands.State.Snapshots.Add(this.plugin, {
                name: this.state.params.name,
                description: this.state.params.description
            });
        };
        this.updateParams = (params) => this.setState({ params });
        this.clear = () => {
            PluginCommands.State.Snapshots.Clear(this.plugin, {});
        };
    }
    shouldComponentUpdate(nextProps, nextState) {
        return !shallowEqualObjects(this.props, nextProps) || !shallowEqualObjects(this.state, nextState);
    }
    render() {
        return _jsx("div", { children: _jsx(AddSnapshot, { parent: this }) });
    }
}
LocalStateSnapshots.Params = {
    name: PD.Text(),
    description: PD.Text()
};
function invalidateSnapshotKey(plugin, key, currentId) {
    if (!key)
        return false;
    return plugin.managers.snapshot.state.entries.some(e => (!currentId || e.snapshot.id !== currentId) && e.key === key);
}
function AddSnapshot({ parent }) {
    const [state, setState] = React.useState({ key: '', name: '', description: '' });
    const add = () => {
        PluginCommands.State.Snapshots.Add(parent.plugin, {
            key: state.key,
            name: state.name,
            description: state.description
        });
        setState({ key: '', name: '', description: '' });
    };
    const keyExists = invalidateSnapshotKey(parent.plugin, state.key);
    return _jsxs(_Fragment, { children: [_jsx(EditSnapshotParams, { state: state, setState: setState, apply: add }), _jsxs("div", { className: 'msp-flex-row', children: [_jsx(IconButton, { onClick: parent.clear, svg: DeleteOutlinedSvg, title: 'Remove All' }), _jsx(Button, { onClick: add, icon: keyExists ? undefined : AddSvg, style: { textAlign: 'right' }, commit: keyExists ? 'off' : 'on', disabled: keyExists, children: keyExists
                            ? 'Key must be unique'
                            : 'Add' })] })] });
}
export class LocalStateSnapshotList extends PluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = { editingId: undefined };
        this.edit = (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (!id)
                return;
            const current = this.state.editingId;
            this.setState({ editingId: id === current ? undefined : id });
        };
        this.doneEdit = () => this.setState({ editingId: undefined });
        this.apply = (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (!id)
                return;
            PluginCommands.State.Snapshots.Apply(this.plugin, { id });
        };
        this.remove = (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (!id)
                return;
            PluginCommands.State.Snapshots.Remove(this.plugin, { id });
        };
        this.moveUp = (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (!id)
                return;
            PluginCommands.State.Snapshots.Move(this.plugin, { id, dir: -1 });
        };
        this.moveDown = (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (!id)
                return;
            PluginCommands.State.Snapshots.Move(this.plugin, { id, dir: 1 });
        };
        this.replace = (e) => {
            // TODO: add option change name/description
            const id = e.currentTarget.getAttribute('data-id');
            if (!id)
                return;
            PluginCommands.State.Snapshots.Replace(this.plugin, { id });
        };
    }
    componentDidMount() {
        this.subscribe(this.plugin.managers.snapshot.events.changed, () => this.forceUpdate());
    }
    render() {
        const current = this.plugin.managers.snapshot.state.current;
        const items = [];
        this.plugin.managers.snapshot.state.entries.forEach(e => {
            var _a;
            items.push(_jsxs("li", { className: 'msp-flex-row', children: [_jsxs(Button, { "data-id": e.snapshot.id, onClick: this.apply, className: 'msp-no-overflow', children: [_jsxs("span", { style: { fontWeight: e.snapshot.id === current ? 'bold' : void 0 }, children: [!!e.key && `[${e.key}] `, e.name || new Date(e.timestamp).toLocaleString()] }), " ", _jsx("small", { children: `${e.snapshot.durationInMs ? formatTimespan(e.snapshot.durationInMs, false) : ''}` })] }), _jsx(IconButton, { svg: TuneSvg, "data-id": e.snapshot.id, title: 'Edit', onClick: this.edit, flex: '28px' }), _jsx(IconButton, { svg: ArrowUpwardSvg, "data-id": e.snapshot.id, title: 'Move Up', onClick: this.moveUp, flex: '20px' }), _jsx(IconButton, { svg: ArrowDownwardSvg, "data-id": e.snapshot.id, title: 'Move Down', onClick: this.moveDown, flex: '20px' }), _jsx(IconButton, { svg: SwapHorizSvg, "data-id": e.snapshot.id, title: 'Replace', onClick: this.replace, flex: '20px' }), _jsx(IconButton, { svg: DeleteOutlinedSvg, "data-id": e.snapshot.id, title: 'Remove', onClick: this.remove, flex: '20px' })] }, e.snapshot.id));
            if (this.state.editingId === e.snapshot.id) {
                items.push(_jsx(EditSnapshot, { entry: e, plugin: this.plugin, done: this.doneEdit }, `${e.snapshot.id}-edit`));
            }
            const image = e.image && ((_a = this.plugin.managers.asset.get(e.image)) === null || _a === void 0 ? void 0 : _a.file);
            if (image) {
                items.push(_jsx("li", { className: 'msp-state-image-row', children: _jsx(Button, { "data-id": e.snapshot.id, onClick: this.apply, children: _jsx("img", { draggable: false, src: URL.createObjectURL(image) }) }) }, `${e.snapshot.id}-image`));
            }
        });
        return _jsx(_Fragment, { children: _jsx("ul", { style: { listStyle: 'none', marginTop: '10px' }, className: 'msp-state-list', children: items }) });
    }
}
function EditSnapshotParams({ state, setState, apply }) {
    const keyRef = React.useRef();
    const descRef = React.useRef();
    const [showKeyHelp, setShowKeyHelp] = React.useState(false);
    return _jsxs(_Fragment, { children: [_jsx(ControlRow, { label: 'Name', control: _jsx("input", { type: 'text', value: state.name, placeholder: 'Name', onChange: e => setState({ ...state, name: e.target.value }), onKeyUp: e => {
                        var _a;
                        if (e.key === 'Enter')
                            (_a = keyRef.current) === null || _a === void 0 ? void 0 : _a.focus();
                    } }) }), _jsx(ControlRow, { label: _jsxs(_Fragment, { children: ["Key", _jsx(ToggleParamHelpButton, { show: showKeyHelp, toggle: () => setShowKeyHelp(prev => !prev) })] }), control: _jsx("input", { type: 'text', ref: keyRef, value: state.key, placeholder: 'Key (optional)', onChange: e => setState({ ...state, key: e.target.value }), onKeyUp: e => {
                        var _a;
                        if (e.key === 'Enter')
                            (_a = descRef.current) === null || _a === void 0 ? void 0 : _a.focus();
                    } }) }), showKeyHelp && _jsx("div", { className: 'msp-control-offset', children: _jsx(ParamHelp, { description: 'Optional snapshot key used to activate snapshots from descriptions, labels, etc.' }) }), _jsx("div", { className: 'msp-flex-row msp-text-area-wrapper', style: { marginBottom: 1 }, children: _jsx("textarea", { ref: descRef, 
                    // NOTE: curly brackets are required to support \n in the placeholder, do not remove
                    placeholder: 'Markdown Description\n\n- Use [title](#key) to link to a snapshot', className: 'msp-form-control', value: state.description, onChange: e => setState({ ...state, description: e.target.value }), onKeyUp: e => {
                        if (e.key === 'Enter' && e.ctrlKey)
                            apply(state);
                    } }) })] });
}
function EditSnapshot({ entry, plugin, done }) {
    var _a, _b, _c;
    const [state, setState] = React.useState({ key: (_a = entry.key) !== null && _a !== void 0 ? _a : '', name: (_b = entry.name) !== null && _b !== void 0 ? _b : '', description: (_c = entry.description) !== null && _c !== void 0 ? _c : '' });
    const apply = () => {
        plugin.managers.snapshot.update(entry, state);
        done();
    };
    const keyExists = invalidateSnapshotKey(plugin, state.key, entry.snapshot.id);
    return _jsxs(_Fragment, { children: [_jsx(EditSnapshotParams, { state: state, setState: setState, apply: apply }), _jsx("div", { className: 'msp-flex-row', style: { marginBottom: 1 }, children: _jsx(Button, { onClick: apply, icon: keyExists ? undefined : CheckSvg, style: { textAlign: 'right' }, commit: keyExists ? 'off' : 'on', disabled: keyExists, children: keyExists
                        ? 'Key must be unique'
                        : 'Apply' }) })] });
}
export class RemoteStateSnapshots extends PluginUIComponent {
    constructor() {
        super(...arguments);
        this.Params = {
            name: PD.Text(),
            options: PD.Group({
                description: PD.Text(),
                playOnLoad: PD.Boolean(false),
                serverUrl: PD.Text(this.plugin.config.get(PluginConfig.State.CurrentServer))
            })
        };
        this.state = { params: PD.getDefaultValues(this.Params), entries: OrderedMap(), isBusy: false };
        this.ListOnlyParams = {
            options: PD.Group({
                serverUrl: PD.Text(this.plugin.config.get(PluginConfig.State.CurrentServer))
            }, { isFlat: true })
        };
        this._mounted = false;
        this.refresh = async () => {
            try {
                this.setState({ isBusy: true });
                this.plugin.config.set(PluginConfig.State.CurrentServer, this.state.params.options.serverUrl);
                const json = (await this.plugin.runTask(this.plugin.fetch({ url: this.serverUrl('list'), type: 'json' }))) || [];
                json.sort((a, b) => {
                    if (a.isSticky === b.isSticky)
                        return a.timestamp - b.timestamp;
                    return a.isSticky ? -1 : 1;
                });
                const entries = OrderedMap().asMutable();
                for (const e of json) {
                    entries.set(e.id, {
                        ...e,
                        url: this.serverUrl(`get/${e.id}`),
                        removeUrl: this.serverUrl(`remove/${e.id}`)
                    });
                }
                if (this._mounted)
                    this.setState({ entries: entries.asImmutable(), isBusy: false });
            }
            catch (e) {
                console.error(e);
                this.plugin.log.error('Error fetching remote snapshots');
                if (this._mounted)
                    this.setState({ entries: OrderedMap(), isBusy: false });
            }
        };
        this.upload = async () => {
            this.setState({ isBusy: true });
            this.plugin.config.set(PluginConfig.State.CurrentServer, this.state.params.options.serverUrl);
            await PluginCommands.State.Snapshots.Upload(this.plugin, {
                name: this.state.params.name,
                description: this.state.params.options.description,
                playOnLoad: this.state.params.options.playOnLoad,
                serverUrl: this.state.params.options.serverUrl
            });
            this.plugin.log.message('Snapshot uploaded.');
            if (this._mounted) {
                this.setState({ isBusy: false });
                this.refresh();
            }
        };
        this.fetch = async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (!id)
                return;
            const entry = this.state.entries.get(id);
            if (!entry)
                return;
            this.setState({ isBusy: true });
            try {
                await PluginCommands.State.Snapshots.Fetch(this.plugin, { url: entry.url });
            }
            finally {
                if (this._mounted)
                    this.setState({ isBusy: false });
            }
        };
        this.remove = async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (!id)
                return;
            const entry = this.state.entries.get(id);
            if (!entry)
                return;
            this.setState({ entries: this.state.entries.remove(id) });
            try {
                await fetch(entry.removeUrl);
            }
            catch (e) {
                console.error(e);
            }
        };
    }
    componentDidMount() {
        this.refresh();
        // TODO: solve this by using "PluginComponent" with behaviors intead
        this._mounted = true;
        // this.subscribe(UploadedEvent, this.refresh);
    }
    componentWillUnmount() {
        super.componentWillUnmount();
        this._mounted = false;
    }
    serverUrl(q) {
        if (!q)
            return this.state.params.options.serverUrl;
        return urlCombine(this.state.params.options.serverUrl, q);
    }
    render() {
        return _jsxs(_Fragment, { children: [_jsx(SectionHeader, { title: 'Remote States', accent: 'blue' }), !this.props.listOnly && _jsxs(_Fragment, { children: [_jsx(ParameterControls, { params: this.Params, values: this.state.params, onEnter: this.upload, onChange: p => {
                                this.setState({ params: { ...this.state.params, [p.name]: p.value } });
                            }, isDisabled: this.state.isBusy }), _jsxs("div", { className: 'msp-flex-row', children: [_jsx(IconButton, { onClick: this.refresh, disabled: this.state.isBusy, svg: RefreshSvg }), _jsx(Button, { icon: CloudUploadSvg, onClick: this.upload, disabled: this.state.isBusy, commit: true, children: "Upload" })] })] }), _jsx(RemoteStateSnapshotList, { entries: this.state.entries, isBusy: this.state.isBusy, serverUrl: this.state.params.options.serverUrl, fetch: this.fetch, remove: this.props.listOnly ? void 0 : this.remove }), this.props.listOnly && _jsxs("div", { style: { marginTop: '10px' }, children: [_jsx(ParameterControls, { params: this.ListOnlyParams, values: this.state.params, onEnter: this.upload, onChange: p => {
                                this.setState({ params: { ...this.state.params, [p.name]: p.value } });
                            }, isDisabled: this.state.isBusy }), _jsx("div", { className: 'msp-flex-row', children: _jsx(Button, { onClick: this.refresh, disabled: this.state.isBusy, icon: RefreshSvg, children: "Refresh" }) })] })] });
    }
}
class RemoteStateSnapshotList extends PurePluginUIComponent {
    constructor() {
        super(...arguments);
        this.open = async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (!id)
                return;
            const entry = this.props.entries.get(id);
            if (!entry)
                return;
            e.preventDefault();
            let url = `${window.location}`;
            const qi = url.indexOf('?');
            if (qi > 0)
                url = url.substr(0, qi);
            window.open(`${url}?snapshot-url=${encodeURIComponent(entry.url)}`, '_blank');
        };
    }
    render() {
        return _jsx("ul", { style: { listStyle: 'none', marginTop: '10px' }, className: 'msp-state-list', children: this.props.entries.valueSeq().map(e => _jsxs("li", { className: 'msp-flex-row', children: [_jsxs(Button, { "data-id": e.id, onClick: this.props.fetch, disabled: this.props.isBusy, onContextMenu: this.open, title: 'Click to download, right-click to open in a new tab.', children: [e.name || new Date(e.timestamp).toLocaleString(), " ", _jsx("small", { children: e.description })] }), !e.isSticky && this.props.remove && _jsx(IconButton, { svg: DeleteOutlinedSvg, "data-id": e.id, title: 'Remove', onClick: this.props.remove, disabled: this.props.isBusy, small: true })] }, e.id)) });
    }
}
