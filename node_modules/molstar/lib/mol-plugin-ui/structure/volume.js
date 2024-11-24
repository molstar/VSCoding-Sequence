import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { StructureHierarchyManager } from '../../mol-plugin-state/manager/structure/hierarchy';
import { VolumeHierarchyManager } from '../../mol-plugin-state/manager/volume/hierarchy';
import { FocusLoci } from '../../mol-plugin/behavior/dynamic/representation';
import { VolumeStreaming } from '../../mol-plugin/behavior/dynamic/volume-streaming/behavior';
import { InitVolumeStreaming } from '../../mol-plugin/behavior/dynamic/volume-streaming/transformers';
import { State, StateSelection, StateTransform } from '../../mol-state';
import { CollapsableControls, PurePluginUIComponent } from '../base';
import { ActionMenu } from '../controls/action-menu';
import { Button, ControlGroup, ExpandGroup, IconButton } from '../controls/common';
import { ApplyActionControl } from '../state/apply-action';
import { UpdateTransformControl } from '../state/update-transform';
import { BindingsHelp } from '../viewport/help';
import { PluginCommands } from '../../mol-plugin/commands';
import { BlurOnSvg, ErrorSvg, CheckSvg, AddSvg, VisibilityOffOutlinedSvg, VisibilityOutlinedSvg, DeleteOutlinedSvg, MoreHorizSvg, CloseSvg } from '../controls/icons';
import { StateTransforms } from '../../mol-plugin-state/transforms';
import { createVolumeRepresentationParams } from '../../mol-plugin-state/helpers/volume-representation-params';
import { Color } from '../../mol-util/color';
import { ParamDefinition } from '../../mol-util/param-definition';
import { CombinedColorControl } from '../controls/color';
export class VolumeStreamingControls extends CollapsableControls {
    defaultState() {
        return {
            header: 'Volume Streaming',
            isCollapsed: false,
            isBusy: false,
            isHidden: true,
            brand: { accent: 'cyan', svg: BlurOnSvg }
        };
    }
    componentDidMount() {
        // TODO: do not hide this but instead show some help text??
        this.subscribe(this.plugin.managers.structure.hierarchy.behaviors.selection, () => {
            this.setState({
                isHidden: !this.canEnable(),
                description: StructureHierarchyManager.getSelectedStructuresDescription(this.plugin)
            });
        });
        this.subscribe(this.plugin.state.events.cell.stateUpdated, e => {
            if (StateTransform.hasTag(e.cell.transform, VolumeStreaming.RootTag))
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
        return !!((_b = (_a = InitVolumeStreaming.definition).isApplicable) === null || _b === void 0 ? void 0 : _b.call(_a, pivot.obj, pivot.transform, this.plugin));
    }
    renderEnable() {
        var _a, _b;
        const pivot = this.pivot;
        if (!pivot.cell.parent)
            return null;
        const root = StateSelection.findTagInSubtree(pivot.cell.parent.tree, this.pivot.cell.transform.ref, VolumeStreaming.RootTag);
        const rootCell = root && pivot.cell.parent.cells.get(root);
        const simpleApply = rootCell && rootCell.status === 'error'
            ? { header: !!rootCell.errorText && ((_a = rootCell.errorText) === null || _a === void 0 ? void 0 : _a.includes('404')) ? 'No Density Data Available' : 'Error Enabling', icon: ErrorSvg, title: rootCell.errorText }
            : rootCell && ((_b = rootCell.obj) === null || _b === void 0 ? void 0 : _b.data.entries.length) === 0
                ? { header: 'Error Enabling', icon: ErrorSvg, title: 'No Entry for Streaming Found' }
                : { header: 'Enable', icon: CheckSvg, title: 'Enable' };
        return _jsx(ApplyActionControl, { state: pivot.cell.parent, action: InitVolumeStreaming, initiallyCollapsed: true, nodeRef: pivot.cell.transform.ref, simpleApply: simpleApply });
    }
    renderParams() {
        var _a, _b, _c, _d, _e;
        const pivot = this.pivot;
        if (!pivot.cell.parent)
            return null;
        const bindings = ((_b = (_a = pivot.volumeStreaming) === null || _a === void 0 ? void 0 : _a.cell.transform.params) === null || _b === void 0 ? void 0 : _b.entry.params.view.name) === 'selection-box' && ((_e = (_d = (_c = this.plugin.state.behaviors.cells.get(FocusLoci.id)) === null || _c === void 0 ? void 0 : _c.params) === null || _d === void 0 ? void 0 : _d.values) === null || _e === void 0 ? void 0 : _e.bindings);
        return _jsxs(_Fragment, { children: [_jsx(UpdateTransformControl, { state: pivot.cell.parent, transform: pivot.volumeStreaming.cell.transform, customHeader: 'none', noMargin: true }), bindings && _jsx(ExpandGroup, { header: 'Controls Help', children: _jsx(BindingsHelp, { bindings: bindings }) })] });
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
export class VolumeSourceControls extends CollapsableControls {
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
            brand: { accent: 'purple', svg: BlurOnSvg }
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
            ...VolumeHierarchyManager.getRepresentationTypes(this.plugin, current)
                .map(t => ActionMenu.Item(t[1], () => mng.addRepresentation(current, t[0])))
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
                        .apply(StateTransforms.Representation.VolumeRepresentation3D, createVolumeRepresentationParams(this.plugin, firstVolume.data, {
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
        return _jsxs(_Fragment, { children: [_jsxs("div", { className: 'msp-flex-row', style: { marginTop: '1px' }, children: [_jsx(Button, { noOverflow: true, flex: true, onClick: this.toggleHierarchy, disabled: disabled, title: label, children: label }), !this.isEmpty && selected && _jsx(IconButton, { svg: AddSvg, onClick: this.toggleAddRepr, title: 'Apply a structure presets to the current hierarchy.', toggleState: this.state.show === 'add-repr', disabled: disabled })] }), this.state.show === 'hierarchy' && _jsx(ActionMenu, { items: this.hierarchyItems, onSelect: this.selectCurrent }), this.state.show === 'add-repr' && _jsx(ActionMenu, { items: this.addActions, onSelect: this.selectAdd }), selected && selected.representations.length > 0 && _jsx("div", { style: { marginTop: '6px' }, children: selected.representations.map(r => _jsx(VolumeRepresentationControls, { representation: r }, r.cell.transform.ref)) })] });
    }
}
class VolumeRepresentationControls extends PurePluginUIComponent {
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
            PluginCommands.Interactivity.Object.Highlight(this.plugin, { state: this.props.representation.cell.parent, ref: this.props.representation.cell.transform.ref });
        };
        this.clearHighlight = (e) => {
            e.preventDefault();
            PluginCommands.Interactivity.ClearHighlights(this.plugin);
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
            if (State.ObjectEvent.isCell(e, this.props.representation.cell))
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
        return _jsxs(_Fragment, { children: [_jsxs("div", { className: 'msp-flex-row', children: [color !== void 0 && _jsx(Button, { style: { backgroundColor: Color.toStyle(color), minWidth: 32, width: 32 }, onClick: this.toggleColor }), _jsxs(Button, { noOverflow: true, className: 'msp-control-button-label', title: `${(_a = repr.obj) === null || _a === void 0 ? void 0 : _a.label}. Click to focus.`, onClick: this.focus, onMouseEnter: this.highlight, onMouseLeave: this.clearHighlight, style: { textAlign: 'left' }, children: [(_b = repr.obj) === null || _b === void 0 ? void 0 : _b.label, _jsx("small", { className: 'msp-25-lower-contrast-text', style: { float: 'right' }, children: (_c = repr.obj) === null || _c === void 0 ? void 0 : _c.description })] }), _jsx(IconButton, { svg: repr.state.isHidden ? VisibilityOffOutlinedSvg : VisibilityOutlinedSvg, toggleState: false, onClick: this.toggleVisible, title: `${repr.state.isHidden ? 'Show' : 'Hide'} component`, small: true, className: 'msp-form-control', flex: true }), _jsx(IconButton, { svg: DeleteOutlinedSvg, onClick: this.remove, title: 'Remove', small: true }), _jsx(IconButton, { svg: MoreHorizSvg, onClick: this.toggleUpdate, title: 'Actions', toggleState: this.state.action === 'update' })] }), this.state.action === 'update' && !!repr.parent && _jsx("div", { style: { marginBottom: '6px' }, className: 'msp-accent-offset', children: _jsx(UpdateTransformControl, { state: repr.parent, transform: repr.transform, customHeader: 'none', noMargin: true }) }), this.state.action === 'select-color' && color !== void 0 && _jsx("div", { style: { marginBottom: '6px', marginTop: 1 }, className: 'msp-accent-offset', children: _jsx(ControlGroup, { header: 'Select Color', initialExpanded: true, hideExpander: true, hideOffset: true, onHeaderClick: this.toggleColor, topRightIcon: CloseSvg, noTopMargin: true, childrenClassName: 'msp-viewport-controls-panel-controls', children: _jsx(CombinedColorControl, { param: VolumeColorParam, value: this.color, onChange: this.updateColor, name: 'color', hideNameRow: true }) }) })] });
    }
}
const VolumeColorParam = ParamDefinition.Color(Color(0x121212));
