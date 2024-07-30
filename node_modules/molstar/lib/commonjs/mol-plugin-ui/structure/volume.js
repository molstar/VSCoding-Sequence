"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolumeSourceControls = exports.VolumeStreamingControls = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const hierarchy_1 = require("../../mol-plugin-state/manager/structure/hierarchy");
const hierarchy_2 = require("../../mol-plugin-state/manager/volume/hierarchy");
const representation_1 = require("../../mol-plugin/behavior/dynamic/representation");
const behavior_1 = require("../../mol-plugin/behavior/dynamic/volume-streaming/behavior");
const transformers_1 = require("../../mol-plugin/behavior/dynamic/volume-streaming/transformers");
const mol_state_1 = require("../../mol-state");
const base_1 = require("../base");
const action_menu_1 = require("../controls/action-menu");
const common_1 = require("../controls/common");
const apply_action_1 = require("../state/apply-action");
const update_transform_1 = require("../state/update-transform");
const help_1 = require("../viewport/help");
const commands_1 = require("../../mol-plugin/commands");
const icons_1 = require("../controls/icons");
const transforms_1 = require("../../mol-plugin-state/transforms");
const volume_representation_params_1 = require("../../mol-plugin-state/helpers/volume-representation-params");
const color_1 = require("../../mol-util/color");
const param_definition_1 = require("../../mol-util/param-definition");
const color_2 = require("../controls/color");
class VolumeStreamingControls extends base_1.CollapsableControls {
    defaultState() {
        return {
            header: 'Volume Streaming',
            isCollapsed: false,
            isBusy: false,
            isHidden: true,
            brand: { accent: 'cyan', svg: icons_1.BlurOnSvg }
        };
    }
    componentDidMount() {
        // TODO: do not hide this but instead show some help text??
        this.subscribe(this.plugin.managers.structure.hierarchy.behaviors.selection, () => {
            this.setState({
                isHidden: !this.canEnable(),
                description: hierarchy_1.StructureHierarchyManager.getSelectedStructuresDescription(this.plugin)
            });
        });
        this.subscribe(this.plugin.state.events.cell.stateUpdated, e => {
            if (mol_state_1.StateTransform.hasTag(e.cell.transform, behavior_1.VolumeStreaming.RootTag))
                this.forceUpdate();
        });
        this.subscribe(this.plugin.behaviors.state.isBusy, v => {
            this.setState({ isBusy: v });
        });
    }
    get pivot() {
        return this.plugin.managers.structure.hierarchy.selection.structures[0];
    }
    canEnable() {
        var _a, _b;
        const { selection } = this.plugin.managers.structure.hierarchy;
        if (selection.structures.length !== 1)
            return false;
        const pivot = this.pivot.cell;
        if (!pivot.obj)
            return false;
        return !!((_b = (_a = transformers_1.InitVolumeStreaming.definition).isApplicable) === null || _b === void 0 ? void 0 : _b.call(_a, pivot.obj, pivot.transform, this.plugin));
    }
    renderEnable() {
        var _a, _b;
        const pivot = this.pivot;
        if (!pivot.cell.parent)
            return null;
        const root = mol_state_1.StateSelection.findTagInSubtree(pivot.cell.parent.tree, this.pivot.cell.transform.ref, behavior_1.VolumeStreaming.RootTag);
        const rootCell = root && pivot.cell.parent.cells.get(root);
        const simpleApply = rootCell && rootCell.status === 'error'
            ? { header: !!rootCell.errorText && ((_a = rootCell.errorText) === null || _a === void 0 ? void 0 : _a.includes('404')) ? 'No Density Data Available' : 'Error Enabling', icon: icons_1.ErrorSvg, title: rootCell.errorText }
            : rootCell && ((_b = rootCell.obj) === null || _b === void 0 ? void 0 : _b.data.entries.length) === 0
                ? { header: 'Error Enabling', icon: icons_1.ErrorSvg, title: 'No Entry for Streaming Found' }
                : { header: 'Enable', icon: icons_1.CheckSvg, title: 'Enable' };
        return (0, jsx_runtime_1.jsx)(apply_action_1.ApplyActionControl, { state: pivot.cell.parent, action: transformers_1.InitVolumeStreaming, initiallyCollapsed: true, nodeRef: pivot.cell.transform.ref, simpleApply: simpleApply });
    }
    renderParams() {
        var _a, _b, _c, _d, _e;
        const pivot = this.pivot;
        if (!pivot.cell.parent)
            return null;
        const bindings = ((_b = (_a = pivot.volumeStreaming) === null || _a === void 0 ? void 0 : _a.cell.transform.params) === null || _b === void 0 ? void 0 : _b.entry.params.view.name) === 'selection-box' && ((_e = (_d = (_c = this.plugin.state.behaviors.cells.get(representation_1.FocusLoci.id)) === null || _c === void 0 ? void 0 : _c.params) === null || _d === void 0 ? void 0 : _d.values) === null || _e === void 0 ? void 0 : _e.bindings);
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(update_transform_1.UpdateTransformControl, { state: pivot.cell.parent, transform: pivot.volumeStreaming.cell.transform, customHeader: 'none', noMargin: true }), bindings && (0, jsx_runtime_1.jsx)(common_1.ExpandGroup, { header: 'Controls Help', children: (0, jsx_runtime_1.jsx)(help_1.BindingsHelp, { bindings: bindings }) })] });
    }
    renderControls() {
        const pivot = this.pivot;
        if (!pivot)
            return null;
        if (!pivot.volumeStreaming)
            return this.renderEnable();
        return this.renderParams();
    }
}
exports.VolumeStreamingControls = VolumeStreamingControls;
class VolumeSourceControls extends base_1.CollapsableControls {
    constructor() {
        super(...arguments);
        this.item = (ref) => {
            var _a;
            const selected = this.plugin.managers.volume.hierarchy.selection;
            const label = ((_a = ref.cell.obj) === null || _a === void 0 ? void 0 : _a.label) || 'Volume';
            const item = {
                kind: 'item',
                label: (ref.kind === 'lazy-volume' ? 'Load ' : '') + (label || ref.kind),
                selected: selected === ref,
                value: ref
            };
            return item;
        };
        this.selectCurrent = (item) => {
            this.toggleHierarchy();
            if (!item)
                return;
            const current = item.value;
            if (current.kind === 'volume') {
                this.plugin.managers.volume.hierarchy.setCurrent(current);
            }
            else {
                this.lazyLoad(current.cell);
            }
        };
        this.selectAdd = (item) => {
            if (!item)
                return;
            this.setState({ show: void 0 });
            item.value();
        };
        this.toggleHierarchy = () => this.setState({ show: this.state.show !== 'hierarchy' ? 'hierarchy' : void 0 });
        this.toggleAddRepr = () => this.setState({ show: this.state.show !== 'add-repr' ? 'add-repr' : void 0 });
    }
    defaultState() {
        return {
            header: 'Volume',
            isCollapsed: false,
            isBusy: false,
            isHidden: true,
            brand: { accent: 'purple', svg: icons_1.BlurOnSvg }
        };
    }
    componentDidMount() {
        this.subscribe(this.plugin.managers.volume.hierarchy.behaviors.selection, sel => {
            this.setState({ isHidden: sel.hierarchy.volumes.length === 0 && sel.hierarchy.lazyVolumes.length === 0 });
        });
        this.subscribe(this.plugin.behaviors.state.isBusy, v => {
            this.setState({ isBusy: v });
        });
    }
    get hierarchyItems() {
        const mng = this.plugin.managers.volume.hierarchy;
        const { current } = mng;
        const ret = [];
        for (const ref of current.volumes) {
            ret.push(this.item(ref));
        }
        for (const ref of current.lazyVolumes) {
            ret.push(this.item(ref));
        }
        return ret;
    }
    get addActions() {
        const mng = this.plugin.managers.volume.hierarchy;
        const current = mng.selection;
        const ret = [
            ...hierarchy_2.VolumeHierarchyManager.getRepresentationTypes(this.plugin, current)
                .map(t => action_menu_1.ActionMenu.Item(t[1], () => mng.addRepresentation(current, t[0])))
        ];
        return ret;
    }
    get isEmpty() {
        const { volumes, lazyVolumes } = this.plugin.managers.volume.hierarchy.current;
        return volumes.length === 0 && lazyVolumes.length === 0;
    }
    get label() {
        var _a;
        if (this.state.loadingLabel)
            return `Loading ${this.state.loadingLabel}...`;
        const selected = this.plugin.managers.volume.hierarchy.selection;
        if (!selected)
            return 'Nothing Selected';
        return ((_a = selected === null || selected === void 0 ? void 0 : selected.cell.obj) === null || _a === void 0 ? void 0 : _a.label) || 'Volume';
    }
    async lazyLoad(cell) {
        const { url, isBinary, format, entryId, isovalues } = cell.obj.data;
        this.setState({ isBusy: true, loadingLabel: cell.obj.label });
        try {
            const plugin = this.plugin;
            await plugin.dataTransaction(async () => {
                var _a, _b, _c, _d;
                const data = await plugin.builders.data.download({ url, isBinary }, { state: { isGhost: true } });
                const parsed = await plugin.dataFormats.get(format).parse(plugin, data, { entryId });
                const firstVolume = (parsed.volume || parsed.volumes[0]);
                if (!(firstVolume === null || firstVolume === void 0 ? void 0 : firstVolume.isOk))
                    throw new Error('Failed to parse any volume.');
                const repr = plugin.build();
                for (const iso of isovalues) {
                    repr
                        .to((_c = (_a = parsed.volumes) === null || _a === void 0 ? void 0 : _a[(_b = iso.volumeIndex) !== null && _b !== void 0 ? _b : 0]) !== null && _c !== void 0 ? _c : parsed.volume)
                        .apply(transforms_1.StateTransforms.Representation.VolumeRepresentation3D, (0, volume_representation_params_1.createVolumeRepresentationParams)(this.plugin, firstVolume.data, {
                        type: 'isosurface',
                        typeParams: { alpha: (_d = iso.alpha) !== null && _d !== void 0 ? _d : 1, isoValue: iso.type === 'absolute' ? { kind: 'absolute', absoluteValue: iso.value } : { kind: 'relative', relativeValue: iso.value } },
                        color: 'uniform',
                        colorParams: { value: iso.color }
                    }));
                }
                await repr.commit();
                await plugin.build().delete(cell).commit();
            });
        }
        finally {
            this.setState({ isBusy: false, loadingLabel: void 0 });
        }
    }
    renderControls() {
        const disabled = this.state.isBusy || this.isEmpty;
        const label = this.label;
        const selected = this.plugin.managers.volume.hierarchy.selection;
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: 'msp-flex-row', style: { marginTop: '1px' }, children: [(0, jsx_runtime_1.jsx)(common_1.Button, { noOverflow: true, flex: true, onClick: this.toggleHierarchy, disabled: disabled, title: label, children: label }), !this.isEmpty && selected && (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.AddSvg, onClick: this.toggleAddRepr, title: 'Apply a structure presets to the current hierarchy.', toggleState: this.state.show === 'add-repr', disabled: disabled })] }), this.state.show === 'hierarchy' && (0, jsx_runtime_1.jsx)(action_menu_1.ActionMenu, { items: this.hierarchyItems, onSelect: this.selectCurrent }), this.state.show === 'add-repr' && (0, jsx_runtime_1.jsx)(action_menu_1.ActionMenu, { items: this.addActions, onSelect: this.selectAdd }), selected && selected.representations.length > 0 && (0, jsx_runtime_1.jsx)("div", { style: { marginTop: '6px' }, children: selected.representations.map(r => (0, jsx_runtime_1.jsx)(VolumeRepresentationControls, { representation: r }, r.cell.transform.ref)) })] });
    }
}
exports.VolumeSourceControls = VolumeSourceControls;
class VolumeRepresentationControls extends base_1.PurePluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = { action: void 0 };
        this.remove = () => this.plugin.managers.volume.hierarchy.remove([this.props.representation], true);
        this.toggleVisible = (e) => {
            e.preventDefault();
            e.currentTarget.blur();
            this.plugin.managers.volume.hierarchy.toggleVisibility([this.props.representation]);
        };
        this.toggleColor = () => {
            this.setState({ action: this.state.action === 'select-color' ? undefined : 'select-color' });
        };
        this.toggleUpdate = () => this.setState({ action: this.state.action === 'update' ? void 0 : 'update' });
        this.highlight = (e) => {
            e.preventDefault();
            if (!this.props.representation.cell.parent)
                return;
            commands_1.PluginCommands.Interactivity.Object.Highlight(this.plugin, { state: this.props.representation.cell.parent, ref: this.props.representation.cell.transform.ref });
        };
        this.clearHighlight = (e) => {
            e.preventDefault();
            commands_1.PluginCommands.Interactivity.ClearHighlights(this.plugin);
        };
        this.focus = () => {
            var _a;
            const repr = this.props.representation;
            const lociList = (_a = repr.cell.obj) === null || _a === void 0 ? void 0 : _a.data.repr.getAllLoci();
            if (repr.cell.state.isHidden)
                this.plugin.managers.volume.hierarchy.toggleVisibility([this.props.representation], 'show');
            if (lociList)
                this.plugin.managers.camera.focusLoci(lociList, { extraRadius: 1 });
        };
        this.updateColor = ({ value }) => {
            const t = this.props.representation.cell.transform;
            return this.plugin.build().to(t.ref).update({
                ...t.params,
                colorTheme: {
                    name: 'uniform',
                    params: { value }
                },
            }).commit();
        };
    }
    componentDidMount() {
        this.subscribe(this.plugin.state.events.cell.stateUpdated, e => {
            if (mol_state_1.State.ObjectEvent.isCell(e, this.props.representation.cell))
                this.forceUpdate();
        });
    }
    get color() {
        var _a, _b;
        const repr = this.props.representation.cell;
        const isUniform = ((_a = repr.transform.params) === null || _a === void 0 ? void 0 : _a.colorTheme.name) === 'uniform';
        if (!isUniform)
            return void 0;
        return (_b = repr.transform.params) === null || _b === void 0 ? void 0 : _b.colorTheme.params.value;
    }
    render() {
        var _a, _b, _c;
        const repr = this.props.representation.cell;
        const color = this.color;
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: 'msp-flex-row', children: [color !== void 0 && (0, jsx_runtime_1.jsx)(common_1.Button, { style: { backgroundColor: color_1.Color.toStyle(color), minWidth: 32, width: 32 }, onClick: this.toggleColor }), (0, jsx_runtime_1.jsxs)(common_1.Button, { noOverflow: true, className: 'msp-control-button-label', title: `${(_a = repr.obj) === null || _a === void 0 ? void 0 : _a.label}. Click to focus.`, onClick: this.focus, onMouseEnter: this.highlight, onMouseLeave: this.clearHighlight, style: { textAlign: 'left' }, children: [(_b = repr.obj) === null || _b === void 0 ? void 0 : _b.label, (0, jsx_runtime_1.jsx)("small", { className: 'msp-25-lower-contrast-text', style: { float: 'right' }, children: (_c = repr.obj) === null || _c === void 0 ? void 0 : _c.description })] }), (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: repr.state.isHidden ? icons_1.VisibilityOffOutlinedSvg : icons_1.VisibilityOutlinedSvg, toggleState: false, onClick: this.toggleVisible, title: `${repr.state.isHidden ? 'Show' : 'Hide'} component`, small: true, className: 'msp-form-control', flex: true }), (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.DeleteOutlinedSvg, onClick: this.remove, title: 'Remove', small: true }), (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.MoreHorizSvg, onClick: this.toggleUpdate, title: 'Actions', toggleState: this.state.action === 'update' })] }), this.state.action === 'update' && !!repr.parent && (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '6px' }, className: 'msp-accent-offset', children: (0, jsx_runtime_1.jsx)(update_transform_1.UpdateTransformControl, { state: repr.parent, transform: repr.transform, customHeader: 'none', noMargin: true }) }), this.state.action === 'select-color' && color !== void 0 && (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '6px', marginTop: 1 }, className: 'msp-accent-offset', children: (0, jsx_runtime_1.jsx)(common_1.ControlGroup, { header: 'Select Color', initialExpanded: true, hideExpander: true, hideOffset: true, onHeaderClick: this.toggleColor, topRightIcon: icons_1.CloseSvg, noTopMargin: true, childrenClassName: 'msp-viewport-controls-panel-controls', children: (0, jsx_runtime_1.jsx)(color_2.CombinedColorControl, { param: VolumeColorParam, value: this.color, onChange: this.updateColor, name: 'color', hideNameRow: true }) }) })] });
    }
}
const VolumeColorParam = param_definition_1.ParamDefinition.Color((0, color_1.Color)(0x121212));
