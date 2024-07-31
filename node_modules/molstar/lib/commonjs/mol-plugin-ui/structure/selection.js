"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureSelectionStatsControls = exports.StructureSelectionActionsControls = exports.ToggleSelectionModeButton = void 0;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Jason Pattle <jpattle.exscientia.co.uk>
 */
const React = tslib_1.__importStar(require("react"));
const structure_selection_query_1 = require("../../mol-plugin-state/helpers/structure-selection-query");
const interactivity_1 = require("../../mol-plugin-state/manager/interactivity");
const component_1 = require("../../mol-plugin-state/manager/structure/component");
const config_1 = require("../../mol-plugin/config");
const id_list_1 = require("../../mol-script/util/id-list");
const memoize_1 = require("../../mol-util/memoize");
const param_definition_1 = require("../../mol-util/param-definition");
const string_1 = require("../../mol-util/string");
const base_1 = require("../base");
const action_menu_1 = require("../controls/action-menu");
const common_1 = require("../controls/common");
const icons_1 = require("../controls/icons");
const parameters_1 = require("../controls/parameters");
const help_1 = require("../viewport/help");
const components_1 = require("./components");
class ToggleSelectionModeButton extends base_1.PurePluginUIComponent {
    constructor() {
        super(...arguments);
        this._toggleSelMode = () => {
            this.plugin.selectionMode = !this.plugin.selectionMode;
        };
    }
    componentDidMount() {
        this.subscribe(this.plugin.events.canvas3d.settingsUpdated, () => this.forceUpdate());
        this.subscribe(this.plugin.layout.events.updated, () => this.forceUpdate());
        this.subscribe(this.plugin.behaviors.interaction.selectionMode, () => this.forceUpdate());
    }
    render() {
        const style = this.props.inline
            ? { background: 'transparent', width: 'auto', height: 'auto', lineHeight: 'unset' }
            : { background: 'transparent' };
        return (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.SelectionModeSvg, onClick: this._toggleSelMode, title: 'Toggle Selection Mode', style: style, toggleState: this.plugin.selectionMode });
    }
}
exports.ToggleSelectionModeButton = ToggleSelectionModeButton;
const StructureSelectionParams = {
    granularity: interactivity_1.InteractivityManager.Params.granularity,
};
const ActionHeader = new Map([
    ['add', 'Add/Union Selection'],
    ['remove', 'Remove/Subtract Selection'],
    ['intersect', 'Intersect Selection'],
    ['set', 'Set Selection']
]);
class StructureSelectionActionsControls extends base_1.PluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = {
            action: void 0,
            helper: void 0,
            isEmpty: true,
            isBusy: false,
            canUndo: false,
        };
        this.set = (modifier, selectionQuery) => {
            this.plugin.managers.structure.selection.fromSelectionQuery(modifier, selectionQuery, false);
        };
        this.selectQuery = (item, e) => {
            if (!item || !this.state.action) {
                this.setState({ action: void 0 });
                return;
            }
            const q = this.state.action;
            if (e === null || e === void 0 ? void 0 : e.shiftKey) {
                this.set(q, item.value);
            }
            else {
                this.setState({ action: void 0 }, () => {
                    this.set(q, item.value);
                });
            }
        };
        this.selectHelper = (item, e) => {
            console.log(item);
            if (!item || !this.state.action) {
                this.setState({ action: void 0, helper: void 0 });
                return;
            }
            this.setState({ helper: item.value.kind });
        };
        this.queriesItems = [];
        this.queriesVersion = -1;
        this.helpersItems = void 0;
        this.toggleAdd = this.showAction('add');
        this.toggleRemove = this.showAction('remove');
        this.toggleIntersect = this.showAction('intersect');
        this.toggleSet = this.showAction('set');
        this.toggleTheme = this.showAction('theme');
        this.toggleAddComponent = this.showAction('add-component');
        this.toggleHelp = this.showAction('help');
        this.setGranuality = ({ value }) => {
            this.plugin.managers.interactivity.setProps({ granularity: value });
        };
        this.turnOff = () => this.plugin.selectionMode = false;
        this.undo = () => {
            const task = this.plugin.state.data.undo();
            if (task)
                this.plugin.runTask(task);
        };
        this.subtract = () => {
            const sel = this.plugin.managers.structure.hierarchy.getStructuresWithSelection();
            const components = [];
            for (const s of sel)
                components.push(...s.components);
            if (components.length === 0)
                return;
            this.plugin.managers.structure.component.modifyByCurrentSelection(components, 'subtract');
        };
    }
    componentDidMount() {
        this.subscribe(this.plugin.managers.structure.hierarchy.behaviors.selection, c => {
            const isEmpty = c.hierarchy.structures.length === 0;
            if (this.state.isEmpty !== isEmpty) {
                this.setState({ isEmpty });
            }
            // trigger elementQueries and nonStandardResidueQueries recalculation
            this.queriesVersion = -1;
            this.forceUpdate();
        });
        this.subscribe(this.plugin.behaviors.state.isBusy, v => {
            this.setState({ isBusy: v, action: void 0 });
        });
        this.subscribe(this.plugin.managers.interactivity.events.propsUpdated, () => {
            this.forceUpdate();
        });
        this.subscribe(this.plugin.state.data.events.historyUpdated, ({ state }) => {
            this.setState({ canUndo: state.canUndo });
        });
    }
    get isDisabled() {
        return this.state.isBusy || this.state.isEmpty;
    }
    get structures() {
        var _a;
        const structures = [];
        for (const s of this.plugin.managers.structure.hierarchy.selection.structures) {
            const structure = (_a = s.cell.obj) === null || _a === void 0 ? void 0 : _a.data;
            if (structure)
                structures.push(structure);
        }
        return structures;
    }
    get queries() {
        const { registry } = this.plugin.query.structure;
        if (registry.version !== this.queriesVersion) {
            const structures = this.structures;
            const queries = [
                ...registry.list,
                ...(0, structure_selection_query_1.getPolymerAndBranchedEntityQueries)(structures),
                ...(0, structure_selection_query_1.getNonStandardResidueQueries)(structures),
                ...(0, structure_selection_query_1.getElementQueries)(structures)
            ].sort((a, b) => b.priority - a.priority);
            this.queriesItems = action_menu_1.ActionMenu.createItems(queries, {
                filter: q => q !== structure_selection_query_1.StructureSelectionQueries.current && !q.isHidden,
                label: q => q.label,
                category: q => q.category,
                description: q => q.description
            });
            this.queriesVersion = registry.version;
        }
        return this.queriesItems;
    }
    get helpers() {
        if (this.helpersItems)
            return this.helpersItems;
        // TODO: this is an initial implementation of the helper UI
        //       the plan is to add support to input queries in different languages
        //       after this has been implemented in mol-script
        const helpers = [
            { kind: 'residue-list', category: 'Helpers', label: 'Atom/Residue Identifier List', description: 'Create a selection from a list of atom/residue ranges.' }
        ];
        this.helpersItems = action_menu_1.ActionMenu.createItems(helpers, {
            label: q => q.label,
            category: q => q.category,
            description: q => q.description
        });
        return this.helpersItems;
    }
    showAction(q) {
        return () => this.setState({ action: this.state.action === q ? void 0 : q, helper: void 0 });
    }
    render() {
        const granularity = this.plugin.managers.interactivity.props.granularity;
        const undoTitle = this.state.canUndo
            ? `Undo ${this.plugin.state.data.latestUndoLabel}`
            : 'Some mistakes of the past can be undone.';
        let children = void 0;
        if (this.state.action && !this.state.helper) {
            children = (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(this.state.action && this.state.action !== 'theme' && this.state.action !== 'add-component' && this.state.action !== 'help') && (0, jsx_runtime_1.jsxs)("div", { className: 'msp-selection-viewport-controls-actions', children: [(0, jsx_runtime_1.jsx)(action_menu_1.ActionMenu, { header: ActionHeader.get(this.state.action), title: 'Click to close.', items: this.queries, onSelect: this.selectQuery, noOffset: true }), (0, jsx_runtime_1.jsx)(action_menu_1.ActionMenu, { items: this.helpers, onSelect: this.selectHelper, noOffset: true })] }), this.state.action === 'theme' && (0, jsx_runtime_1.jsx)("div", { className: 'msp-selection-viewport-controls-actions', children: (0, jsx_runtime_1.jsx)(common_1.ControlGroup, { header: 'Theme', title: 'Click to close.', initialExpanded: true, hideExpander: true, hideOffset: true, onHeaderClick: this.toggleTheme, topRightIcon: icons_1.CloseSvg, children: (0, jsx_runtime_1.jsx)(ApplyThemeControls, { onApply: this.toggleTheme }) }) }), this.state.action === 'add-component' && (0, jsx_runtime_1.jsx)("div", { className: 'msp-selection-viewport-controls-actions', children: (0, jsx_runtime_1.jsx)(common_1.ControlGroup, { header: 'Add Component', title: 'Click to close.', initialExpanded: true, hideExpander: true, hideOffset: true, onHeaderClick: this.toggleAddComponent, topRightIcon: icons_1.CloseSvg, children: (0, jsx_runtime_1.jsx)(components_1.AddComponentControls, { onApply: this.toggleAddComponent, forSelection: true }) }) }), this.state.action === 'help' && (0, jsx_runtime_1.jsx)("div", { className: 'msp-selection-viewport-controls-actions', children: (0, jsx_runtime_1.jsxs)(common_1.ControlGroup, { header: 'Help', title: 'Click to close.', initialExpanded: true, hideExpander: true, hideOffset: true, onHeaderClick: this.toggleHelp, topRightIcon: icons_1.CloseSvg, maxHeight: '300px', children: [(0, jsx_runtime_1.jsx)(help_1.HelpGroup, { header: 'Selection Operations', children: (0, jsx_runtime_1.jsxs)(help_1.HelpText, { children: ["Use ", (0, jsx_runtime_1.jsx)(icons_1.Icon, { svg: icons_1.UnionSvg, inline: true }), " ", (0, jsx_runtime_1.jsx)(icons_1.Icon, { svg: icons_1.SubtractSvg, inline: true }), " ", (0, jsx_runtime_1.jsx)(icons_1.Icon, { svg: icons_1.IntersectSvg, inline: true }), " ", (0, jsx_runtime_1.jsx)(icons_1.Icon, { svg: icons_1.SetSvg, inline: true }), " to modify the selection."] }) }), (0, jsx_runtime_1.jsx)(help_1.HelpGroup, { header: 'Representation Operations', children: (0, jsx_runtime_1.jsxs)(help_1.HelpText, { children: ["Use ", (0, jsx_runtime_1.jsx)(icons_1.Icon, { svg: icons_1.BrushSvg, inline: true }), " ", (0, jsx_runtime_1.jsx)(icons_1.Icon, { svg: icons_1.CubeOutlineSvg, inline: true }), " ", (0, jsx_runtime_1.jsx)(icons_1.Icon, { svg: icons_1.RemoveSvg, inline: true }), " ", (0, jsx_runtime_1.jsx)(icons_1.Icon, { svg: icons_1.RestoreSvg, inline: true }), " to color, create components, remove from components, or undo actions."] }) }), (0, jsx_runtime_1.jsx)(help_1.ViewportHelpContent, { selectOnly: true })] }) })] });
        }
        else if (ActionHeader.has(this.state.action) && this.state.helper === 'residue-list') {
            const close = () => this.setState({ action: void 0, helper: void 0 });
            children = (0, jsx_runtime_1.jsx)("div", { className: 'msp-selection-viewport-controls-actions', children: (0, jsx_runtime_1.jsx)(common_1.ControlGroup, { header: 'Atom/Residue Identifier List', title: 'Click to close.', initialExpanded: true, hideExpander: true, hideOffset: true, onHeaderClick: close, topRightIcon: icons_1.CloseSvg, children: (0, jsx_runtime_1.jsx)(ResidueListSelectionHelper, { modifier: this.state.action, plugin: this.plugin, close: close }) }) });
        }
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: 'msp-flex-row', style: { background: 'none' }, children: [(0, jsx_runtime_1.jsx)(parameters_1.PureSelectControl, { title: `Picking Level for selecting and highlighting`, param: StructureSelectionParams.granularity, name: 'granularity', value: granularity, onChange: this.setGranuality, isDisabled: this.isDisabled }), (0, jsx_runtime_1.jsx)(common_1.ToggleButton, { icon: icons_1.UnionSvg, title: `${ActionHeader.get('add')}. Hold shift key to keep menu open.`, toggle: this.toggleAdd, isSelected: this.state.action === 'add', disabled: this.isDisabled }), (0, jsx_runtime_1.jsx)(common_1.ToggleButton, { icon: icons_1.SubtractSvg, title: `${ActionHeader.get('remove')}. Hold shift key to keep menu open.`, toggle: this.toggleRemove, isSelected: this.state.action === 'remove', disabled: this.isDisabled }), (0, jsx_runtime_1.jsx)(common_1.ToggleButton, { icon: icons_1.IntersectSvg, title: `${ActionHeader.get('intersect')}. Hold shift key to keep menu open.`, toggle: this.toggleIntersect, isSelected: this.state.action === 'intersect', disabled: this.isDisabled }), (0, jsx_runtime_1.jsx)(common_1.ToggleButton, { icon: icons_1.SetSvg, title: `${ActionHeader.get('set')}. Hold shift key to keep menu open.`, toggle: this.toggleSet, isSelected: this.state.action === 'set', disabled: this.isDisabled }), (0, jsx_runtime_1.jsx)(common_1.ToggleButton, { icon: icons_1.BrushSvg, title: 'Apply Theme to Selection', toggle: this.toggleTheme, isSelected: this.state.action === 'theme', disabled: this.isDisabled, style: { marginLeft: '10px' } }), (0, jsx_runtime_1.jsx)(common_1.ToggleButton, { icon: icons_1.CubeOutlineSvg, title: 'Create Component of Selection with Representation', toggle: this.toggleAddComponent, isSelected: this.state.action === 'add-component', disabled: this.isDisabled }), (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.RemoveSvg, title: 'Remove/subtract Selection from all Components', onClick: this.subtract, disabled: this.isDisabled }), (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.RestoreSvg, onClick: this.undo, disabled: !this.state.canUndo || this.isDisabled, title: undoTitle }), (0, jsx_runtime_1.jsx)(common_1.ToggleButton, { icon: icons_1.HelpOutlineSvg, title: 'Show/hide help', toggle: this.toggleHelp, style: { marginLeft: '10px' }, isSelected: this.state.action === 'help' }), this.plugin.config.get(config_1.PluginConfig.Viewport.ShowSelectionMode) && ((0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.CancelOutlinedSvg, title: 'Turn selection mode off', onClick: this.turnOff }))] }), children] });
    }
}
exports.StructureSelectionActionsControls = StructureSelectionActionsControls;
class StructureSelectionStatsControls extends base_1.PluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = {
            isEmpty: true,
            isBusy: false
        };
        this.clear = () => this.plugin.managers.interactivity.lociSelects.deselectAll();
        this.focus = () => {
            if (this.plugin.managers.structure.selection.stats.elementCount === 0)
                return;
            const { sphere } = this.plugin.managers.structure.selection.getBoundary();
            this.plugin.managers.camera.focusSphere(sphere);
        };
        this.highlight = (e) => {
            this.plugin.managers.interactivity.lociHighlights.clearHighlights();
            this.plugin.managers.structure.selection.entries.forEach(e => {
                this.plugin.managers.interactivity.lociHighlights.highlight({ loci: e.selection }, false);
            });
        };
        this.clearHighlight = () => {
            this.plugin.managers.interactivity.lociHighlights.clearHighlights();
        };
    }
    componentDidMount() {
        this.subscribe(this.plugin.managers.structure.selection.events.changed, () => {
            this.forceUpdate();
        });
        this.subscribe(this.plugin.managers.structure.hierarchy.behaviors.selection, c => {
            const isEmpty = c.structures.length === 0;
            if (this.state.isEmpty !== isEmpty) {
                this.setState({ isEmpty });
            }
        });
        this.subscribe(this.plugin.behaviors.state.isBusy, v => {
            this.setState({ isBusy: v });
        });
    }
    get isDisabled() {
        return this.state.isBusy || this.state.isEmpty;
    }
    get stats() {
        const stats = this.plugin.managers.structure.selection.stats;
        if (stats.structureCount === 0 || stats.elementCount === 0) {
            return 'Nothing Selected';
        }
        else {
            return `${(0, string_1.stripTags)(stats.label)} Selected`;
        }
    }
    render() {
        const stats = this.plugin.managers.structure.selection.stats;
        const empty = stats.structureCount === 0 || stats.elementCount === 0;
        if (empty && this.props.hideOnEmpty)
            return null;
        return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)("div", { className: 'msp-flex-row', children: [(0, jsx_runtime_1.jsx)(common_1.Button, { noOverflow: true, onClick: this.focus, title: 'Click to Focus Selection', disabled: empty, onMouseEnter: this.highlight, onMouseLeave: this.clearHighlight, style: { textAlignLast: !empty ? 'left' : void 0 }, children: this.stats }), !empty && (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.CancelOutlinedSvg, onClick: this.clear, title: 'Clear', className: 'msp-form-control', flex: true })] }) });
    }
}
exports.StructureSelectionStatsControls = StructureSelectionStatsControls;
class ApplyThemeControls extends base_1.PurePluginUIComponent {
    constructor() {
        super(...arguments);
        this._params = (0, memoize_1.memoizeLatest)((pivot) => component_1.StructureComponentManager.getThemeParams(this.plugin, pivot));
        this.state = { values: param_definition_1.ParamDefinition.getDefaultValues(this.params) };
        this.apply = () => {
            var _a, _b;
            this.plugin.managers.structure.component.applyTheme(this.state.values, this.plugin.managers.structure.hierarchy.current.structures);
            (_b = (_a = this.props).onApply) === null || _b === void 0 ? void 0 : _b.call(_a);
        };
        this.paramsChanged = (values) => this.setState({ values });
    }
    get params() { return this._params(this.plugin.managers.structure.component.pivotStructure); }
    render() {
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: this.params, values: this.state.values, onChangeValues: this.paramsChanged }), (0, jsx_runtime_1.jsx)(common_1.Button, { icon: icons_1.BrushSvg, className: 'msp-btn-commit msp-btn-commit-on', onClick: this.apply, style: { marginTop: '1px' }, children: "Apply Theme" })] });
    }
}
const ResidueListIdTypeParams = {
    idType: param_definition_1.ParamDefinition.Select('auth', param_definition_1.ParamDefinition.arrayToOptions(['auth', 'label', 'atom-id'])),
    identifiers: param_definition_1.ParamDefinition.Text('', { description: 'A comma separated list of atom identifiers (e.g. 10, 15-25) or residue ranges in given chain (e.g. A 10-15, B 25, C 30:i)' })
};
const DefaultResidueListIdTypeParams = param_definition_1.ParamDefinition.getDefaultValues(ResidueListIdTypeParams);
function ResidueListSelectionHelper({ modifier, plugin, close }) {
    const [state, setState] = React.useState(DefaultResidueListIdTypeParams);
    const apply = () => {
        if (state.identifiers.trim().length === 0)
            return;
        try {
            close();
            const query = (0, id_list_1.compileIdListSelection)(state.identifiers, state.idType);
            plugin.managers.structure.selection.fromCompiledQuery(modifier, query, false);
        }
        catch (e) {
            console.error(e);
            plugin.log.error('Failed to create selection');
        }
    };
    return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: ResidueListIdTypeParams, values: state, onChangeValues: setState, onEnter: apply }), (0, jsx_runtime_1.jsxs)(common_1.Button, { className: 'msp-btn-commit msp-btn-commit-on', disabled: state.identifiers.trim().length === 0, onClick: apply, style: { marginTop: '1px' }, children: [(0, string_1.capitalize)(modifier), " Selection"] })] });
}
