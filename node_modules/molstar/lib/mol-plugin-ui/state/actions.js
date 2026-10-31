import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PluginUIComponent } from '../base';
import { Icon, CodeSvg } from '../controls/icons';
import { ApplyActionControl } from './apply-action';
export class StateObjectActions extends PluginUIComponent {
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
        return _jsxs("div", { className: 'msp-state-actions', children: [!this.props.hideHeader && _jsxs("div", { className: 'msp-section-header', children: [_jsx(Icon, { svg: CodeSvg }), " ", `Actions (${display})`] }), actions.map((act, i) => _jsx(ApplyActionControl, { state: state, action: act, nodeRef: ref, initiallyCollapsed: i === 0 ? !this.props.alwaysExpandFirst && this.props.initiallyCollapsed : this.props.initiallyCollapsed }, `${act.id}`))] });
    }
}
