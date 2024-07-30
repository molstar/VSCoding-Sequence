"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeasurementControls = exports.MeasurementList = exports.StructureMeasurementsControls = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const loci_1 = require("../../mol-model/loci");
const measurement_1 = require("../../mol-plugin-state/manager/structure/measurement");
const commands_1 = require("../../mol-plugin/commands");
const config_1 = require("../../mol-plugin/config");
const label_1 = require("../../mol-theme/label");
const base_1 = require("../base");
const action_menu_1 = require("../controls/action-menu");
const common_1 = require("../controls/common");
const icons_1 = require("../controls/icons");
const parameters_1 = require("../controls/parameters");
const update_transform_1 = require("../state/update-transform");
const selection_1 = require("./selection");
// TODO details, options (e.g. change text for labels)
class StructureMeasurementsControls extends base_1.CollapsableControls {
    defaultState() {
        return {
            isCollapsed: false,
            header: 'Measurements',
            brand: { accent: 'gray', svg: icons_1.PencilRulerSvg }
        };
    }
    renderControls() {
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(MeasurementControls, {}), (0, jsx_runtime_1.jsx)(MeasurementList, {})] });
    }
}
exports.StructureMeasurementsControls = StructureMeasurementsControls;
class MeasurementList extends base_1.PurePluginUIComponent {
    componentDidMount() {
        this.subscribe(this.plugin.managers.structure.measurement.behaviors.state, () => {
            this.forceUpdate();
        });
    }
    renderGroup(cells, header) {
        const group = [];
        for (const cell of cells) {
            if (cell.obj)
                group.push((0, jsx_runtime_1.jsx)(MeasurementEntry, { cell: cell }, cell.obj.id));
        }
        return group.length ? (0, jsx_runtime_1.jsx)(common_1.ExpandGroup, { header: header, initiallyExpanded: true, children: group }) : null;
    }
    render() {
        const measurements = this.plugin.managers.structure.measurement.state;
        return (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: '6px' }, children: [this.renderGroup(measurements.labels, 'Labels'), this.renderGroup(measurements.distances, 'Distances'), this.renderGroup(measurements.angles, 'Angles'), this.renderGroup(measurements.dihedrals, 'Dihedrals'), this.renderGroup(measurements.orientations, 'Orientations'), this.renderGroup(measurements.planes, 'Planes')] });
    }
}
exports.MeasurementList = MeasurementList;
class MeasurementControls extends base_1.PurePluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = { isBusy: false, action: void 0 };
        this.measureDistance = () => {
            const loci = this.plugin.managers.structure.selection.additionsHistory;
            this.plugin.managers.structure.measurement.addDistance(loci[0].loci, loci[1].loci);
        };
        this.measureAngle = () => {
            const loci = this.plugin.managers.structure.selection.additionsHistory;
            this.plugin.managers.structure.measurement.addAngle(loci[0].loci, loci[1].loci, loci[2].loci);
        };
        this.measureDihedral = () => {
            const loci = this.plugin.managers.structure.selection.additionsHistory;
            this.plugin.managers.structure.measurement.addDihedral(loci[0].loci, loci[1].loci, loci[2].loci, loci[3].loci);
        };
        this.addLabel = () => {
            const loci = this.plugin.managers.structure.selection.additionsHistory;
            this.plugin.managers.structure.measurement.addLabel(loci[0].loci);
        };
        this.addOrientation = () => {
            const locis = [];
            this.plugin.managers.structure.selection.entries.forEach(v => {
                locis.push(v.selection);
            });
            this.plugin.managers.structure.measurement.addOrientation(locis);
        };
        this.addPlane = () => {
            const locis = [];
            this.plugin.managers.structure.selection.entries.forEach(v => {
                locis.push(v.selection);
            });
            this.plugin.managers.structure.measurement.addPlane(locis);
        };
        this.selectAction = item => {
            this.toggleAdd();
            if (!item)
                return;
            (item === null || item === void 0 ? void 0 : item.value)();
        };
        this.toggleAdd = () => this.setState({ action: this.state.action === 'add' ? void 0 : 'add' });
        this.toggleOptions = () => this.setState({ action: this.state.action === 'options' ? void 0 : 'options' });
    }
    componentDidMount() {
        this.subscribe(this.selection.events.additionsHistoryUpdated, () => {
            this.forceUpdate();
            this.updateOrderLabels();
        });
        this.subscribe(this.plugin.behaviors.state.isBusy, v => {
            this.setState({ isBusy: v });
        });
    }
    componentWillUnmount() {
        this.clearOrderLabels();
        super.componentWillUnmount();
    }
    componentDidUpdate(prevProps, prevState) {
        if (this.state.action !== prevState.action)
            this.updateOrderLabels();
    }
    clearOrderLabels() {
        this.plugin.managers.structure.measurement.addOrderLabels([]);
    }
    updateOrderLabels() {
        if (this.state.action !== 'add') {
            this.clearOrderLabels();
            return;
        }
        const locis = [];
        const history = this.selection.additionsHistory;
        for (let idx = 0; idx < history.length && idx < 4; idx++)
            locis.push(history[idx].loci);
        this.plugin.managers.structure.measurement.addOrderLabels(locis);
    }
    get selection() {
        return this.plugin.managers.structure.selection;
    }
    get actions() {
        const history = this.selection.additionsHistory;
        const ret = [
            { kind: 'item', label: `Label ${history.length === 0 ? ' (1 selection item required)' : ' (1st selection item)'}`, value: this.addLabel, disabled: history.length === 0 },
            { kind: 'item', label: `Distance ${history.length < 2 ? ' (2 selection items required)' : ' (top 2 selection items)'}`, value: this.measureDistance, disabled: history.length < 2 },
            { kind: 'item', label: `Angle ${history.length < 3 ? ' (3 selection items required)' : ' (top 3 items)'}`, value: this.measureAngle, disabled: history.length < 3 },
            { kind: 'item', label: `Dihedral ${history.length < 4 ? ' (4 selection items required)' : ' (top 4 selection items)'}`, value: this.measureDihedral, disabled: history.length < 4 },
            { kind: 'item', label: `Orientation ${history.length === 0 ? ' (selection required)' : ' (current selection)'}`, value: this.addOrientation, disabled: history.length === 0 },
            { kind: 'item', label: `Plane ${history.length === 0 ? ' (selection required)' : ' (current selection)'}`, value: this.addPlane, disabled: history.length === 0 },
        ];
        return ret;
    }
    highlight(loci) {
        this.plugin.managers.interactivity.lociHighlights.highlightOnly({ loci }, false);
    }
    moveHistory(e, direction) {
        this.plugin.managers.structure.selection.modifyHistory(e, direction, 4);
    }
    focusLoci(loci) {
        this.plugin.managers.camera.focusLoci(loci);
    }
    historyEntry(e, idx) {
        const history = this.plugin.managers.structure.selection.additionsHistory;
        return (0, jsx_runtime_1.jsxs)("div", { className: 'msp-flex-row', onMouseEnter: () => this.highlight(e.loci), onMouseLeave: () => this.plugin.managers.interactivity.lociHighlights.clearHighlights(), children: [(0, jsx_runtime_1.jsxs)(common_1.Button, { noOverflow: true, title: 'Click to focus. Hover to highlight.', onClick: () => this.focusLoci(e.loci), style: { width: 'auto', textAlign: 'left' }, children: [idx, ". ", (0, jsx_runtime_1.jsx)("span", { dangerouslySetInnerHTML: { __html: e.label } })] }), history.length > 1 && (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.ArrowUpwardSvg, small: true, className: 'msp-form-control', onClick: () => this.moveHistory(e, 'up'), flex: '20px', title: 'Move up' }), history.length > 1 && (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.ArrowDownwardSvg, small: true, className: 'msp-form-control', onClick: () => this.moveHistory(e, 'down'), flex: '20px', title: 'Move down' }), (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.DeleteOutlinedSvg, small: true, className: 'msp-form-control', onClick: () => this.plugin.managers.structure.selection.modifyHistory(e, 'remove'), flex: true, title: 'Remove' })] }, e.id);
    }
    add() {
        const history = this.plugin.managers.structure.selection.additionsHistory;
        const entries = [];
        for (let i = 0, _i = Math.min(history.length, 4); i < _i; i++) {
            entries.push(this.historyEntry(history[i], i + 1));
        }
        const shouldShowToggleHint = this.plugin.config.get(config_1.PluginConfig.Viewport.ShowSelectionMode);
        const toggleHint = shouldShowToggleHint ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [' ', "(toggle ", (0, jsx_runtime_1.jsx)(selection_1.ToggleSelectionModeButton, { inline: true }), " mode)"] })) : null;
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(action_menu_1.ActionMenu, { items: this.actions, onSelect: this.selectAction }), entries.length > 0 && (0, jsx_runtime_1.jsx)("div", { className: 'msp-control-offset', children: entries }), entries.length === 0 && (0, jsx_runtime_1.jsx)("div", { className: 'msp-control-offset msp-help-text', children: (0, jsx_runtime_1.jsxs)("div", { className: 'msp-help-description', children: [(0, jsx_runtime_1.jsx)(icons_1.Icon, { svg: icons_1.HelpOutlineSvg, inline: true }), "Add one or more selections", toggleHint] }) })] });
    }
    render() {
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: 'msp-flex-row', children: [(0, jsx_runtime_1.jsx)(common_1.ToggleButton, { icon: icons_1.AddSvg, label: 'Add', toggle: this.toggleAdd, isSelected: this.state.action === 'add', disabled: this.state.isBusy, className: 'msp-btn-apply-simple' }), (0, jsx_runtime_1.jsx)(common_1.ToggleButton, { icon: icons_1.TuneSvg, label: '', title: 'Options', toggle: this.toggleOptions, isSelected: this.state.action === 'options', disabled: this.state.isBusy, style: { flex: '0 0 40px', padding: 0 } })] }), this.state.action === 'add' && this.add(), this.state.action === 'options' && (0, jsx_runtime_1.jsx)(MeasurementsOptions, {})] });
    }
}
exports.MeasurementControls = MeasurementControls;
class MeasurementsOptions extends base_1.PurePluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = { isDisabled: false };
        this.changed = (options) => {
            this.plugin.managers.structure.measurement.setOptions(options);
        };
    }
    componentDidMount() {
        this.subscribe(this.plugin.managers.structure.measurement.behaviors.state, () => {
            this.forceUpdate();
        });
        this.subscribe(this.plugin.behaviors.state.isBusy, v => {
            this.setState({ isDisabled: v });
        });
    }
    render() {
        const measurements = this.plugin.managers.structure.measurement.state;
        return (0, jsx_runtime_1.jsx)("div", { className: 'msp-control-offset', children: (0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: measurement_1.StructureMeasurementParams, values: measurements.options, onChangeValues: this.changed, isDisabled: this.state.isDisabled }) });
    }
}
class MeasurementEntry extends base_1.PurePluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = { showUpdate: false };
        this.delete = () => {
            commands_1.PluginCommands.State.RemoveObject(this.plugin, { state: this.props.cell.parent, ref: this.props.cell.transform.parent, removeParentGhosts: true });
        };
        this.toggleVisibility = (e) => {
            e.preventDefault();
            commands_1.PluginCommands.State.ToggleVisibility(this.plugin, { state: this.props.cell.parent, ref: this.props.cell.transform.parent });
            e.currentTarget.blur();
        };
        this.highlight = () => {
            var _a;
            const selections = this.selections;
            if (!selections)
                return;
            this.plugin.managers.interactivity.lociHighlights.clearHighlights();
            for (const loci of this.lociArray) {
                this.plugin.managers.interactivity.lociHighlights.highlight({ loci }, false);
            }
            const reprLocis = (_a = this.props.cell.obj) === null || _a === void 0 ? void 0 : _a.data.repr.getAllLoci();
            if (reprLocis) {
                for (const loci of reprLocis) {
                    this.plugin.managers.interactivity.lociHighlights.highlight({ loci }, false);
                }
            }
        };
        this.clearHighlight = () => {
            this.plugin.managers.interactivity.lociHighlights.clearHighlights();
        };
        this.toggleUpdate = () => this.setState({ showUpdate: !this.state.showUpdate });
        this.focus = () => {
            const selections = this.selections;
            if (!selections)
                return;
            const sphere = loci_1.Loci.getBundleBoundingSphere({ loci: this.lociArray });
            if (sphere) {
                this.plugin.managers.camera.focusSphere(sphere);
            }
        };
        this.selectAction = item => {
            if (!item)
                return;
            this.setState({ showUpdate: false });
            (item === null || item === void 0 ? void 0 : item.value)();
        };
    }
    componentDidMount() {
        this.subscribe(this.plugin.state.events.cell.stateUpdated, e => {
            this.forceUpdate();
        });
    }
    get selections() {
        var _a;
        return (_a = this.props.cell.obj) === null || _a === void 0 ? void 0 : _a.data.sourceData;
    }
    get lociArray() {
        const selections = this.selections;
        if (!selections)
            return [];
        if (selections.infos)
            return [selections.infos[0].loci];
        if (selections.pairs)
            return selections.pairs[0].loci;
        if (selections.triples)
            return selections.triples[0].loci;
        if (selections.quads)
            return selections.quads[0].loci;
        if (selections.locis)
            return selections.locis;
        return [];
    }
    get label() {
        const selections = this.selections;
        if (!selections)
            return '<empty>';
        if (selections.infos)
            return (0, label_1.lociLabel)(selections.infos[0].loci, { condensed: true });
        if (selections.pairs)
            return (0, label_1.distanceLabel)(selections.pairs[0], { condensed: true, unitLabel: this.plugin.managers.structure.measurement.state.options.distanceUnitLabel });
        if (selections.triples)
            return (0, label_1.angleLabel)(selections.triples[0], { condensed: true });
        if (selections.quads)
            return (0, label_1.dihedralLabel)(selections.quads[0], { condensed: true });
        if (selections.locis)
            return (0, label_1.structureElementLociLabelMany)(selections.locis, { countsOnly: true });
        return '<empty>';
    }
    get actions() {
        this.props.cell.sourceRef;
        return [action_menu_1.ActionMenu.Item('Select This', () => this.plugin.managers.structure.selection.fromSelections(this.props.cell.sourceRef), { icon: icons_1.SetSvg })];
    }
    render() {
        const { cell } = this.props;
        const { obj } = cell;
        if (!obj)
            return null;
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: 'msp-flex-row', onMouseEnter: this.highlight, onMouseLeave: this.clearHighlight, children: [(0, jsx_runtime_1.jsx)("button", { className: 'msp-form-control msp-control-button-label msp-no-overflow', title: 'Click to focus. Hover to highlight.', onClick: this.focus, style: { width: 'auto', textAlign: 'left' }, children: (0, jsx_runtime_1.jsx)("span", { dangerouslySetInnerHTML: { __html: this.label } }) }), (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: cell.state.isHidden ? icons_1.VisibilityOffOutlinedSvg : icons_1.VisibilityOutlinedSvg, toggleState: false, small: true, className: 'msp-form-control', onClick: this.toggleVisibility, flex: true, title: cell.state.isHidden ? 'Show' : 'Hide' }), (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.DeleteOutlinedSvg, small: true, className: 'msp-form-control', onClick: this.delete, flex: true, title: 'Delete', toggleState: false }), (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.MoreHorizSvg, className: 'msp-form-control', onClick: this.toggleUpdate, flex: true, title: 'Actions', toggleState: this.state.showUpdate })] }, obj.id), this.state.showUpdate && cell.parent && (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)("div", { className: 'msp-accent-offset', children: [(0, jsx_runtime_1.jsx)(action_menu_1.ActionMenu, { items: this.actions, onSelect: this.selectAction, noOffset: true }), (0, jsx_runtime_1.jsx)(common_1.ExpandGroup, { header: 'Options', noOffset: true, children: (0, jsx_runtime_1.jsx)(update_transform_1.UpdateTransformControl, { state: cell.parent, transform: cell.transform, customHeader: 'none', autoHideApply: true }) })] }) })] });
    }
}
