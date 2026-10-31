"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateObjectActions = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const base_1 = require("../base");
const icons_1 = require("../controls/icons");
const apply_action_1 = require("./apply-action");
class StateObjectActions extends base_1.PluginUIComponent {
    get current() {
        return this.props.state.behaviors.currentObject.value;
    }
    componentDidMount() {
        // TODO: handle tree change: some state actions might become invalid
        // this.subscribe(this.props.state.events.changed, o => {
        //     this.setState(createStateObjectActionSelectState(this.props));
        // });
        this.subscribe(this.plugin.state.events.object.updated, ({ ref, state }) => {
            const current = this.current;
            if (current.ref !== ref || current.state !== state)
                return;
            this.forceUpdate();
        });
        this.subscribe(this.plugin.state.data.actions.events.added, () => this.forceUpdate());
        this.subscribe(this.plugin.state.data.actions.events.removed, () => this.forceUpdate());
    }
    render() {
        const { state, nodeRef: ref } = this.props;
        const cell = state.cells.get(ref);
        const actions = state.actions.fromCell(cell, this.plugin);
        if (actions.length === 0)
            return null;
        const def = cell.transform.transformer.definition;
        const display = cell.obj ? cell.obj.label : (def.display && def.display.name) || def.name;
        return (0, jsx_runtime_1.jsxs)("div", { className: 'msp-state-actions', children: [!this.props.hideHeader && (0, jsx_runtime_1.jsxs)("div", { className: 'msp-section-header', children: [(0, jsx_runtime_1.jsx)(icons_1.Icon, { svg: icons_1.CodeSvg }), " ", `Actions (${display})`] }), actions.map((act, i) => (0, jsx_runtime_1.jsx)(apply_action_1.ApplyActionControl, { state: state, action: act, nodeRef: ref, initiallyCollapsed: i === 0 ? !this.props.alwaysExpandFirst && this.props.initiallyCollapsed : this.props.initiallyCollapsed }, `${act.id}`))] });
    }
}
exports.StateObjectActions = StateObjectActions;
