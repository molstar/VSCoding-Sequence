"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericEntry = exports.GenericEntryListControls = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const commands_1 = require("../../mol-plugin/commands");
const mol_state_1 = require("../../mol-state");
const base_1 = require("../base");
const common_1 = require("../controls/common");
const update_transform_1 = require("../state/update-transform");
const icons_1 = require("../controls/icons");
class GenericEntryListControls extends base_1.PurePluginUIComponent {
    get current() {
        return this.plugin.managers.structure.hierarchy.behaviors.selection;
    }
    componentDidMount() {
        this.subscribe(this.current, () => this.forceUpdate());
    }
    get unitcell() {
        var _a;
        const { selection } = this.plugin.managers.structure.hierarchy;
        if (selection.structures.length === 0)
            return null;
        const refs = [];
        for (const s of selection.structures) {
            const model = s.model;
            if ((model === null || model === void 0 ? void 0 : model.unitcell) && ((_a = model.unitcell) === null || _a === void 0 ? void 0 : _a.cell.obj))
                refs.push(model.unitcell);
        }
        if (refs.length === 0)
            return null;
        return (0, jsx_runtime_1.jsx)(GenericEntry, { refs: refs, labelMultiple: 'Unit Cells' });
    }
    get customControls() {
        const controls = [];
        this.plugin.genericRepresentationControls.forEach((provider, key) => {
            const [refs, labelMultiple] = provider(this.plugin.managers.structure.hierarchy.selection);
            if (refs.length > 0) {
                controls.push((0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(GenericEntry, { refs: refs, labelMultiple: labelMultiple }) }, key));
            }
        });
        return controls.length > 0 ? controls : null;
    }
    render() {
        return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: '6px' }, children: [this.unitcell, this.customControls] }) });
    }
}
exports.GenericEntryListControls = GenericEntryListControls;
class GenericEntry extends base_1.PurePluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = { showOptions: false };
        this.toggleVisibility = (e) => {
            e.preventDefault();
            this.plugin.managers.structure.hierarchy.toggleVisibility(this.props.refs);
            e.currentTarget.blur();
        };
        this.highlight = (e) => {
            e.preventDefault();
            if (!this.pivot.cell.parent)
                return;
            commands_1.PluginCommands.Interactivity.Object.Highlight(this.plugin, {
                state: this.pivot.cell.parent,
                ref: this.props.refs.map(c => c.cell.transform.ref)
            });
        };
        this.clearHighlight = (e) => {
            e.preventDefault();
            commands_1.PluginCommands.Interactivity.ClearHighlights(this.plugin);
        };
        this.focus = (e) => {
            var _a;
            e.preventDefault();
            let allHidden = true;
            for (const uc of this.props.refs) {
                if (!uc.cell.state.isHidden) {
                    allHidden = false;
                    break;
                }
            }
            if (allHidden) {
                this.plugin.managers.structure.hierarchy.toggleVisibility(this.props.refs, 'show');
            }
            const loci = [];
            for (const uc of this.props.refs) {
                if (uc.cell.state.isHidden) {
                    continue;
                }
                const l = (_a = uc.cell.obj) === null || _a === void 0 ? void 0 : _a.data.repr.getLoci();
                if (l)
                    loci.push(l);
            }
            this.plugin.managers.camera.focusLoci(loci);
        };
        this.toggleOptions = () => this.setState({ showOptions: !this.state.showOptions });
    }
    componentDidMount() {
        this.subscribe(this.plugin.state.events.cell.stateUpdated, e => {
            var _a;
            if (mol_state_1.State.ObjectEvent.isCell(e, (_a = this.pivot) === null || _a === void 0 ? void 0 : _a.cell))
                this.forceUpdate();
        });
    }
    get pivot() { return this.props.refs[0]; }
    render() {
        const { refs, labelMultiple } = this.props;
        if (refs.length === 0)
            return null;
        const pivot = refs[0];
        let label, description;
        if (refs.length === 1) {
            const { obj } = pivot.cell;
            if (!obj)
                return null;
            label = obj === null || obj === void 0 ? void 0 : obj.label;
            description = obj === null || obj === void 0 ? void 0 : obj.description;
        }
        else {
            label = `${refs.length} ${labelMultiple || 'Objects'}`;
        }
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: 'msp-flex-row', children: [(0, jsx_runtime_1.jsxs)("button", { className: 'msp-form-control msp-control-button-label', title: `${label}. Click to focus.`, onClick: this.focus, onMouseEnter: this.highlight, onMouseLeave: this.clearHighlight, style: { textAlign: 'left' }, children: [label, " ", (0, jsx_runtime_1.jsx)("small", { children: description })] }), (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: pivot.cell.state.isHidden ? icons_1.VisibilityOffOutlinedSvg : icons_1.VisibilityOutlinedSvg, toggleState: false, className: 'msp-form-control', onClick: this.toggleVisibility, title: `${pivot.cell.state.isHidden ? 'Show' : 'Hide'}`, small: true, flex: true }), refs.length === 1 && (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.MoreHorizSvg, className: 'msp-form-control', onClick: this.toggleOptions, title: 'Options', toggleState: this.state.showOptions, flex: true })] }), (refs.length === 1 && this.state.showOptions && pivot.cell.parent) && (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)("div", { className: 'msp-control-offset', children: (0, jsx_runtime_1.jsx)(update_transform_1.UpdateTransformControl, { state: pivot.cell.parent, transform: pivot.cell.transform, customHeader: 'none', autoHideApply: true }) }) })] });
    }
}
exports.GenericEntry = GenericEntry;
