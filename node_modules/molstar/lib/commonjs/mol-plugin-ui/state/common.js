"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformControlBase = exports.StateTransformParameters = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const base_1 = require("../base");
const parameters_1 = require("../controls/parameters");
const param_definition_1 = require("../../mol-util/param-definition");
const rxjs_1 = require("rxjs");
const icons_1 = require("../controls/icons");
const common_1 = require("../controls/common");
class StateTransformParameters extends base_1.PurePluginUIComponent {
    constructor() {
        super(...arguments);
        this.onChange = ({ name, value }) => {
            const params = { ...this.props.params, [name]: value };
            this.props.events.onChange(params, this.areInitial(params), this.validate(params));
        };
    }
    validate(params) {
        // TODO
        return void 0;
    }
    areInitial(params) {
        return param_definition_1.ParamDefinition.areEqual(this.props.info.params, params, this.props.info.initialValues);
    }
    render() {
        return (0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: this.props.info.params, values: this.props.params, onChange: this.onChange, onEnter: this.props.events.onEnter, isDisabled: this.props.isDisabled });
    }
}
exports.StateTransformParameters = StateTransformParameters;
(function (StateTransformParameters) {
    function areParamsEmpty(params) {
        const keys = Object.keys(params);
        for (const k of keys) {
            if (!params[k].isHidden)
                return false;
        }
        return true;
    }
    function infoFromAction(plugin, state, action, nodeRef) {
        const source = state.cells.get(nodeRef).obj;
        const params = action.definition.params ? action.definition.params(source, plugin) : {};
        const initialValues = param_definition_1.ParamDefinition.getDefaultValues(params);
        return {
            initialValues,
            params,
            isEmpty: areParamsEmpty(params)
        };
    }
    StateTransformParameters.infoFromAction = infoFromAction;
    function infoFromTransform(plugin, state, transform) {
        const cell = state.cells.get(transform.ref);
        // const source: StateObjectCell | undefined = (cell.sourceRef && state.cells.get(cell.sourceRef)!) || void 0;
        // const create = transform.transformer.definition.params;
        // const params = create ? create((source && source.obj) as any, plugin) : { };
        const params = (cell.params && cell.params.definition) || {};
        const initialValues = (cell.params && cell.params.values) || {};
        return {
            initialValues,
            params,
            isEmpty: areParamsEmpty(params)
        };
    }
    StateTransformParameters.infoFromTransform = infoFromTransform;
})(StateTransformParameters || (exports.StateTransformParameters = StateTransformParameters = {}));
class TransformControlBase extends base_1.PurePluginUIComponent {
    constructor() {
        super(...arguments);
        this.busy = new rxjs_1.BehaviorSubject(false);
        this.onEnter = () => {
            if (this.state.error)
                return;
            this.apply();
        };
        this.autoApplyHandle = void 0;
        this.events = {
            onEnter: this.onEnter,
            onChange: (params, isInitial, errors) => {
                this.clearAutoApply();
                this.setState({ params, isInitial, error: errors && errors[0] }, () => {
                    if (!isInitial && !this.state.error && this.canAutoApply(params)) {
                        this.clearAutoApply();
                        this.autoApplyHandle = setTimeout(this.apply, 50);
                    }
                });
            }
        };
        this.apply = async () => {
            var _a, _b;
            this.clearAutoApply();
            this.setState({ busy: true });
            try {
                await this.applyAction();
            }
            catch (e) {
                console.error(e);
                // eat errors because they should be handled elsewhere
            }
            finally {
                (_b = (_a = this.props).onApply) === null || _b === void 0 ? void 0 : _b.call(_a);
                this.busy.next(false);
            }
        };
        this.refresh = () => {
            this.setState({ params: this.getInfo().initialValues, isInitial: true, error: void 0 });
        };
        this.setDefault = () => {
            const info = this.getInfo();
            const params = param_definition_1.ParamDefinition.getDefaultValues(info.params);
            this.setState({ params, isInitial: param_definition_1.ParamDefinition.areEqual(info.params, params, info.initialValues), error: void 0 });
        };
        this.toggleExpanded = () => {
            this.setState({ isCollapsed: !this.state.isCollapsed });
        };
    }
    clearAutoApply() {
        if (this.autoApplyHandle !== void 0) {
            clearTimeout(this.autoApplyHandle);
            this.autoApplyHandle = void 0;
        }
    }
    componentDidMount() {
        this.subscribe(this.plugin.behaviors.state.isBusy, busy => {
            if (this.busy.value !== busy)
                this.busy.next(busy);
        });
        this.subscribe(this.busy.pipe((0, rxjs_1.skip)(1)), busy => {
            this.setState({ busy });
        });
    }
    renderApply() {
        const canApply = this.canApply();
        if (this.props.autoHideApply && (!canApply || this.canAutoApply(this.state.params)))
            return null;
        return (0, jsx_runtime_1.jsxs)("div", { className: 'msp-transform-apply-wrap', children: [(0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.RefreshSvg, className: 'msp-transform-default-params', onClick: this.setDefault, disabled: this.state.busy, title: 'Set default params' }), (0, jsx_runtime_1.jsx)("div", { className: `msp-transform-apply-wider`, children: (0, jsx_runtime_1.jsx)(common_1.Button, { icon: canApply ? icons_1.CheckSvg : void 0, className: `msp-btn-commit msp-btn-commit-${canApply ? 'on' : 'off'}`, onClick: this.apply, disabled: !canApply, children: this.props.applyLabel || this.applyText() }) })] });
    }
    renderDefault() {
        const info = this.getInfo();
        const isEmpty = info.isEmpty && this.isUpdate();
        const display = this.getHeader();
        const tId = this.getTransformerId();
        const ParamEditor = this.plugin.customParamEditors.has(tId)
            ? this.plugin.customParamEditors.get(tId)
            : StateTransformParameters;
        const wrapClass = this.state.isCollapsed
            ? 'msp-transform-wrapper msp-transform-wrapper-collapsed'
            : 'msp-transform-wrapper';
        let params = null;
        if (!isEmpty && !this.state.isCollapsed) {
            const { a, b, bCell } = this.getSourceAndTarget();
            const applyControl = this.renderApply();
            params = (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(ParamEditor, { info: info, a: a, b: b, bCell: bCell, events: this.events, params: this.state.params, isDisabled: this.state.busy }), applyControl] });
        }
        const ctrl = (0, jsx_runtime_1.jsxs)("div", { className: wrapClass, style: { marginBottom: this.props.noMargin ? 0 : void 0 }, children: [display !== 'none' && !this.props.wrapInExpander && (0, jsx_runtime_1.jsx)("div", { className: 'msp-transform-header', children: (0, jsx_runtime_1.jsxs)(common_1.Button, { onClick: this.toggleExpanded, title: display.description, children: [!isEmpty && (0, jsx_runtime_1.jsx)(icons_1.Icon, { svg: this.state.isCollapsed ? icons_1.ArrowRightSvg : icons_1.ArrowDropDownSvg }), display.name] }) }), params] });
        if (isEmpty || !this.props.wrapInExpander)
            return ctrl;
        return (0, jsx_runtime_1.jsx)(common_1.ExpandGroup, { header: this.isUpdate() ? `Update ${display === 'none' ? '' : display.name}` : `Apply ${display === 'none' ? '' : display.name}`, headerLeftMargin: this.props.expanderHeaderLeftMargin, children: ctrl });
    }
    renderSimple() {
        var _a, _b, _c;
        const info = this.getInfo();
        const canApply = this.canApply();
        const apply = (0, jsx_runtime_1.jsxs)("div", { className: 'msp-flex-row', children: [(0, jsx_runtime_1.jsx)(common_1.Button, { icon: (_a = this.props.simpleApply) === null || _a === void 0 ? void 0 : _a.icon, title: (_b = this.props.simpleApply) === null || _b === void 0 ? void 0 : _b.title, disabled: this.state.busy || !canApply, onClick: this.apply, className: 'msp-btn-apply-simple', children: (_c = this.props.simpleApply) === null || _c === void 0 ? void 0 : _c.header }), !info.isEmpty && (0, jsx_runtime_1.jsx)(common_1.ToggleButton, { icon: icons_1.TuneSvg, label: '', title: 'Options', toggle: this.toggleExpanded, isSelected: !this.state.isCollapsed, disabled: this.state.busy, style: { flex: '0 0 40px', padding: 0 } })] });
        if (this.state.isCollapsed)
            return apply;
        const tId = this.getTransformerId();
        const ParamEditor = this.plugin.customParamEditors.has(tId)
            ? this.plugin.customParamEditors.get(tId)
            : StateTransformParameters;
        const { a, b, bCell } = this.getSourceAndTarget();
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [apply, (0, jsx_runtime_1.jsx)(ParamEditor, { info: info, a: a, b: b, bCell: bCell, events: this.events, params: this.state.params, isDisabled: this.state.busy })] });
    }
    render() {
        // console.log('rendering', ((this.props as any)?.transform?.transformer || (this.props as any)?.action)?.definition.display.name, +new Date)
        return this.props.simpleApply ? this.renderSimple() : this.renderDefault();
    }
}
exports.TransformControlBase = TransformControlBase;
