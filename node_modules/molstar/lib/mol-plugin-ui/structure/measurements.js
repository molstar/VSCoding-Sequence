import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Loci } from '../../mol-model/loci';
import { StructureMeasurementParams } from '../../mol-plugin-state/manager/structure/measurement';
import { PluginCommands } from '../../mol-plugin/commands';
import { PluginConfig } from '../../mol-plugin/config';
import { angleLabel, dihedralLabel, distanceLabel, lociLabel, structureElementLociLabelMany } from '../../mol-theme/label';
import { CollapsableControls, PurePluginUIComponent } from '../base';
import { ActionMenu } from '../controls/action-menu';
import { Button, ExpandGroup, IconButton, ToggleButton } from '../controls/common';
import { AddSvg, ArrowDownwardSvg, ArrowUpwardSvg, DeleteOutlinedSvg, HelpOutlineSvg, Icon, MoreHorizSvg, PencilRulerSvg, SetSvg, TuneSvg, VisibilityOffOutlinedSvg, VisibilityOutlinedSvg } from '../controls/icons';
import { ParameterControls } from '../controls/parameters';
import { UpdateTransformControl } from '../state/update-transform';
import { ToggleSelectionModeButton } from './selection';
// TODO details, options (e.g. change text for labels)
export class StructureMeasurementsControls extends CollapsableControls {
    defaultState() {
        return {
            isCollapsed: false,
            header: 'Measurements',
            brand: { accent: 'gray', svg: PencilRulerSvg }
        };
    }
    renderControls() {
        return _jsxs(_Fragment, { children: [_jsx(MeasurementControls, {}), _jsx(MeasurementList, {})] });
    }
}
export class MeasurementList extends PurePluginUIComponent {
    componentDidMount() {
        this.subscribe(this.plugin.managers.structure.measurement.behaviors.state, () => {
            this.forceUpdate();
        });
    }
    renderGroup(cells, header) {
        const group = [];
        for (const cell of cells) {
            if (cell.obj)
                group.push(_jsx(MeasurementEntry, { cell: cell }, cell.obj.id));
        }
        return group.length ? _jsx(ExpandGroup, { header: header, initiallyExpanded: true, children: group }) : null;
    }
    render() {
        const measurements = this.plugin.managers.structure.measurement.state;
        return _jsxs("div", { style: { marginTop: '6px' }, children: [this.renderGroup(measurements.labels, 'Labels'), this.renderGroup(measurements.distances, 'Distances'), this.renderGroup(measurements.angles, 'Angles'), this.renderGroup(measurements.dihedrals, 'Dihedrals'), this.renderGroup(measurements.orientations, 'Orientations'), this.renderGroup(measurements.planes, 'Planes')] });
    }
}
export class MeasurementControls extends PurePluginUIComponent {
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
        return _jsxs("div", { className: 'msp-flex-row', onMouseEnter: () => this.highlight(e.loci), onMouseLeave: () => this.plugin.managers.interactivity.lociHighlights.clearHighlights(), children: [_jsxs(Button, { noOverflow: true, title: 'Click to focus. Hover to highlight.', onClick: () => this.focusLoci(e.loci), style: { width: 'auto', textAlign: 'left' }, children: [idx, ". ", _jsx("span", { dangerouslySetInnerHTML: { __html: e.label } })] }), history.length > 1 && _jsx(IconButton, { svg: ArrowUpwardSvg, small: true, className: 'msp-form-control', onClick: () => this.moveHistory(e, 'up'), flex: '20px', title: 'Move up' }), history.length > 1 && _jsx(IconButton, { svg: ArrowDownwardSvg, small: true, className: 'msp-form-control', onClick: () => this.moveHistory(e, 'down'), flex: '20px', title: 'Move down' }), _jsx(IconButton, { svg: DeleteOutlinedSvg, small: true, className: 'msp-form-control', onClick: () => this.plugin.managers.structure.selection.modifyHistory(e, 'remove'), flex: true, title: 'Remove' })] }, e.id);
    }
    add() {
        const history = this.plugin.managers.structure.selection.additionsHistory;
        const entries = [];
        for (let i = 0, _i = Math.min(history.length, 4); i < _i; i++) {
            entries.push(this.historyEntry(history[i], i + 1));
        }
        const shouldShowToggleHint = this.plugin.config.get(PluginConfig.Viewport.ShowSelectionMode);
        const toggleHint = shouldShowToggleHint ? (_jsxs(_Fragment, { children: [' ', "(toggle ", _jsx(ToggleSelectionModeButton, { inline: true }), " mode)"] })) : null;
        return _jsxs(_Fragment, { children: [_jsx(ActionMenu, { items: this.actions, onSelect: this.selectAction }), entries.length > 0 && _jsx("div", { className: 'msp-control-offset', children: entries }), entries.length === 0 && _jsx("div", { className: 'msp-control-offset msp-help-text', children: _jsxs("div", { className: 'msp-help-description', children: [_jsx(Icon, { svg: HelpOutlineSvg, inline: true }), "Add one or more selections", toggleHint] }) })] });
    }
    render() {
        return _jsxs(_Fragment, { children: [_jsxs("div", { className: 'msp-flex-row', children: [_jsx(ToggleButton, { icon: AddSvg, label: 'Add', toggle: this.toggleAdd, isSelected: this.state.action === 'add', disabled: this.state.isBusy, className: 'msp-btn-apply-simple' }), _jsx(ToggleButton, { icon: TuneSvg, label: '', title: 'Options', toggle: this.toggleOptions, isSelected: this.state.action === 'options', disabled: this.state.isBusy, style: { flex: '0 0 40px', padding: 0 } })] }), this.state.action === 'add' && this.add(), this.state.action === 'options' && _jsx(MeasurementsOptions, {})] });
    }
}
class MeasurementsOptions extends PurePluginUIComponent {
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
        return _jsx("div", { className: 'msp-control-offset', children: _jsx(ParameterControls, { params: StructureMeasurementParams, values: measurements.options, onChangeValues: this.changed, isDisabled: this.state.isDisabled }) });
    }
}
class MeasurementEntry extends PurePluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = { showUpdate: false };
        this.delete = () => {
            PluginCommands.State.RemoveObject(this.plugin, { state: this.props.cell.parent, ref: this.props.cell.transform.parent, removeParentGhosts: true });
        };
        this.toggleVisibility = (e) => {
            e.preventDefault();
            PluginCommands.State.ToggleVisibility(this.plugin, { state: this.props.cell.parent, ref: this.props.cell.transform.parent });
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
            const sphere = Loci.getBundleBoundingSphere({ loci: this.lociArray });
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
            return lociLabel(selections.infos[0].loci, { condensed: true });
        if (selections.pairs)
            return distanceLabel(selections.pairs[0], { condensed: true, unitLabel: this.plugin.managers.structure.measurement.state.options.distanceUnitLabel });
        if (selections.triples)
            return angleLabel(selections.triples[0], { condensed: true });
        if (selections.quads)
            return dihedralLabel(selections.quads[0], { condensed: true });
        if (selections.locis)
            return structureElementLociLabelMany(selections.locis, { countsOnly: true });
        return '<empty>';
    }
    get actions() {
        this.props.cell.sourceRef;
        return [ActionMenu.Item('Select This', () => this.plugin.managers.structure.selection.fromSelections(this.props.cell.sourceRef), { icon: SetSvg })];
    }
    render() {
        const { cell } = this.props;
        const { obj } = cell;
        if (!obj)
            return null;
        return _jsxs(_Fragment, { children: [_jsxs("div", { className: 'msp-flex-row', onMouseEnter: this.highlight, onMouseLeave: this.clearHighlight, children: [_jsx("button", { className: 'msp-form-control msp-control-button-label msp-no-overflow', title: 'Click to focus. Hover to highlight.', onClick: this.focus, style: { width: 'auto', textAlign: 'left' }, children: _jsx("span", { dangerouslySetInnerHTML: { __html: this.label } }) }), _jsx(IconButton, { svg: cell.state.isHidden ? VisibilityOffOutlinedSvg : VisibilityOutlinedSvg, toggleState: false, small: true, className: 'msp-form-control', onClick: this.toggleVisibility, flex: true, title: cell.state.isHidden ? 'Show' : 'Hide' }), _jsx(IconButton, { svg: DeleteOutlinedSvg, small: true, className: 'msp-form-control', onClick: this.delete, flex: true, title: 'Delete', toggleState: false }), _jsx(IconButton, { svg: MoreHorizSvg, className: 'msp-form-control', onClick: this.toggleUpdate, flex: true, title: 'Actions', toggleState: this.state.showUpdate })] }, obj.id), this.state.showUpdate && cell.parent && _jsx(_Fragment, { children: _jsxs("div", { className: 'msp-accent-offset', children: [_jsx(ActionMenu, { items: this.actions, onSelect: this.selectAction, noOffset: true }), _jsx(ExpandGroup, { header: 'Options', noOffset: true, children: _jsx(UpdateTransformControl, { state: cell.parent, transform: cell.transform, customHeader: 'none', autoHideApply: true }) })] }) })] });
    }
}
