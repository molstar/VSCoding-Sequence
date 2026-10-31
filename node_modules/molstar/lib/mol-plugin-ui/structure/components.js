import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { getStructureThemeTypes } from '../../mol-plugin-state/helpers/structure-representation-params';
import { StructureComponentManager } from '../../mol-plugin-state/manager/structure/component';
import { StructureHierarchyManager } from '../../mol-plugin-state/manager/structure/hierarchy';
import { PluginCommands } from '../../mol-plugin/commands';
import { State } from '../../mol-state';
import { ParamDefinition } from '../../mol-util/param-definition';
import { CollapsableControls, PurePluginUIComponent } from '../base';
import { ActionMenu } from '../controls/action-menu';
import { Button, ExpandGroup, IconButton, ToggleButton, ControlRow, TextInput } from '../controls/common';
import { CubeOutlineSvg, IntersectSvg, SetSvg, SubtractSvg, UnionSvg, BookmarksOutlinedSvg, AddSvg, TuneSvg, RestoreSvg, VisibilityOffOutlinedSvg, VisibilityOutlinedSvg, DeleteOutlinedSvg, MoreHorizSvg, CheckSvg } from '../controls/icons';
import { ParameterControls } from '../controls/parameters';
import { UpdateTransformControl } from '../state/update-transform';
import { GenericEntryListControls } from './generic';
export class StructureComponentControls extends CollapsableControls {
    defaultState() {
        return {
            header: 'Components',
            isCollapsed: false,
            isDisabled: false,
            brand: { accent: 'blue', svg: CubeOutlineSvg }
        };
    }
    componentDidMount() {
        this.subscribe(this.plugin.managers.structure.hierarchy.behaviors.selection, c => this.setState({
            description: StructureHierarchyManager.getSelectedStructuresDescription(this.plugin)
        }));
    }
    renderControls() {
        return _jsxs(_Fragment, { children: [_jsx(ComponentEditorControls, {}), _jsx(ComponentListControls, {}), _jsx(GenericEntryListControls, {})] });
    }
}
class ComponentEditorControls extends PurePluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = {
            isEmpty: true,
            isBusy: false,
            canUndo: false
        };
        this.togglePreset = this.toggleAction('preset');
        this.toggleAdd = this.toggleAction('add');
        this.toggleOptions = this.toggleAction('options');
        this.hideAction = () => this.setState({ action: void 0 });
        this.applyPreset = item => {
            this.hideAction();
            if (!item)
                return;
            const mng = this.plugin.managers.structure;
            const { structures } = mng.hierarchy.selection;
            if (item.value === null)
                mng.component.clear(structures);
            else
                mng.component.applyPreset(structures, item.value);
        };
        this.undo = () => {
            const task = this.plugin.state.data.undo();
            if (task)
                this.plugin.runTask(task);
        };
    }
    get isDisabled() {
        return this.state.isBusy || this.state.isEmpty;
    }
    componentDidMount() {
        this.subscribe(this.plugin.managers.structure.hierarchy.behaviors.selection, c => this.setState({
            action: this.state.action !== 'options' || c.structures.length === 0 ? void 0 : 'options',
            isEmpty: c.structures.length === 0
        }));
        this.subscribe(this.plugin.behaviors.state.isBusy, v => {
            this.setState({ isBusy: v, action: this.state.action !== 'options' ? void 0 : 'options' });
        });
        this.subscribe(this.plugin.state.data.events.historyUpdated, ({ state }) => {
            this.setState({ canUndo: state.canUndo });
        });
    }
    toggleAction(action) {
        return () => this.setState({ action: this.state.action === action ? void 0 : action });
    }
    get presetControls() {
        return _jsx(ActionMenu, { items: this.presetActions, onSelect: this.applyPreset });
    }
    get presetActions() {
        const pivot = this.plugin.managers.structure.component.pivotStructure;
        const providers = this.plugin.builders.structure.representation.getPresets(pivot === null || pivot === void 0 ? void 0 : pivot.cell.obj);
        return ActionMenu.createItems(providers, { label: p => p.display.name, category: p => p.display.group, description: p => p.display.description });
    }
    render() {
        const undoTitle = this.state.canUndo
            ? `Undo ${this.plugin.state.data.latestUndoLabel}`
            : 'Some mistakes of the past can be undone.';
        return _jsxs(_Fragment, { children: [_jsxs("div", { className: 'msp-flex-row', children: [_jsx(ToggleButton, { icon: BookmarksOutlinedSvg, label: 'Preset', title: 'Apply a representation preset for the current structure(s).', toggle: this.togglePreset, isSelected: this.state.action === 'preset', disabled: this.isDisabled }), _jsx(ToggleButton, { icon: AddSvg, label: 'Add', title: 'Add a new representation component for a selection.', toggle: this.toggleAdd, isSelected: this.state.action === 'add', disabled: this.isDisabled }), _jsx(ToggleButton, { icon: TuneSvg, label: '', title: 'Options that are applied to all applicable representations.', style: { flex: '0 0 40px', padding: 0 }, toggle: this.toggleOptions, isSelected: this.state.action === 'options', disabled: this.isDisabled }), _jsx(IconButton, { svg: RestoreSvg, className: 'msp-flex-item', flex: '40px', onClick: this.undo, disabled: !this.state.canUndo || this.isDisabled, title: undoTitle })] }), this.state.action === 'preset' && this.presetControls, this.state.action === 'add' && _jsx("div", { className: 'msp-control-offset', children: _jsx(AddComponentControls, { onApply: this.hideAction }) }), this.state.action === 'options' && _jsx("div", { className: 'msp-control-offset', children: _jsx(ComponentOptionsControls, { isDisabled: this.isDisabled }) })] });
    }
}
export class AddComponentControls extends PurePluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = this.createState();
        this.apply = () => {
            const structures = this.props.forSelection ? this.currentStructures : this.selectedStructures;
            this.props.onApply();
            this.plugin.managers.structure.component.add(this.state.values, structures);
        };
        this.paramsChanged = (values) => this.setState({ values });
    }
    createState() {
        const params = StructureComponentManager.getAddParams(this.plugin);
        return { params, values: ParamDefinition.getDefaultValues(params) };
    }
    get selectedStructures() {
        return this.plugin.managers.structure.component.currentStructures;
    }
    get currentStructures() {
        return this.plugin.managers.structure.hierarchy.current.structures;
    }
    render() {
        return _jsxs(_Fragment, { children: [_jsx(ParameterControls, { params: this.state.params, values: this.state.values, onChangeValues: this.paramsChanged }), _jsx(Button, { icon: AddSvg, title: 'Use Selection and optional Representation to create a new Component.', className: 'msp-btn-commit msp-btn-commit-on', onClick: this.apply, style: { marginTop: '1px' }, children: "Create Component" })] });
    }
}
class ComponentOptionsControls extends PurePluginUIComponent {
    constructor() {
        super(...arguments);
        this.update = (options) => this.plugin.managers.structure.component.setOptions(options);
    }
    componentDidMount() {
        this.subscribe(this.plugin.managers.structure.component.events.optionsUpdated, () => this.forceUpdate());
    }
    render() {
        return _jsx(ParameterControls, { params: StructureComponentManager.OptionsParams, values: this.plugin.managers.structure.component.state.options, onChangeValues: this.update, isDisabled: this.props.isDisabled });
    }
}
class ComponentListControls extends PurePluginUIComponent {
    componentDidMount() {
        this.subscribe(this.plugin.managers.structure.hierarchy.behaviors.selection, () => {
            this.forceUpdate();
        });
    }
    render() {
        const componentGroups = this.plugin.managers.structure.hierarchy.currentComponentGroups;
        if (componentGroups.length === 0)
            return null;
        return _jsx("div", { style: { marginTop: '6px' }, children: componentGroups.map(g => _jsx(StructureComponentGroup, { group: g }, g[0].cell.transform.ref)) });
    }
}
class StructureComponentGroup extends PurePluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = { action: void 0 };
        this.toggleVisible = (e) => {
            e.preventDefault();
            e.currentTarget.blur();
            this.plugin.managers.structure.component.toggleVisibility(this.props.group);
        };
        this.selectAction = item => {
            if (!item)
                return;
            (item === null || item === void 0 ? void 0 : item.value)();
        };
        this.remove = () => this.plugin.managers.structure.hierarchy.remove(this.props.group, true);
        this.toggleAction = () => this.setState({ action: this.state.action === 'action' ? void 0 : 'action' });
        this.toggleLabel = () => this.setState({ action: this.state.action === 'label' ? void 0 : 'label' });
        this.highlight = (e) => {
            e.preventDefault();
            if (!this.props.group[0].cell.parent)
                return;
            PluginCommands.Interactivity.Object.Highlight(this.plugin, { state: this.props.group[0].cell.parent, ref: this.props.group.map(c => c.cell.transform.ref) });
        };
        this.clearHighlight = (e) => {
            e.preventDefault();
            PluginCommands.Interactivity.ClearHighlights(this.plugin);
        };
        this.focus = () => {
            let allHidden = true;
            for (const c of this.props.group) {
                if (!c.cell.state.isHidden) {
                    allHidden = false;
                    break;
                }
            }
            if (allHidden) {
                this.plugin.managers.structure.hierarchy.toggleVisibility(this.props.group, 'show');
            }
            this.plugin.managers.camera.focusSpheres(this.props.group, e => {
                var _a;
                if (e.cell.state.isHidden)
                    return;
                return (_a = e.cell.obj) === null || _a === void 0 ? void 0 : _a.data.boundary.sphere;
            });
        };
        this.updateLabel = (v) => {
            this.plugin.managers.structure.component.updateLabel(this.pivot, v);
        };
    }
    get pivot() {
        return this.props.group[0];
    }
    componentDidMount() {
        this.subscribe(this.plugin.state.events.cell.stateUpdated, e => {
            if (State.ObjectEvent.isCell(e, this.pivot.cell))
                this.forceUpdate();
        });
    }
    get colorByActions() {
        var _a, _b;
        const mng = this.plugin.managers.structure.component;
        const repr = this.pivot.representations[0];
        const name = (_a = repr.cell.transform.params) === null || _a === void 0 ? void 0 : _a.colorTheme.name;
        const themes = getStructureThemeTypes(this.plugin, (_b = this.pivot.cell.obj) === null || _b === void 0 ? void 0 : _b.data);
        return ActionMenu.createItemsFromSelectOptions(themes, {
            value: o => () => mng.updateRepresentationsTheme(this.props.group, { color: o[0] }),
            selected: o => o[0] === name
        });
    }
    get actions() {
        const mng = this.plugin.managers.structure.component;
        const ret = [
            [
                ActionMenu.Header('Add Representation'),
                ...StructureComponentManager.getRepresentationTypes(this.plugin, this.props.group[0])
                    .map(t => ActionMenu.Item(t[1], () => mng.addRepresentation(this.props.group, t[0])))
            ]
        ];
        if (this.pivot.representations.length > 0) {
            ret.push([
                ActionMenu.Header('Set Coloring', { isIndependent: true }),
                ...this.colorByActions
            ]);
        }
        if (mng.canBeModified(this.props.group[0])) {
            ret.push([
                ActionMenu.Header('Modify by Selection'),
                ActionMenu.Item('Include', () => mng.modifyByCurrentSelection(this.props.group, 'union'), { icon: UnionSvg }),
                ActionMenu.Item('Subtract', () => mng.modifyByCurrentSelection(this.props.group, 'subtract'), { icon: SubtractSvg }),
                ActionMenu.Item('Intersect', () => mng.modifyByCurrentSelection(this.props.group, 'intersect'), { icon: IntersectSvg })
            ]);
        }
        ret.push(ActionMenu.Item('Select This', () => mng.selectThis(this.props.group), { icon: SetSvg }));
        if (mng.canBeModified(this.props.group[0])) {
            ret.push(ActionMenu.Item('Edit Label', this.toggleLabel));
        }
        return ret;
    }
    get reprLabel() {
        var _a;
        // TODO: handle generic reprs.
        const pivot = this.pivot;
        if (pivot.representations.length === 0)
            return 'No repr.';
        if (pivot.representations.length === 1)
            return (_a = pivot.representations[0].cell.obj) === null || _a === void 0 ? void 0 : _a.label;
        return `${pivot.representations.length} reprs`;
    }
    render() {
        var _a;
        const component = this.pivot;
        const cell = component.cell;
        const label = (_a = cell.obj) === null || _a === void 0 ? void 0 : _a.label;
        const reprLabel = this.reprLabel;
        return _jsxs(_Fragment, { children: [_jsxs("div", { className: 'msp-flex-row', children: [_jsxs(Button, { noOverflow: true, className: 'msp-control-button-label', title: `${label}. Click to focus.`, onClick: this.focus, onMouseEnter: this.highlight, onMouseLeave: this.clearHighlight, style: { textAlign: 'left' }, children: [label, _jsx("small", { className: 'msp-25-lower-contrast-text', style: { float: 'right' }, children: reprLabel })] }), _jsx(IconButton, { svg: cell.state.isHidden ? VisibilityOffOutlinedSvg : VisibilityOutlinedSvg, toggleState: false, onClick: this.toggleVisible, title: `${cell.state.isHidden ? 'Show' : 'Hide'} component`, small: true, className: 'msp-form-control', flex: true }), _jsx(IconButton, { svg: DeleteOutlinedSvg, toggleState: false, onClick: this.remove, title: 'Remove', small: true, className: 'msp-form-control', flex: true }), _jsx(IconButton, { svg: MoreHorizSvg, onClick: this.toggleAction, title: 'Actions', toggleState: this.state.action === 'action', className: 'msp-form-control', flex: true })] }), this.state.action === 'label' && _jsx("div", { className: 'msp-control-offset', style: { marginBottom: '6px' }, children: _jsx(ControlRow, { label: 'Label', control: _jsxs("div", { style: { display: 'flex', textAlignLast: 'center' }, children: [_jsx(TextInput, { onChange: this.updateLabel, value: label, style: { flex: '1 1 auto', minWidth: 0 }, className: 'msp-form-control', blurOnEnter: true, blurOnEscape: true }), _jsx(IconButton, { svg: CheckSvg, onClick: this.toggleLabel, className: 'msp-form-control msp-control-button-label', flex: true })] }) }) }), this.state.action === 'action' && _jsxs("div", { className: 'msp-accent-offset', children: [_jsx("div", { style: { marginBottom: '6px' }, children: _jsx(ActionMenu, { items: this.actions, onSelect: this.selectAction, noOffset: true }) }), _jsx("div", { style: { marginBottom: '6px' }, children: component.representations.map(r => _jsx(StructureRepresentationEntry, { group: this.props.group, representation: r }, r.cell.transform.ref)) })] })] });
    }
}
class StructureRepresentationEntry extends PurePluginUIComponent {
    constructor() {
        super(...arguments);
        this.remove = () => this.plugin.managers.structure.component.removeRepresentations(this.props.group, this.props.representation);
        this.toggleVisible = (e) => {
            e.preventDefault();
            e.currentTarget.blur();
            this.plugin.managers.structure.component.toggleVisibility(this.props.group, this.props.representation);
        };
        this.update = (params) => this.plugin.managers.structure.component.updateRepresentations(this.props.group, this.props.representation, params);
    }
    componentDidMount() {
        this.subscribe(this.plugin.state.events.cell.stateUpdated, e => {
            if (State.ObjectEvent.isCell(e, this.props.representation.cell))
                this.forceUpdate();
        });
    }
    render() {
        var _a;
        const repr = this.props.representation.cell;
        return _jsxs("div", { className: 'msp-representation-entry', children: [repr.parent && _jsx(ExpandGroup, { header: `${((_a = repr.obj) === null || _a === void 0 ? void 0 : _a.label) || ''} Representation`, noOffset: true, children: _jsx(UpdateTransformControl, { state: repr.parent, transform: repr.transform, customHeader: 'none', customUpdate: this.update, noMargin: true }) }), _jsx(IconButton, { svg: DeleteOutlinedSvg, onClick: this.remove, title: 'Remove', small: true, className: 'msp-default-bg', toggleState: false, style: {
                        position: 'absolute', top: 0, right: '32px', lineHeight: '24px', height: '24px', textAlign: 'right', width: '44px', paddingRight: '6px', background: 'none'
                    } }), _jsx(IconButton, { svg: this.props.representation.cell.state.isHidden ? VisibilityOffOutlinedSvg : VisibilityOutlinedSvg, toggleState: false, onClick: this.toggleVisible, title: 'Toggle Visibility', small: true, className: 'msp-default-bg', style: {
                        position: 'absolute', top: 0, right: 0, lineHeight: '24px', height: '24px', textAlign: 'right', width: '32px', paddingRight: '6px', background: 'none'
                    } })] });
    }
}
