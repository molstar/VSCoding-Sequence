"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddComponentControls = exports.StructureComponentControls = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const structure_representation_params_1 = require("../../mol-plugin-state/helpers/structure-representation-params");
const component_1 = require("../../mol-plugin-state/manager/structure/component");
const hierarchy_1 = require("../../mol-plugin-state/manager/structure/hierarchy");
const commands_1 = require("../../mol-plugin/commands");
const mol_state_1 = require("../../mol-state");
const param_definition_1 = require("../../mol-util/param-definition");
const base_1 = require("../base");
const action_menu_1 = require("../controls/action-menu");
const common_1 = require("../controls/common");
const icons_1 = require("../controls/icons");
const parameters_1 = require("../controls/parameters");
const update_transform_1 = require("../state/update-transform");
const generic_1 = require("./generic");
class StructureComponentControls extends base_1.CollapsableControls {
    defaultState() {
        return {
            header: 'Components',
            isCollapsed: false,
            isDisabled: false,
            brand: { accent: 'blue', svg: icons_1.CubeOutlineSvg }
        };
    }
    componentDidMount() {
        this.subscribe(this.plugin.managers.structure.hierarchy.behaviors.selection, c => this.setState({
            description: hierarchy_1.StructureHierarchyManager.getSelectedStructuresDescription(this.plugin)
        }));
    }
    renderControls() {
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(ComponentEditorControls, {}), (0, jsx_runtime_1.jsx)(ComponentListControls, {}), (0, jsx_runtime_1.jsx)(generic_1.GenericEntryListControls, {})] });
    }
}
exports.StructureComponentControls = StructureComponentControls;
class ComponentEditorControls extends base_1.PurePluginUIComponent {
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
        return (0, jsx_runtime_1.jsx)(action_menu_1.ActionMenu, { items: this.presetActions, onSelect: this.applyPreset });
    }
    get presetActions() {
        const pivot = this.plugin.managers.structure.component.pivotStructure;
        const providers = this.plugin.builders.structure.representation.getPresets(pivot === null || pivot === void 0 ? void 0 : pivot.cell.obj);
        return action_menu_1.ActionMenu.createItems(providers, { label: p => p.display.name, category: p => p.display.group, description: p => p.display.description });
    }
    render() {
        const undoTitle = this.state.canUndo
            ? `Undo ${this.plugin.state.data.latestUndoLabel}`
            : 'Some mistakes of the past can be undone.';
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: 'msp-flex-row', children: [(0, jsx_runtime_1.jsx)(common_1.ToggleButton, { icon: icons_1.BookmarksOutlinedSvg, label: 'Preset', title: 'Apply a representation preset for the current structure(s).', toggle: this.togglePreset, isSelected: this.state.action === 'preset', disabled: this.isDisabled }), (0, jsx_runtime_1.jsx)(common_1.ToggleButton, { icon: icons_1.AddSvg, label: 'Add', title: 'Add a new representation component for a selection.', toggle: this.toggleAdd, isSelected: this.state.action === 'add', disabled: this.isDisabled }), (0, jsx_runtime_1.jsx)(common_1.ToggleButton, { icon: icons_1.TuneSvg, label: '', title: 'Options that are applied to all applicable representations.', style: { flex: '0 0 40px', padding: 0 }, toggle: this.toggleOptions, isSelected: this.state.action === 'options', disabled: this.isDisabled }), (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.RestoreSvg, className: 'msp-flex-item', flex: '40px', onClick: this.undo, disabled: !this.state.canUndo || this.isDisabled, title: undoTitle })] }), this.state.action === 'preset' && this.presetControls, this.state.action === 'add' && (0, jsx_runtime_1.jsx)("div", { className: 'msp-control-offset', children: (0, jsx_runtime_1.jsx)(AddComponentControls, { onApply: this.hideAction }) }), this.state.action === 'options' && (0, jsx_runtime_1.jsx)("div", { className: 'msp-control-offset', children: (0, jsx_runtime_1.jsx)(ComponentOptionsControls, { isDisabled: this.isDisabled }) })] });
    }
}
class AddComponentControls extends base_1.PurePluginUIComponent {
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
        const params = component_1.StructureComponentManager.getAddParams(this.plugin);
        return { params, values: param_definition_1.ParamDefinition.getDefaultValues(params) };
    }
    get selectedStructures() {
        return this.plugin.managers.structure.component.currentStructures;
    }
    get currentStructures() {
        return this.plugin.managers.structure.hierarchy.current.structures;
    }
    render() {
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: this.state.params, values: this.state.values, onChangeValues: this.paramsChanged }), (0, jsx_runtime_1.jsx)(common_1.Button, { icon: icons_1.AddSvg, title: 'Use Selection and optional Representation to create a new Component.', className: 'msp-btn-commit msp-btn-commit-on', onClick: this.apply, style: { marginTop: '1px' }, children: "Create Component" })] });
    }
}
exports.AddComponentControls = AddComponentControls;
class ComponentOptionsControls extends base_1.PurePluginUIComponent {
    constructor() {
        super(...arguments);
        this.update = (options) => this.plugin.managers.structure.component.setOptions(options);
    }
    componentDidMount() {
        this.subscribe(this.plugin.managers.structure.component.events.optionsUpdated, () => this.forceUpdate());
    }
    render() {
        return (0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: component_1.StructureComponentManager.OptionsParams, values: this.plugin.managers.structure.component.state.options, onChangeValues: this.update, isDisabled: this.props.isDisabled });
    }
}
class ComponentListControls extends base_1.PurePluginUIComponent {
    componentDidMount() {
        this.subscribe(this.plugin.managers.structure.hierarchy.behaviors.selection, () => {
            this.forceUpdate();
        });
    }
    render() {
        const componentGroups = this.plugin.managers.structure.hierarchy.currentComponentGroups;
        if (componentGroups.length === 0)
            return null;
        return (0, jsx_runtime_1.jsx)("div", { style: { marginTop: '6px' }, children: componentGroups.map(g => (0, jsx_runtime_1.jsx)(StructureComponentGroup, { group: g }, g[0].cell.transform.ref)) });
    }
}
class StructureComponentGroup extends base_1.PurePluginUIComponent {
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
            commands_1.PluginCommands.Interactivity.Object.Highlight(this.plugin, { state: this.props.group[0].cell.parent, ref: this.props.group.map(c => c.cell.transform.ref) });
        };
        this.clearHighlight = (e) => {
            e.preventDefault();
            commands_1.PluginCommands.Interactivity.ClearHighlights(this.plugin);
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
            if (mol_state_1.State.ObjectEvent.isCell(e, this.pivot.cell))
                this.forceUpdate();
        });
    }
    get colorByActions() {
        var _a, _b;
        const mng = this.plugin.managers.structure.component;
        const repr = this.pivot.representations[0];
        const name = (_a = repr.cell.transform.params) === null || _a === void 0 ? void 0 : _a.colorTheme.name;
        const themes = (0, structure_representation_params_1.getStructureThemeTypes)(this.plugin, (_b = this.pivot.cell.obj) === null || _b === void 0 ? void 0 : _b.data);
        return action_menu_1.ActionMenu.createItemsFromSelectOptions(themes, {
            value: o => () => mng.updateRepresentationsTheme(this.props.group, { color: o[0] }),
            selected: o => o[0] === name
        });
    }
    get actions() {
        const mng = this.plugin.managers.structure.component;
        const ret = [
            [
                action_menu_1.ActionMenu.Header('Add Representation'),
                ...component_1.StructureComponentManager.getRepresentationTypes(this.plugin, this.props.group[0])
                    .map(t => action_menu_1.ActionMenu.Item(t[1], () => mng.addRepresentation(this.props.group, t[0])))
            ]
        ];
        if (this.pivot.representations.length > 0) {
            ret.push([
                action_menu_1.ActionMenu.Header('Set Coloring', { isIndependent: true }),
                ...this.colorByActions
            ]);
        }
        if (mng.canBeModified(this.props.group[0])) {
            ret.push([
                action_menu_1.ActionMenu.Header('Modify by Selection'),
                action_menu_1.ActionMenu.Item('Include', () => mng.modifyByCurrentSelection(this.props.group, 'union'), { icon: icons_1.UnionSvg }),
                action_menu_1.ActionMenu.Item('Subtract', () => mng.modifyByCurrentSelection(this.props.group, 'subtract'), { icon: icons_1.SubtractSvg }),
                action_menu_1.ActionMenu.Item('Intersect', () => mng.modifyByCurrentSelection(this.props.group, 'intersect'), { icon: icons_1.IntersectSvg })
            ]);
        }
        ret.push(action_menu_1.ActionMenu.Item('Select This', () => mng.selectThis(this.props.group), { icon: icons_1.SetSvg }));
        if (mng.canBeModified(this.props.group[0])) {
            ret.push(action_menu_1.ActionMenu.Item('Edit Label', this.toggleLabel));
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
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: 'msp-flex-row', children: [(0, jsx_runtime_1.jsxs)(common_1.Button, { noOverflow: true, className: 'msp-control-button-label', title: `${label}. Click to focus.`, onClick: this.focus, onMouseEnter: this.highlight, onMouseLeave: this.clearHighlight, style: { textAlign: 'left' }, children: [label, (0, jsx_runtime_1.jsx)("small", { className: 'msp-25-lower-contrast-text', style: { float: 'right' }, children: reprLabel })] }), (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: cell.state.isHidden ? icons_1.VisibilityOffOutlinedSvg : icons_1.VisibilityOutlinedSvg, toggleState: false, onClick: this.toggleVisible, title: `${cell.state.isHidden ? 'Show' : 'Hide'} component`, small: true, className: 'msp-form-control', flex: true }), (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.DeleteOutlinedSvg, toggleState: false, onClick: this.remove, title: 'Remove', small: true, className: 'msp-form-control', flex: true }), (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.MoreHorizSvg, onClick: this.toggleAction, title: 'Actions', toggleState: this.state.action === 'action', className: 'msp-form-control', flex: true })] }), this.state.action === 'label' && (0, jsx_runtime_1.jsx)("div", { className: 'msp-control-offset', style: { marginBottom: '6px' }, children: (0, jsx_runtime_1.jsx)(common_1.ControlRow, { label: 'Label', control: (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', textAlignLast: 'center' }, children: [(0, jsx_runtime_1.jsx)(common_1.TextInput, { onChange: this.updateLabel, value: label, style: { flex: '1 1 auto', minWidth: 0 }, className: 'msp-form-control', blurOnEnter: true, blurOnEscape: true }), (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.CheckSvg, onClick: this.toggleLabel, className: 'msp-form-control msp-control-button-label', flex: true })] }) }) }), this.state.action === 'action' && (0, jsx_runtime_1.jsxs)("div", { className: 'msp-accent-offset', children: [(0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '6px' }, children: (0, jsx_runtime_1.jsx)(action_menu_1.ActionMenu, { items: this.actions, onSelect: this.selectAction, noOffset: true }) }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '6px' }, children: component.representations.map(r => (0, jsx_runtime_1.jsx)(StructureRepresentationEntry, { group: this.props.group, representation: r }, r.cell.transform.ref)) })] })] });
    }
}
class StructureRepresentationEntry extends base_1.PurePluginUIComponent {
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
            if (mol_state_1.State.ObjectEvent.isCell(e, this.props.representation.cell))
                this.forceUpdate();
        });
    }
    render() {
        var _a;
        const repr = this.props.representation.cell;
        return (0, jsx_runtime_1.jsxs)("div", { className: 'msp-representation-entry', children: [repr.parent && (0, jsx_runtime_1.jsx)(common_1.ExpandGroup, { header: `${((_a = repr.obj) === null || _a === void 0 ? void 0 : _a.label) || ''} Representation`, noOffset: true, children: (0, jsx_runtime_1.jsx)(update_transform_1.UpdateTransformControl, { state: repr.parent, transform: repr.transform, customHeader: 'none', customUpdate: this.update, noMargin: true }) }), (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.DeleteOutlinedSvg, onClick: this.remove, title: 'Remove', small: true, className: 'msp-default-bg', toggleState: false, style: {
                        position: 'absolute', top: 0, right: '32px', lineHeight: '24px', height: '24px', textAlign: 'right', width: '44px', paddingRight: '6px', background: 'none'
                    } }), (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: this.props.representation.cell.state.isHidden ? icons_1.VisibilityOffOutlinedSvg : icons_1.VisibilityOutlinedSvg, toggleState: false, onClick: this.toggleVisible, title: 'Toggle Visibility', small: true, className: 'msp-default-bg', style: {
                        position: 'absolute', top: 0, right: 0, lineHeight: '24px', height: '24px', textAlign: 'right', width: '32px', paddingRight: '6px', background: 'none'
                    } })] });
    }
}
