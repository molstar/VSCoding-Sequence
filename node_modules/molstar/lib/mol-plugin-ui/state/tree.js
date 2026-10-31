import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { debounceTime, filter } from 'rxjs/operators';
import { PluginCommands } from '../../mol-plugin/commands';
import { StateObject, StateTransform } from '../../mol-state';
import { StateTreeSpine } from '../../mol-state/tree/spine';
import { PluginUIComponent } from '../base';
import { ActionMenu } from '../controls/action-menu';
import { Button, ControlGroup, IconButton } from '../controls/common';
import { Icon, HomeOutlinedSvg, ArrowRightSvg, ArrowDropDownSvg, DeleteOutlinedSvg, VisibilityOffOutlinedSvg, VisibilityOutlinedSvg, CloseSvg } from '../controls/icons';
import { ApplyActionControl } from './apply-action';
import { UpdateTransformControl } from './update-transform';
export class StateTree extends PluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = { showActions: true };
    }
    componentDidMount() {
        this.subscribe(this.plugin.state.events.cell.created, e => {
            if (e.cell.transform.parent === StateTransform.RootRef)
                this.forceUpdate();
        });
        this.subscribe(this.plugin.state.events.cell.removed, e => {
            if (e.parent === StateTransform.RootRef)
                this.forceUpdate();
        });
    }
    static getDerivedStateFromProps(props, state) {
        const n = props.state.tree.root.ref;
        const children = props.state.tree.children.get(n);
        const showActions = children.size === 0;
        if (state.showActions === showActions)
            return null;
        return { showActions };
    }
    render() {
        const ref = this.props.state.tree.root.ref;
        if (this.state.showActions) {
            return _jsxs("div", { style: { margin: '10px', cursor: 'default' }, children: [_jsx("p", { children: "Nothing to see here yet." }), _jsxs("p", { children: ["Structures and Volumes can be loaded from the ", _jsx(Icon, { svg: HomeOutlinedSvg }), " tab."] })] });
        }
        return _jsx(StateTreeNode, { cell: this.props.state.cells.get(ref), depth: 0 });
    }
}
class StateTreeNode extends PluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = {
            isCollapsed: !!this.props.cell.state.isCollapsed,
            isNull: StateTreeNode.isNull(this.props.cell),
            showLabel: StateTreeNode.showLabel(this.props.cell)
        };
    }
    is(e) {
        return e.ref === this.ref && e.state === this.props.cell.parent;
    }
    get ref() {
        return this.props.cell.transform.ref;
    }
    componentDidMount() {
        this.subscribe(this.plugin.state.events.cell.stateUpdated, e => {
            if (this.props.cell === e.cell && this.is(e) && e.state.cells.has(this.ref)) {
                if (this.state.isCollapsed !== !!e.cell.state.isCollapsed
                    || this.state.isNull !== StateTreeNode.isNull(e.cell)
                    || this.state.showLabel !== StateTreeNode.showLabel(e.cell)) {
                    this.forceUpdate();
                }
            }
        });
        this.subscribe(this.plugin.state.events.cell.created, e => {
            if (this.props.cell.parent === e.state && this.ref === e.cell.transform.parent) {
                this.forceUpdate();
            }
        });
        this.subscribe(this.plugin.state.events.cell.removed, e => {
            if (this.props.cell.parent === e.state && this.ref === e.parent) {
                this.forceUpdate();
            }
        });
    }
    static getDerivedStateFromProps(props, state) {
        const isNull = StateTreeNode.isNull(props.cell);
        const showLabel = StateTreeNode.showLabel(props.cell);
        if (!!props.cell.state.isCollapsed === state.isCollapsed && state.isNull === isNull && state.showLabel === showLabel)
            return null;
        return { isCollapsed: !!props.cell.state.isCollapsed, isNull, showLabel };
    }
    static hasDecorator(cell) {
        var _a;
        const children = cell.parent.tree.children.get(cell.transform.ref);
        if (children.size !== 1)
            return false;
        return !!((_a = cell.parent) === null || _a === void 0 ? void 0 : _a.tree.transforms.get(children.first()).transformer.definition.isDecorator);
    }
    static isNull(cell) {
        return !cell || !cell.parent || cell.obj === StateObject.Null || !cell.parent.tree.transforms.has(cell.transform.ref);
    }
    static showLabel(cell) {
        return (cell.transform.ref !== StateTransform.RootRef) && (cell.status !== 'ok' || (!cell.state.isGhost && !StateTreeNode.hasDecorator(cell)));
    }
    render() {
        if (this.state.isNull) {
            return null;
        }
        const cell = this.props.cell;
        const children = cell.parent.tree.children.get(this.ref);
        if (!this.state.showLabel) {
            if (children.size === 0)
                return null;
            return _jsx(_Fragment, { children: children.map(c => _jsx(StateTreeNode, { cell: cell.parent.cells.get(c), depth: this.props.depth }, c)) });
        }
        const newDepth = this.props.depth + 1;
        return _jsxs(_Fragment, { children: [_jsx(StateTreeNodeLabel, { cell: cell, depth: this.props.depth }), children.size === 0
                    ? void 0
                    : _jsx("div", { style: { display: this.state.isCollapsed ? 'none' : 'block' }, children: children.map(c => _jsx(StateTreeNode, { cell: cell.parent.cells.get(c), depth: newDepth }, c)) })] });
    }
}
class StateTreeNodeLabel extends PluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = {
            isCurrent: this.props.cell.parent.current === this.ref,
            isCollapsed: !!this.props.cell.state.isCollapsed,
            action: void 0,
            currentAction: void 0
        };
        this.setCurrent = (e) => {
            e === null || e === void 0 ? void 0 : e.preventDefault();
            e === null || e === void 0 ? void 0 : e.currentTarget.blur();
            PluginCommands.State.SetCurrentObject(this.plugin, { state: this.props.cell.parent, ref: this.ref });
        };
        this.setCurrentRoot = (e) => {
            e === null || e === void 0 ? void 0 : e.preventDefault();
            e === null || e === void 0 ? void 0 : e.currentTarget.blur();
            PluginCommands.State.SetCurrentObject(this.plugin, { state: this.props.cell.parent, ref: StateTransform.RootRef });
        };
        this.remove = (e) => {
            e === null || e === void 0 ? void 0 : e.preventDefault();
            PluginCommands.State.RemoveObject(this.plugin, { state: this.props.cell.parent, ref: this.ref, removeParentGhosts: true });
        };
        this.toggleVisible = (e) => {
            e.preventDefault();
            PluginCommands.State.ToggleVisibility(this.plugin, { state: this.props.cell.parent, ref: this.ref });
            e.currentTarget.blur();
        };
        this.toggleExpanded = (e) => {
            e.preventDefault();
            PluginCommands.State.ToggleExpanded(this.plugin, { state: this.props.cell.parent, ref: this.ref });
            e.currentTarget.blur();
        };
        this.highlight = (e) => {
            e.preventDefault();
            PluginCommands.Interactivity.Object.Highlight(this.plugin, { state: this.props.cell.parent, ref: this.ref });
            e.currentTarget.blur();
        };
        this.clearHighlight = (e) => {
            e.preventDefault();
            PluginCommands.Interactivity.ClearHighlights(this.plugin);
            e.currentTarget.blur();
        };
        this.hideApply = () => {
            this.setCurrentRoot();
        };
        this.selectAction = item => {
            if (!item)
                return;
            (item === null || item === void 0 ? void 0 : item.value)();
        };
    }
    is(e) {
        return e.ref === this.ref && e.state === this.props.cell.parent;
    }
    get ref() {
        return this.props.cell.transform.ref;
    }
    componentDidMount() {
        this.subscribe(this.plugin.state.events.cell.stateUpdated.pipe(filter(e => this.is(e)), debounceTime(33)), e => {
            this.forceUpdate();
        });
        this.subscribe(this.props.cell.parent.behaviors.currentObject, e => {
            if (!this.is(e)) {
                if (this.state.isCurrent && e.state.transforms.has(this.ref)) {
                    this._setCurrent(this.props.cell.parent.current === this.ref, this.state.isCollapsed);
                }
                return;
            }
            if (e.state.transforms.has(this.ref)) {
                this._setCurrent(this.props.cell.parent.current === this.ref, !!this.props.cell.state.isCollapsed);
            }
        });
    }
    _setCurrent(isCurrent, isCollapsed) {
        if (isCurrent) {
            this.setState({ isCurrent, action: 'options', currentAction: void 0, isCollapsed });
        }
        else {
            this.setState({ isCurrent, action: void 0, currentAction: void 0, isCollapsed });
        }
    }
    static getDerivedStateFromProps(props, state) {
        const isCurrent = props.cell.parent.current === props.cell.transform.ref;
        const isCollapsed = !!props.cell.state.isCollapsed;
        if (state.isCollapsed === isCollapsed && state.isCurrent === isCurrent)
            return null;
        return { isCurrent, isCollapsed, action: void 0, currentAction: void 0 };
    }
    get actions() {
        const cell = this.props.cell;
        const actions = [...cell.parent.actions.fromCell(cell, this.plugin)];
        if (actions.length === 0)
            return;
        actions.sort((a, b) => a.definition.display.name < b.definition.display.name ? -1 : a.definition.display.name === b.definition.display.name ? 0 : 1);
        return [
            ActionMenu.Header('Apply Action'),
            ...actions.map(a => ActionMenu.Item(a.definition.display.name, () => this.setState({ action: 'apply', currentAction: a })))
        ];
    }
    updates(margin) {
        const cell = this.props.cell;
        const decoratorChain = StateTreeSpine.getDecoratorChain(cell.parent, cell.transform.ref);
        const decorators = [];
        for (let i = decoratorChain.length - 1; i >= 0; i--) {
            const d = decoratorChain[i];
            decorators.push(_jsx(UpdateTransformControl, { state: cell.parent, transform: d.transform, noMargin: true, wrapInExpander: true, expanderHeaderLeftMargin: margin }, `${d.transform.transformer.id}-${i}`));
        }
        return _jsx("div", { className: 'msp-tree-updates-wrapper', children: decorators });
    }
    render() {
        const cell = this.props.cell;
        const n = cell.transform;
        if (!cell)
            return null;
        const isCurrent = this.is(cell.parent.behaviors.currentObject.value);
        const disabled = cell.status !== 'error' && cell.status !== 'ok';
        let label;
        if (cell.status === 'error' || !cell.obj) {
            const name = cell.status === 'error' ? cell.errorText : n.transformer.definition.display.name;
            label = _jsxs(Button, { className: 'msp-btn-tree-label msp-no-hover-outline', noOverflow: true, title: name, onClick: this.state.isCurrent ? this.setCurrentRoot : this.setCurrent, disabled: disabled, children: [cell.status === 'error' && _jsxs("b", { children: ["[", cell.status, "]"] }), " ", _jsx("span", { children: name })] });
        }
        else {
            const obj = cell.obj;
            const title = `${obj.label} ${obj.description ? obj.description : ''}`;
            label = _jsxs(Button, { className: `msp-btn-tree-label msp-type-class-${obj.type.typeClass}`, noOverflow: true, disabled: disabled, title: title, onClick: this.state.isCurrent ? this.setCurrentRoot : this.setCurrent, children: [_jsx("span", { children: obj.label }), " ", obj.description ? _jsx("small", { children: obj.description }) : void 0] });
        }
        const children = cell.parent.tree.children.get(this.ref);
        const cellState = cell.state;
        const expand = _jsx(IconButton, { svg: cellState.isCollapsed ? ArrowRightSvg : ArrowDropDownSvg, flex: '20px', disabled: disabled, onClick: this.toggleExpanded, transparent: true, className: 'msp-no-hover-outline', style: { visibility: children.size > 0 ? 'visible' : 'hidden' } });
        const remove = !cell.state.isLocked ? _jsx(IconButton, { svg: DeleteOutlinedSvg, onClick: this.remove, disabled: disabled, small: true, toggleState: false }) : void 0;
        const visibility = _jsx(IconButton, { svg: cellState.isHidden ? VisibilityOffOutlinedSvg : VisibilityOutlinedSvg, toggleState: false, disabled: disabled, small: true, onClick: this.toggleVisible });
        const marginStyle = {
            marginLeft: `${this.props.depth * 8}px`
        };
        const row = _jsxs("div", { className: `msp-flex-row msp-tree-row${isCurrent ? ' msp-tree-row-current' : ''}`, onMouseEnter: this.highlight, onMouseLeave: this.clearHighlight, style: marginStyle, children: [expand, label, remove, visibility] });
        if (!isCurrent)
            return row;
        if (this.state.action === 'apply' && this.state.currentAction) {
            return _jsxs("div", { style: { marginBottom: '1px' }, children: [row, _jsx(ControlGroup, { header: `Apply ${this.state.currentAction.definition.display.name}`, initialExpanded: true, hideExpander: true, hideOffset: false, onHeaderClick: this.hideApply, topRightIcon: CloseSvg, headerLeftMargin: `${this.props.depth * 8 + 21}px`, children: _jsx(ApplyActionControl, { onApply: this.hideApply, state: this.props.cell.parent, action: this.state.currentAction, nodeRef: this.props.cell.transform.ref, hideHeader: true, noMargin: true }) })] });
        }
        if (this.state.action === 'options') {
            const actions = this.actions;
            const updates = this.updates(`${this.props.depth * 8 + 21}px`);
            return _jsxs("div", { style: { marginBottom: '1px' }, children: [row, updates, actions && _jsx("div", { style: { marginLeft: `${this.props.depth * 8 + 21}px`, marginTop: '-1px' }, children: _jsx(ActionMenu, { items: actions, onSelect: this.selectAction }) })] });
        }
        return row;
    }
}
