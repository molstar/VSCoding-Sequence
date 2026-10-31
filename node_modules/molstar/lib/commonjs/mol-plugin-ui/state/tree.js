"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateTree = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const operators_1 = require("rxjs/operators");
const commands_1 = require("../../mol-plugin/commands");
const mol_state_1 = require("../../mol-state");
const spine_1 = require("../../mol-state/tree/spine");
const base_1 = require("../base");
const action_menu_1 = require("../controls/action-menu");
const common_1 = require("../controls/common");
const icons_1 = require("../controls/icons");
const apply_action_1 = require("./apply-action");
const update_transform_1 = require("./update-transform");
class StateTree extends base_1.PluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = { showActions: true };
    }
    componentDidMount() {
        this.subscribe(this.plugin.state.events.cell.created, e => {
            if (e.cell.transform.parent === mol_state_1.StateTransform.RootRef)
                this.forceUpdate();
        });
        this.subscribe(this.plugin.state.events.cell.removed, e => {
            if (e.parent === mol_state_1.StateTransform.RootRef)
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
            return (0, jsx_runtime_1.jsxs)("div", { style: { margin: '10px', cursor: 'default' }, children: [(0, jsx_runtime_1.jsx)("p", { children: "Nothing to see here yet." }), (0, jsx_runtime_1.jsxs)("p", { children: ["Structures and Volumes can be loaded from the ", (0, jsx_runtime_1.jsx)(icons_1.Icon, { svg: icons_1.HomeOutlinedSvg }), " tab."] })] });
        }
        return (0, jsx_runtime_1.jsx)(StateTreeNode, { cell: this.props.state.cells.get(ref), depth: 0 });
    }
}
exports.StateTree = StateTree;
class StateTreeNode extends base_1.PluginUIComponent {
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
        return !cell || !cell.parent || cell.obj === mol_state_1.StateObject.Null || !cell.parent.tree.transforms.has(cell.transform.ref);
    }
    static showLabel(cell) {
        return (cell.transform.ref !== mol_state_1.StateTransform.RootRef) && (cell.status !== 'ok' || (!cell.state.isGhost && !StateTreeNode.hasDecorator(cell)));
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
            return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: children.map(c => (0, jsx_runtime_1.jsx)(StateTreeNode, { cell: cell.parent.cells.get(c), depth: this.props.depth }, c)) });
        }
        const newDepth = this.props.depth + 1;
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(StateTreeNodeLabel, { cell: cell, depth: this.props.depth }), children.size === 0
                    ? void 0
                    : (0, jsx_runtime_1.jsx)("div", { style: { display: this.state.isCollapsed ? 'none' : 'block' }, children: children.map(c => (0, jsx_runtime_1.jsx)(StateTreeNode, { cell: cell.parent.cells.get(c), depth: newDepth }, c)) })] });
    }
}
class StateTreeNodeLabel extends base_1.PluginUIComponent {
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
            commands_1.PluginCommands.State.SetCurrentObject(this.plugin, { state: this.props.cell.parent, ref: this.ref });
        };
        this.setCurrentRoot = (e) => {
            e === null || e === void 0 ? void 0 : e.preventDefault();
            e === null || e === void 0 ? void 0 : e.currentTarget.blur();
            commands_1.PluginCommands.State.SetCurrentObject(this.plugin, { state: this.props.cell.parent, ref: mol_state_1.StateTransform.RootRef });
        };
        this.remove = (e) => {
            e === null || e === void 0 ? void 0 : e.preventDefault();
            commands_1.PluginCommands.State.RemoveObject(this.plugin, { state: this.props.cell.parent, ref: this.ref, removeParentGhosts: true });
        };
        this.toggleVisible = (e) => {
            e.preventDefault();
            commands_1.PluginCommands.State.ToggleVisibility(this.plugin, { state: this.props.cell.parent, ref: this.ref });
            e.currentTarget.blur();
        };
        this.toggleExpanded = (e) => {
            e.preventDefault();
            commands_1.PluginCommands.State.ToggleExpanded(this.plugin, { state: this.props.cell.parent, ref: this.ref });
            e.currentTarget.blur();
        };
        this.highlight = (e) => {
            e.preventDefault();
            commands_1.PluginCommands.Interactivity.Object.Highlight(this.plugin, { state: this.props.cell.parent, ref: this.ref });
            e.currentTarget.blur();
        };
        this.clearHighlight = (e) => {
            e.preventDefault();
            commands_1.PluginCommands.Interactivity.ClearHighlights(this.plugin);
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
        this.subscribe(this.plugin.state.events.cell.stateUpdated.pipe((0, operators_1.filter)(e => this.is(e)), (0, operators_1.debounceTime)(33)), e => {
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
            action_menu_1.ActionMenu.Header('Apply Action'),
            ...actions.map(a => action_menu_1.ActionMenu.Item(a.definition.display.name, () => this.setState({ action: 'apply', currentAction: a })))
        ];
    }
    updates(margin) {
        const cell = this.props.cell;
        const decoratorChain = spine_1.StateTreeSpine.getDecoratorChain(cell.parent, cell.transform.ref);
        const decorators = [];
        for (let i = decoratorChain.length - 1; i >= 0; i--) {
            const d = decoratorChain[i];
            decorators.push((0, jsx_runtime_1.jsx)(update_transform_1.UpdateTransformControl, { state: cell.parent, transform: d.transform, noMargin: true, wrapInExpander: true, expanderHeaderLeftMargin: margin }, `${d.transform.transformer.id}-${i}`));
        }
        return (0, jsx_runtime_1.jsx)("div", { className: 'msp-tree-updates-wrapper', children: decorators });
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
            label = (0, jsx_runtime_1.jsxs)(common_1.Button, { className: 'msp-btn-tree-label msp-no-hover-outline', noOverflow: true, title: name, onClick: this.state.isCurrent ? this.setCurrentRoot : this.setCurrent, disabled: disabled, children: [cell.status === 'error' && (0, jsx_runtime_1.jsxs)("b", { children: ["[", cell.status, "]"] }), " ", (0, jsx_runtime_1.jsx)("span", { children: name })] });
        }
        else {
            const obj = cell.obj;
            const title = `${obj.label} ${obj.description ? obj.description : ''}`;
            label = (0, jsx_runtime_1.jsxs)(common_1.Button, { className: `msp-btn-tree-label msp-type-class-${obj.type.typeClass}`, noOverflow: true, disabled: disabled, title: title, onClick: this.state.isCurrent ? this.setCurrentRoot : this.setCurrent, children: [(0, jsx_runtime_1.jsx)("span", { children: obj.label }), " ", obj.description ? (0, jsx_runtime_1.jsx)("small", { children: obj.description }) : void 0] });
        }
        const children = cell.parent.tree.children.get(this.ref);
        const cellState = cell.state;
        const expand = (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: cellState.isCollapsed ? icons_1.ArrowRightSvg : icons_1.ArrowDropDownSvg, flex: '20px', disabled: disabled, onClick: this.toggleExpanded, transparent: true, className: 'msp-no-hover-outline', style: { visibility: children.size > 0 ? 'visible' : 'hidden' } });
        const remove = !cell.state.isLocked ? (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.DeleteOutlinedSvg, onClick: this.remove, disabled: disabled, small: true, toggleState: false }) : void 0;
        const visibility = (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: cellState.isHidden ? icons_1.VisibilityOffOutlinedSvg : icons_1.VisibilityOutlinedSvg, toggleState: false, disabled: disabled, small: true, onClick: this.toggleVisible });
        const marginStyle = {
            marginLeft: `${this.props.depth * 8}px`
        };
        const row = (0, jsx_runtime_1.jsxs)("div", { className: `msp-flex-row msp-tree-row${isCurrent ? ' msp-tree-row-current' : ''}`, onMouseEnter: this.highlight, onMouseLeave: this.clearHighlight, style: marginStyle, children: [expand, label, remove, visibility] });
        if (!isCurrent)
            return row;
        if (this.state.action === 'apply' && this.state.currentAction) {
            return (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '1px' }, children: [row, (0, jsx_runtime_1.jsx)(common_1.ControlGroup, { header: `Apply ${this.state.currentAction.definition.display.name}`, initialExpanded: true, hideExpander: true, hideOffset: false, onHeaderClick: this.hideApply, topRightIcon: icons_1.CloseSvg, headerLeftMargin: `${this.props.depth * 8 + 21}px`, children: (0, jsx_runtime_1.jsx)(apply_action_1.ApplyActionControl, { onApply: this.hideApply, state: this.props.cell.parent, action: this.state.currentAction, nodeRef: this.props.cell.transform.ref, hideHeader: true, noMargin: true }) })] });
        }
        if (this.state.action === 'options') {
            const actions = this.actions;
            const updates = this.updates(`${this.props.depth * 8 + 21}px`);
            return (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '1px' }, children: [row, updates, actions && (0, jsx_runtime_1.jsx)("div", { style: { marginLeft: `${this.props.depth * 8 + 21}px`, marginTop: '-1px' }, children: (0, jsx_runtime_1.jsx)(action_menu_1.ActionMenu, { items: actions, onSelect: this.selectAction }) })] });
        }
        return row;
    }
}
