"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteStateSnapshots = exports.LocalStateSnapshotList = exports.LocalStateSnapshots = exports.LocalStateSnapshotParams = exports.StateExportImportControls = exports.StateSnapshots = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
const immutable_1 = require("immutable");
const React = tslib_1.__importStar(require("react"));
const commands_1 = require("../../mol-plugin/commands");
const config_1 = require("../../mol-plugin/config");
const state_1 = require("../../mol-plugin/state");
const mol_util_1 = require("../../mol-util");
const now_1 = require("../../mol-util/now");
const param_definition_1 = require("../../mol-util/param-definition");
const url_1 = require("../../mol-util/url");
const base_1 = require("../base");
const common_1 = require("../controls/common");
const icons_1 = require("../controls/icons");
const parameters_1 = require("../controls/parameters");
class StateSnapshots extends base_1.PluginUIComponent {
    render() {
        var _a;
        return (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(common_1.SectionHeader, { icon: icons_1.SaveOutlinedSvg, title: 'Plugin State' }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '10px' }, children: (0, jsx_runtime_1.jsx)(common_1.ExpandGroup, { header: 'Save Options', initiallyExpanded: false, children: (0, jsx_runtime_1.jsx)(LocalStateSnapshotParams, {}) }) }), (0, jsx_runtime_1.jsx)(LocalStateSnapshots, {}), (0, jsx_runtime_1.jsx)(LocalStateSnapshotList, {}), (0, jsx_runtime_1.jsx)(common_1.SectionHeader, { title: 'Save as File', accent: 'blue' }), (0, jsx_runtime_1.jsx)(StateExportImportControls, {}), ((_a = this.plugin.spec.components) === null || _a === void 0 ? void 0 : _a.remoteState) !== 'none' && (0, jsx_runtime_1.jsx)(RemoteStateSnapshots, {})] });
    }
}
exports.StateSnapshots = StateSnapshots;
class StateExportImportControls extends base_1.PluginUIComponent {
    constructor() {
        super(...arguments);
        this.downloadToFileJson = () => {
            var _a, _b;
            (_b = (_a = this.props).onAction) === null || _b === void 0 ? void 0 : _b.call(_a);
            commands_1.PluginCommands.State.Snapshots.DownloadToFile(this.plugin, { type: 'json' });
        };
        this.downloadToFileZip = () => {
            var _a, _b;
            (_b = (_a = this.props).onAction) === null || _b === void 0 ? void 0 : _b.call(_a);
            commands_1.PluginCommands.State.Snapshots.DownloadToFile(this.plugin, { type: 'zip' });
        };
        this.open = (e) => {
            var _a, _b;
            if (!e.target.files || !e.target.files[0]) {
                this.plugin.log.error('No state file selected');
                return;
            }
            (_b = (_a = this.props).onAction) === null || _b === void 0 ? void 0 : _b.call(_a);
            commands_1.PluginCommands.State.Snapshots.OpenFile(this.plugin, { file: e.target.files[0] });
        };
    }
    render() {
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: 'msp-flex-row', children: [(0, jsx_runtime_1.jsx)(common_1.Button, { icon: icons_1.GetAppSvg, onClick: this.downloadToFileJson, title: 'Save the state description. Input data are loaded using the provided sources. Does not work if local files are used as input.', children: "State" }), (0, jsx_runtime_1.jsx)(common_1.Button, { icon: icons_1.GetAppSvg, onClick: this.downloadToFileZip, title: 'Save the state including the input data.', children: "Session" }), (0, jsx_runtime_1.jsxs)("div", { className: 'msp-btn msp-btn-block msp-btn-action msp-loader-msp-btn-file', children: [(0, jsx_runtime_1.jsx)(icons_1.Icon, { svg: icons_1.OpenInBrowserSvg, inline: true }), " Open ", (0, jsx_runtime_1.jsx)("input", { onChange: this.open, type: 'file', multiple: false, accept: '.molx,.molj' })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: 'msp-help-text', style: { padding: '10px' }, children: [(0, jsx_runtime_1.jsx)(icons_1.Icon, { svg: icons_1.WarningSvg }), " This is an experimental feature and stored states/sessions might not be openable in a future version."] })] });
    }
}
exports.StateExportImportControls = StateExportImportControls;
class LocalStateSnapshotParams extends base_1.PluginUIComponent {
    componentDidMount() {
        this.subscribe(this.plugin.state.snapshotParams, () => this.forceUpdate());
    }
    render() {
        return (0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: state_1.PluginState.SnapshotParams, values: this.plugin.state.snapshotParams.value, onChangeValues: this.plugin.state.setSnapshotParams });
    }
}
exports.LocalStateSnapshotParams = LocalStateSnapshotParams;
class LocalStateSnapshots extends base_1.PluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = { params: param_definition_1.ParamDefinition.getDefaultValues(LocalStateSnapshots.Params) };
        this.add = () => {
            commands_1.PluginCommands.State.Snapshots.Add(this.plugin, {
                name: this.state.params.name,
                description: this.state.params.description
            });
        };
        this.updateParams = (params) => this.setState({ params });
        this.clear = () => {
            commands_1.PluginCommands.State.Snapshots.Clear(this.plugin, {});
        };
    }
    shouldComponentUpdate(nextProps, nextState) {
        return !(0, mol_util_1.shallowEqualObjects)(this.props, nextProps) || !(0, mol_util_1.shallowEqualObjects)(this.state, nextState);
    }
    render() {
        return (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(AddSnapshot, { parent: this }) });
    }
}
exports.LocalStateSnapshots = LocalStateSnapshots;
LocalStateSnapshots.Params = {
    name: param_definition_1.ParamDefinition.Text(),
    description: param_definition_1.ParamDefinition.Text()
};
function invalidateSnapshotKey(plugin, key, currentId) {
    if (!key)
        return false;
    return plugin.managers.snapshot.state.entries.some(e => (!currentId || e.snapshot.id !== currentId) && e.key === key);
}
function AddSnapshot({ parent }) {
    const [state, setState] = React.useState({ key: '', name: '', description: '' });
    const add = () => {
        commands_1.PluginCommands.State.Snapshots.Add(parent.plugin, {
            key: state.key,
            name: state.name,
            description: state.description
        });
        setState({ key: '', name: '', description: '' });
    };
    const keyExists = invalidateSnapshotKey(parent.plugin, state.key);
    return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(EditSnapshotParams, { state: state, setState: setState, apply: add }), (0, jsx_runtime_1.jsxs)("div", { className: 'msp-flex-row', children: [(0, jsx_runtime_1.jsx)(common_1.IconButton, { onClick: parent.clear, svg: icons_1.DeleteOutlinedSvg, title: 'Remove All' }), (0, jsx_runtime_1.jsx)(common_1.Button, { onClick: add, icon: keyExists ? undefined : icons_1.AddSvg, style: { textAlign: 'right' }, commit: keyExists ? 'off' : 'on', disabled: keyExists, children: keyExists
                            ? 'Key must be unique'
                            : 'Add' })] })] });
}
class LocalStateSnapshotList extends base_1.PluginUIComponent {
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
            commands_1.PluginCommands.State.Snapshots.Apply(this.plugin, { id });
        };
        this.remove = (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (!id)
                return;
            commands_1.PluginCommands.State.Snapshots.Remove(this.plugin, { id });
        };
        this.moveUp = (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (!id)
                return;
            commands_1.PluginCommands.State.Snapshots.Move(this.plugin, { id, dir: -1 });
        };
        this.moveDown = (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (!id)
                return;
            commands_1.PluginCommands.State.Snapshots.Move(this.plugin, { id, dir: 1 });
        };
        this.replace = (e) => {
            // TODO: add option change name/description
            const id = e.currentTarget.getAttribute('data-id');
            if (!id)
                return;
            commands_1.PluginCommands.State.Snapshots.Replace(this.plugin, { id });
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
            items.push((0, jsx_runtime_1.jsxs)("li", { className: 'msp-flex-row', children: [(0, jsx_runtime_1.jsxs)(common_1.Button, { "data-id": e.snapshot.id, onClick: this.apply, className: 'msp-no-overflow', children: [(0, jsx_runtime_1.jsxs)("span", { style: { fontWeight: e.snapshot.id === current ? 'bold' : void 0 }, children: [!!e.key && `[${e.key}] `, e.name || new Date(e.timestamp).toLocaleString()] }), " ", (0, jsx_runtime_1.jsx)("small", { children: `${e.snapshot.durationInMs ? (0, now_1.formatTimespan)(e.snapshot.durationInMs, false) : ''}` })] }), (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.TuneSvg, "data-id": e.snapshot.id, title: 'Edit', onClick: this.edit, flex: '28px' }), (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.ArrowUpwardSvg, "data-id": e.snapshot.id, title: 'Move Up', onClick: this.moveUp, flex: '20px' }), (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.ArrowDownwardSvg, "data-id": e.snapshot.id, title: 'Move Down', onClick: this.moveDown, flex: '20px' }), (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.SwapHorizSvg, "data-id": e.snapshot.id, title: 'Replace', onClick: this.replace, flex: '20px' }), (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.DeleteOutlinedSvg, "data-id": e.snapshot.id, title: 'Remove', onClick: this.remove, flex: '20px' })] }, e.snapshot.id));
            if (this.state.editingId === e.snapshot.id) {
                items.push((0, jsx_runtime_1.jsx)(EditSnapshot, { entry: e, plugin: this.plugin, done: this.doneEdit }, `${e.snapshot.id}-edit`));
            }
            const image = e.image && ((_a = this.plugin.managers.asset.get(e.image)) === null || _a === void 0 ? void 0 : _a.file);
            if (image) {
                items.push((0, jsx_runtime_1.jsx)("li", { className: 'msp-state-image-row', children: (0, jsx_runtime_1.jsx)(common_1.Button, { "data-id": e.snapshot.id, onClick: this.apply, children: (0, jsx_runtime_1.jsx)("img", { draggable: false, src: URL.createObjectURL(image) }) }) }, `${e.snapshot.id}-image`));
            }
        });
        return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)("ul", { style: { listStyle: 'none', marginTop: '10px' }, className: 'msp-state-list', children: items }) });
    }
}
exports.LocalStateSnapshotList = LocalStateSnapshotList;
function EditSnapshotParams({ state, setState, apply }) {
    const keyRef = React.useRef();
    const descRef = React.useRef();
    const [showKeyHelp, setShowKeyHelp] = React.useState(false);
    return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(common_1.ControlRow, { label: 'Name', control: (0, jsx_runtime_1.jsx)("input", { type: 'text', value: state.name, placeholder: 'Name', onChange: e => setState({ ...state, name: e.target.value }), onKeyUp: e => {
                        var _a;
                        if (e.key === 'Enter')
                            (_a = keyRef.current) === null || _a === void 0 ? void 0 : _a.focus();
                    } }) }), (0, jsx_runtime_1.jsx)(common_1.ControlRow, { label: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["Key", (0, jsx_runtime_1.jsx)(parameters_1.ToggleParamHelpButton, { show: showKeyHelp, toggle: () => setShowKeyHelp(prev => !prev) })] }), control: (0, jsx_runtime_1.jsx)("input", { type: 'text', ref: keyRef, value: state.key, placeholder: 'Key (optional)', onChange: e => setState({ ...state, key: e.target.value }), onKeyUp: e => {
                        var _a;
                        if (e.key === 'Enter')
                            (_a = descRef.current) === null || _a === void 0 ? void 0 : _a.focus();
                    } }) }), showKeyHelp && (0, jsx_runtime_1.jsx)("div", { className: 'msp-control-offset', children: (0, jsx_runtime_1.jsx)(parameters_1.ParamHelp, { description: 'Optional snapshot key used to activate snapshots from descriptions, labels, etc.' }) }), (0, jsx_runtime_1.jsx)("div", { className: 'msp-flex-row msp-text-area-wrapper', style: { marginBottom: 1 }, children: (0, jsx_runtime_1.jsx)("textarea", { ref: descRef, 
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
    return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(EditSnapshotParams, { state: state, setState: setState, apply: apply }), (0, jsx_runtime_1.jsx)("div", { className: 'msp-flex-row', style: { marginBottom: 1 }, children: (0, jsx_runtime_1.jsx)(common_1.Button, { onClick: apply, icon: keyExists ? undefined : icons_1.CheckSvg, style: { textAlign: 'right' }, commit: keyExists ? 'off' : 'on', disabled: keyExists, children: keyExists
                        ? 'Key must be unique'
                        : 'Apply' }) })] });
}
class RemoteStateSnapshots extends base_1.PluginUIComponent {
    constructor() {
        super(...arguments);
        this.Params = {
            name: param_definition_1.ParamDefinition.Text(),
            options: param_definition_1.ParamDefinition.Group({
                description: param_definition_1.ParamDefinition.Text(),
                playOnLoad: param_definition_1.ParamDefinition.Boolean(false),
                serverUrl: param_definition_1.ParamDefinition.Text(this.plugin.config.get(config_1.PluginConfig.State.CurrentServer))
            })
        };
        this.state = { params: param_definition_1.ParamDefinition.getDefaultValues(this.Params), entries: (0, immutable_1.OrderedMap)(), isBusy: false };
        this.ListOnlyParams = {
            options: param_definition_1.ParamDefinition.Group({
                serverUrl: param_definition_1.ParamDefinition.Text(this.plugin.config.get(config_1.PluginConfig.State.CurrentServer))
            }, { isFlat: true })
        };
        this._mounted = false;
        this.refresh = async () => {
            try {
                this.setState({ isBusy: true });
                this.plugin.config.set(config_1.PluginConfig.State.CurrentServer, this.state.params.options.serverUrl);
                const json = (await this.plugin.runTask(this.plugin.fetch({ url: this.serverUrl('list'), type: 'json' }))) || [];
                json.sort((a, b) => {
                    if (a.isSticky === b.isSticky)
                        return a.timestamp - b.timestamp;
                    return a.isSticky ? -1 : 1;
                });
                const entries = (0, immutable_1.OrderedMap)().asMutable();
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
                    this.setState({ entries: (0, immutable_1.OrderedMap)(), isBusy: false });
            }
        };
        this.upload = async () => {
            this.setState({ isBusy: true });
            this.plugin.config.set(config_1.PluginConfig.State.CurrentServer, this.state.params.options.serverUrl);
            await commands_1.PluginCommands.State.Snapshots.Upload(this.plugin, {
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
                await commands_1.PluginCommands.State.Snapshots.Fetch(this.plugin, { url: entry.url });
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
        return (0, url_1.urlCombine)(this.state.params.options.serverUrl, q);
    }
    render() {
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(common_1.SectionHeader, { title: 'Remote States', accent: 'blue' }), !this.props.listOnly && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: this.Params, values: this.state.params, onEnter: this.upload, onChange: p => {
                                this.setState({ params: { ...this.state.params, [p.name]: p.value } });
                            }, isDisabled: this.state.isBusy }), (0, jsx_runtime_1.jsxs)("div", { className: 'msp-flex-row', children: [(0, jsx_runtime_1.jsx)(common_1.IconButton, { onClick: this.refresh, disabled: this.state.isBusy, svg: icons_1.RefreshSvg }), (0, jsx_runtime_1.jsx)(common_1.Button, { icon: icons_1.CloudUploadSvg, onClick: this.upload, disabled: this.state.isBusy, commit: true, children: "Upload" })] })] }), (0, jsx_runtime_1.jsx)(RemoteStateSnapshotList, { entries: this.state.entries, isBusy: this.state.isBusy, serverUrl: this.state.params.options.serverUrl, fetch: this.fetch, remove: this.props.listOnly ? void 0 : this.remove }), this.props.listOnly && (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: '10px' }, children: [(0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: this.ListOnlyParams, values: this.state.params, onEnter: this.upload, onChange: p => {
                                this.setState({ params: { ...this.state.params, [p.name]: p.value } });
                            }, isDisabled: this.state.isBusy }), (0, jsx_runtime_1.jsx)("div", { className: 'msp-flex-row', children: (0, jsx_runtime_1.jsx)(common_1.Button, { onClick: this.refresh, disabled: this.state.isBusy, icon: icons_1.RefreshSvg, children: "Refresh" }) })] })] });
    }
}
exports.RemoteStateSnapshots = RemoteStateSnapshots;
class RemoteStateSnapshotList extends base_1.PurePluginUIComponent {
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
        return (0, jsx_runtime_1.jsx)("ul", { style: { listStyle: 'none', marginTop: '10px' }, className: 'msp-state-list', children: this.props.entries.valueSeq().map(e => (0, jsx_runtime_1.jsxs)("li", { className: 'msp-flex-row', children: [(0, jsx_runtime_1.jsxs)(common_1.Button, { "data-id": e.id, onClick: this.props.fetch, disabled: this.props.isBusy, onContextMenu: this.open, title: 'Click to download, right-click to open in a new tab.', children: [e.name || new Date(e.timestamp).toLocaleString(), " ", (0, jsx_runtime_1.jsx)("small", { children: e.description })] }), !e.isSticky && this.props.remove && (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.DeleteOutlinedSvg, "data-id": e.id, title: 'Remove', onClick: this.props.remove, disabled: this.props.isBusy, small: true })] }, e.id)) });
    }
}
