/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { PluginCommands } from '../../mol-plugin/commands';
import { memoizeLatest } from '../../mol-util/memoize';
import { StateTransformParameters, TransformControlBase } from './common';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
export { ApplyActionControl };
class ApplyActionControl extends TransformControlBase {
    constructor() {
        super(...arguments);
        this._getInfo = memoizeLatest((t, v, collapsed) => StateTransformParameters.infoFromAction(this.plugin, this.props.state, this.props.action, this.props.nodeRef));
        this.state = { plugin: this.plugin, ref: this.props.nodeRef, version: this.props.state.transforms.get(this.props.nodeRef).version, error: void 0, isInitial: true, params: this.getInfo().initialValues, busy: false, isCollapsed: this.props.initiallyCollapsed };
    }
    applyAction() {
        return PluginCommands.State.ApplyAction(this.plugin, {
            state: this.props.state,
            action: this.props.action.create(this.state.params),
            ref: this.props.nodeRef
        });
    }
    getInfo() { var _a; return this._getInfo(this.props.nodeRef, this.props.state.transforms.get(this.props.nodeRef).version, (_a = this.state) === null || _a === void 0 ? void 0 : _a.isCollapsed); }
    getTransformerId() { return this.props.state.transforms.get(this.props.nodeRef).transformer.id; }
    getHeader() { return this.props.hideHeader ? 'none' : this.props.action.definition.display; }
    canApply() { return !this.state.error && !this.state.busy; }
    canAutoApply() { return false; }
    applyText() { return 'Apply'; }
    isUpdate() { return false; }
    getSourceAndTarget() { return { a: this.props.state.cells.get(this.props.nodeRef).obj }; }
    static getDerivedStateFromProps(props, state) {
        const version = props.state.transforms.get(props.nodeRef).version;
        if (props.nodeRef === state.ref && version === state.version) {
            return null;
        }
        const source = props.state.cells.get(props.nodeRef).obj;
        const params = props.action.definition.params
            ? PD.getDefaultValues(props.action.definition.params(source, state.plugin))
            : {};
        const newState = {
            plugin: state.plugin,
            ref: props.nodeRef,
            version,
            params,
            isInitial: true,
            error: void 0
        };
        return newState;
    }
}
