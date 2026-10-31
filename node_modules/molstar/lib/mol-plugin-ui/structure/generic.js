import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { PluginCommands } from '../../mol-plugin/commands';
import { State } from '../../mol-state';
import { PurePluginUIComponent } from '../base';
import { IconButton } from '../controls/common';
import { UpdateTransformControl } from '../state/update-transform';
import { VisibilityOffOutlinedSvg, VisibilityOutlinedSvg, MoreHorizSvg } from '../controls/icons';
export class GenericEntryListControls extends PurePluginUIComponent {
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
        return _jsx(GenericEntry, { refs: refs, labelMultiple: 'Unit Cells' });
    }
    get customControls() {
        const controls = [];
        this.plugin.genericRepresentationControls.forEach((provider, key) => {
            const [refs, labelMultiple] = provider(this.plugin.managers.structure.hierarchy.selection);
            if (refs.length > 0) {
                controls.push(_jsx("div", { children: _jsx(GenericEntry, { refs: refs, labelMultiple: labelMultiple }) }, key));
            }
        });
        return controls.length > 0 ? controls : null;
    }
    render() {
        return _jsx(_Fragment, { children: _jsxs("div", { style: { marginTop: '6px' }, children: [this.unitcell, this.customControls] }) });
    }
}
export class GenericEntry extends PurePluginUIComponent {
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
            PluginCommands.Interactivity.Object.Highlight(this.plugin, {
                state: this.pivot.cell.parent,
                ref: this.props.refs.map(c => c.cell.transform.ref)
            });
        };
        this.clearHighlight = (e) => {
            e.preventDefault();
            PluginCommands.Interactivity.ClearHighlights(this.plugin);
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
            if (State.ObjectEvent.isCell(e, (_a = this.pivot) === null || _a === void 0 ? void 0 : _a.cell))
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
        return _jsxs(_Fragment, { children: [_jsxs("div", { className: 'msp-flex-row', children: [_jsxs("button", { className: 'msp-form-control msp-control-button-label', title: `${label}. Click to focus.`, onClick: this.focus, onMouseEnter: this.highlight, onMouseLeave: this.clearHighlight, style: { textAlign: 'left' }, children: [label, " ", _jsx("small", { children: description })] }), _jsx(IconButton, { svg: pivot.cell.state.isHidden ? VisibilityOffOutlinedSvg : VisibilityOutlinedSvg, toggleState: false, className: 'msp-form-control', onClick: this.toggleVisibility, title: `${pivot.cell.state.isHidden ? 'Show' : 'Hide'}`, small: true, flex: true }), refs.length === 1 && _jsx(IconButton, { svg: MoreHorizSvg, className: 'msp-form-control', onClick: this.toggleOptions, title: 'Options', toggleState: this.state.showOptions, flex: true })] }), (refs.length === 1 && this.state.showOptions && pivot.cell.parent) && _jsx(_Fragment, { children: _jsx("div", { className: 'msp-control-offset', children: _jsx(UpdateTransformControl, { state: pivot.cell.parent, transform: pivot.cell.transform, customHeader: 'none', autoHideApply: true }) }) })] });
    }
}
