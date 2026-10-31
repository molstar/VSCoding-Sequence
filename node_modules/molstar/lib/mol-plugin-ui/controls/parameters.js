import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import * as React from 'react';
import { Mat4, Vec3 } from '../../mol-math/linear-algebra';
import { Script } from '../../mol-script/script';
import { Asset } from '../../mol-util/assets';
import { Color } from '../../mol-util/color';
import { ColorListOptions, ColorListOptionsScale, ColorListOptionsSet, getColorListFromName } from '../../mol-util/color/lists';
import { memoize1, memoizeLatest } from '../../mol-util/memoize';
import { getPrecision } from '../../mol-util/number';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { camelCaseToWords } from '../../mol-util/string';
import { PluginReactContext, PluginUIComponent } from '../base';
import { ActionMenu } from './action-menu';
import { ColorOptions, ColorValueOption, CombinedColorControl } from './color';
import { Button, ControlGroup, ControlRow, ExpandGroup, IconButton, TextInput, ToggleButton } from './common';
import { ArrowDownwardSvg, ArrowDropDownSvg, ArrowRightSvg, ArrowUpwardSvg, BookmarksOutlinedSvg, CheckSvg, ClearSvg, DeleteOutlinedSvg, HelpOutlineSvg, Icon, MoreHorizSvg, WarningSvg } from './icons';
import { legendFor } from './legend';
import { LineGraphComponent } from './line-graph/line-graph-component';
import { Slider, Slider2 } from './slider';
export class ParameterControls extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onChange = (params) => {
            var _a, _b;
            (_b = (_a = this.props).onChange) === null || _b === void 0 ? void 0 : _b.call(_a, params, this.props.values);
            if (this.props.onChangeValues) {
                const values = { ...this.props.values, [params.name]: params.value };
                this.props.onChangeValues(values, this.props.values);
            }
        };
        this.paramGroups = memoizeLatest((params) => classifyParams(params));
    }
    renderGroup(group) {
        var _a;
        if (group.length === 0)
            return null;
        const values = this.props.values;
        let ctrls = null;
        let category = void 0;
        for (const [key, p, Control] of group) {
            if ((_a = p.hideIf) === null || _a === void 0 ? void 0 : _a.call(p, values))
                continue;
            if (!ctrls)
                ctrls = [];
            category = p.category;
            ctrls.push(_jsx(Control, { param: p, onChange: this.onChange, onEnter: this.props.onEnter, isDisabled: this.props.isDisabled, name: key, value: values[key] }, key));
        }
        if (!ctrls)
            return null;
        if (category) {
            return [_jsx(ExpandGroup, { header: category, children: ctrls }, category)];
        }
        return ctrls;
    }
    renderPart(groups) {
        let parts = null;
        for (const g of groups) {
            const ctrls = this.renderGroup(g);
            if (!ctrls)
                continue;
            if (!parts)
                parts = [];
            for (const c of ctrls)
                parts.push(c);
        }
        return parts;
    }
    render() {
        const groups = this.paramGroups(this.props.params);
        const essentials = this.renderPart(groups.essentials);
        const advanced = this.renderPart(groups.advanced);
        if (essentials && advanced) {
            return _jsxs(_Fragment, { children: [essentials, _jsx(ExpandGroup, { header: 'Advanced Options', children: advanced })] });
        }
        else if (essentials) {
            return essentials;
        }
        else {
            return advanced;
        }
    }
}
export class ParameterMappingControl extends PluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = {
            isDisabled: false,
        };
        this.setSettings = (p, old) => {
            const values = { ...old, [p.name]: p.value };
            const t = this.props.mapping.update(values, this.plugin);
            this.props.mapping.apply(t, this.plugin);
        };
    }
    componentDidMount() {
        this.subscribe(this.plugin.state.data.behaviors.isUpdating, v => {
            this.setState({ isDisabled: v });
        });
    }
    render() {
        const t = this.props.mapping.getTarget(this.plugin);
        const values = this.props.mapping.getValues(t, this.plugin);
        const params = this.props.mapping.params(this.plugin);
        return _jsx(ParameterControls, { params: params, values: values, onChange: this.setSettings, isDisabled: this.state.isDisabled });
    }
}
function classifyParams(params) {
    function addParam(k, p, group) {
        const ctrl = controlFor(p);
        if (!ctrl)
            return;
        if (!p.category)
            group.params[0].push([k, p, ctrl]);
        else {
            if (!group.map)
                group.map = new Map();
            let c = group.map.get(p.category);
            if (!c) {
                c = [];
                group.map.set(p.category, c);
                group.params.push(c);
            }
            c.push([k, p, ctrl]);
        }
    }
    function sortGroups(x, y) {
        const a = x[0], b = y[0];
        if (!a || !a[1].category)
            return -1;
        if (!b || !b[1].category)
            return 1;
        return a[1].category < b[1].category ? -1 : 1;
    }
    const keys = Object.keys(params);
    const essentials = { params: [[]], map: void 0 };
    const advanced = { params: [[]], map: void 0 };
    for (const k of keys) {
        const p = params[k];
        if (p.isHidden)
            continue;
        if (p.isEssential)
            addParam(k, p, essentials);
        else
            addParam(k, p, advanced);
    }
    essentials.params.sort(sortGroups);
    advanced.params.sort(sortGroups);
    return { essentials: essentials.params, advanced: advanced.params };
}
function controlFor(param) {
    switch (param.type) {
        case 'value': return void 0;
        case 'boolean': return BoolControl;
        case 'number': return typeof param.min !== 'undefined' && typeof param.max !== 'undefined'
            ? NumberRangeControl : NumberInputControl;
        case 'converted': return ConvertedControl;
        case 'conditioned': return ConditionedControl;
        case 'multi-select': return MultiSelectControl;
        case 'color': return CombinedColorControl;
        case 'color-list': return param.offsets ? OffsetColorListControl : ColorListControl;
        case 'vec3': return Vec3Control;
        case 'mat4': return Mat4Control;
        case 'url': return UrlControl;
        case 'file': return FileControl;
        case 'file-list': return FileListControl;
        case 'select': return SelectControl;
        case 'value-ref': return ValueRefControl;
        case 'data-ref': return void 0;
        case 'text': return TextControl;
        case 'interval': return typeof param.min !== 'undefined' && typeof param.max !== 'undefined'
            ? BoundedIntervalControl : IntervalControl;
        case 'group': return GroupControl;
        case 'mapped': return MappedControl;
        case 'line-graph': return LineGraphControl;
        case 'script': return ScriptControl;
        case 'object-list': return ObjectListControl;
        default:
            const _ = param;
            console.warn(`${_} has no associated UI component`);
            return void 0;
    }
}
export class ParamHelp extends React.PureComponent {
    render() {
        const { legend, description } = this.props;
        const Legend = legend && legendFor(legend);
        return _jsx("div", { className: 'msp-help-text', children: _jsxs("div", { children: [_jsxs("div", { className: 'msp-help-description', children: [_jsx(Icon, { svg: HelpOutlineSvg, inline: true }), description] }), Legend && _jsx("div", { className: 'msp-help-legend', children: _jsx(Legend, { legend: legend }) })] }) });
    }
}
function renderSimple(options) {
    const { props, state, control, toggleHelp, addOn } = options;
    const _className = [];
    if (props.param.shortLabel)
        _className.push('msp-control-label-short');
    if (props.param.twoColumns)
        _className.push('msp-control-col-2');
    if (props.param.multiline)
        _className.push('msp-control-twoline');
    const className = _className.join(' ');
    const label = props.param.label || camelCaseToWords(props.name);
    const help = props.param.help
        ? props.param.help(props.value)
        : { description: props.param.description, legend: props.param.legend };
    const hasHelp = help.description || help.legend;
    const desc = label + (hasHelp ? '. Click for help.' : '');
    return _jsxs(_Fragment, { children: [_jsx(ControlRow, { className: className, title: desc, label: _jsxs(_Fragment, { children: [label, hasHelp && _jsx(ToggleParamHelpButton, { show: state.showHelp, toggle: toggleHelp, title: desc })] }), control: control }), hasHelp && state.showHelp && _jsx("div", { className: 'msp-control-offset', children: _jsx(ParamHelp, { legend: help.legend, description: help.description }) }), addOn] });
}
export function ToggleParamHelpButton({ show, toggle, title }) {
    return _jsx("button", { className: 'msp-help msp-btn-link msp-btn-icon msp-control-group-expander', onClick: toggle, title: title || `${show ? 'Hide' : 'Show'} help`, style: { background: 'transparent', textAlign: 'left', padding: '0' }, children: _jsx(Icon, { svg: HelpOutlineSvg }) });
}
export class SimpleParam extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = { showHelp: false };
        this.toggleHelp = () => this.setState({ showHelp: !this.state.showHelp });
    }
    update(value) {
        this.props.onChange({ param: this.props.param, name: this.props.name, value });
    }
    renderAddOn() { return null; }
    render() {
        return renderSimple({
            props: this.props,
            state: this.state,
            control: this.renderControl(),
            toggleHelp: this.toggleHelp,
            addOn: this.renderAddOn()
        });
    }
}
export class BoolControl extends SimpleParam {
    constructor() {
        super(...arguments);
        this.onClick = (e) => { this.update(!this.props.value); e.currentTarget.blur(); };
    }
    renderControl() {
        return _jsxs("button", { onClick: this.onClick, disabled: this.props.isDisabled, children: [_jsx(Icon, { svg: this.props.value ? CheckSvg : ClearSvg }), this.props.value ? 'On' : 'Off'] });
    }
}
export class LineGraphControl extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            isExpanded: false,
            isOverPoint: false,
            message: `${this.props.param.defaultValue.length} points`,
        };
        this.onHover = (point) => {
            this.setState({ isOverPoint: !this.state.isOverPoint });
            if (point) {
                this.setState({ message: this.pointToLabel(point) });
            }
            else {
                this.setState({ message: `${this.props.value.length} points` });
            }
        };
        this.onDrag = (point) => {
            this.setState({ message: this.pointToLabel(point) });
        };
        this.onChange = (value) => {
            this.props.onChange({ name: this.props.name, param: this.props.param, value: value });
        };
        this.toggleExpanded = (e) => {
            this.setState({ isExpanded: !this.state.isExpanded });
            e.currentTarget.blur();
        };
    }
    pointToLabel(point) {
        var _a, _b;
        if (!point)
            return '';
        const volume = (_b = (_a = this.props.param).getVolume) === null || _b === void 0 ? void 0 : _b.call(_a);
        if (volume) {
            const { min, max, mean, sigma } = volume.grid.stats;
            const v = min + (max - min) * point[0];
            const s = (v - mean) / sigma;
            return `(${v.toFixed(2)} | ${s.toFixed(2)}σ, ${point[1].toFixed(2)})`;
        }
        else {
            return `(${point[0].toFixed(2)}, ${point[1].toFixed(2)})`;
        }
    }
    render() {
        var _a, _b;
        const label = this.props.param.label || camelCaseToWords(this.props.name);
        return _jsxs(_Fragment, { children: [_jsx(ControlRow, { label: label, control: _jsx("button", { onClick: this.toggleExpanded, disabled: this.props.isDisabled, children: `${this.state.message}` }) }), _jsx("div", { className: 'msp-control-offset', style: { display: this.state.isExpanded ? 'block' : 'none', marginTop: 1 }, children: _jsx(LineGraphComponent, { data: this.props.value, volume: (_b = (_a = this.props.param).getVolume) === null || _b === void 0 ? void 0 : _b.call(_a), onChange: this.onChange, onHover: this.onHover, onDrag: this.onDrag }) })] });
    }
}
export class NumberInputControl extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = { value: '0' };
        this.update = (value) => {
            const p = getPrecision(this.props.param.step || 0.01);
            value = parseFloat(value.toFixed(p));
            this.props.onChange({ param: this.props.param, name: this.props.name, value });
        };
    }
    render() {
        const placeholder = this.props.param.label || camelCaseToWords(this.props.name);
        const label = this.props.param.label || camelCaseToWords(this.props.name);
        const p = getPrecision(this.props.param.step || 0.01);
        return _jsx(ControlRow, { title: this.props.param.description, label: label, control: _jsx(TextInput, { numeric: true, value: parseFloat(this.props.value.toFixed(p)), onEnter: this.props.onEnter, placeholder: placeholder, isDisabled: this.props.isDisabled, onChange: this.update }) });
    }
}
export class NumberRangeControl extends SimpleParam {
    constructor() {
        super(...arguments);
        this.onChange = (v) => { this.update(v); };
    }
    renderControl() {
        const value = typeof this.props.value === 'undefined' ? this.props.param.defaultValue : this.props.value;
        return _jsx(Slider, { value: value, min: this.props.param.min, max: this.props.param.max, step: this.props.param.step, onChange: this.onChange, onChangeImmediate: this.props.param.immediateUpdate ? this.onChange : void 0, disabled: this.props.isDisabled, onEnter: this.props.onEnter });
    }
}
export class TextControl extends SimpleParam {
    constructor() {
        super(...arguments);
        this.updateValue = (value) => {
            if (value !== this.props.value) {
                this.update(value);
            }
        };
    }
    renderControl() {
        const placeholder = this.props.param.placeholder || this.props.param.label || camelCaseToWords(this.props.name);
        return _jsx(TextCtrl, { props: this.props, placeholder: placeholder, update: this.updateValue });
    }
}
function TextCtrl({ props, placeholder, update }) {
    const [value, setValue] = React.useState(props.value);
    React.useEffect(() => setValue(props.value), [props.value]);
    if (props.param.multiline) {
        return _jsx("div", { className: 'msp-control-text-area-wrapper', children: _jsx("textarea", { value: props.param.disableInteractiveUpdates ? (value || '') : props.value, placeholder: placeholder, onChange: e => {
                    if (props.param.disableInteractiveUpdates)
                        setValue(e.target.value);
                    else
                        update(e.target.value);
                }, onBlur: e => {
                    if (props.param.disableInteractiveUpdates)
                        update(e.target.value);
                }, onKeyDown: e => {
                    if (e.key === 'Enter' && (e.shiftKey || e.ctrlKey || e.metaKey)) {
                        e.currentTarget.blur();
                    }
                }, disabled: props.isDisabled }) });
    }
    return _jsx("input", { type: 'text', value: props.param.disableInteractiveUpdates ? (value || '') : props.value, placeholder: placeholder, onChange: e => {
            if (props.param.disableInteractiveUpdates)
                setValue(e.target.value);
            else
                update(e.target.value);
        }, onBlur: e => {
            if (props.param.disableInteractiveUpdates)
                update(e.target.value);
        }, disabled: props.isDisabled, onKeyDown: e => {
            if (e.key !== 'Enter')
                return;
            if (props.onEnter) {
                e.stopPropagation();
                props.onEnter();
            }
            else if (e.key === 'Enter' && (e.shiftKey || e.ctrlKey || e.metaKey)) {
                e.currentTarget.blur();
            }
            else if (props.param.disableInteractiveUpdates) {
                update(value);
            }
        } });
}
export class PureSelectControl extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onChange = (e) => {
            if (typeof this.props.param.defaultValue === 'number') {
                this.update(parseInt(e.target.value, 10));
            }
            else {
                this.update(e.target.value);
            }
        };
    }
    update(value) {
        this.props.onChange({ param: this.props.param, name: this.props.name, value });
    }
    render() {
        const isInvalid = this.props.value !== void 0 && !this.props.param.options.some(e => e[0] === this.props.value);
        return _jsxs("select", { className: 'msp-form-control', title: this.props.title, value: this.props.value !== void 0 ? this.props.value : this.props.param.defaultValue, onChange: this.onChange, disabled: this.props.isDisabled, children: [isInvalid && _jsx("option", { value: this.props.value, children: `[Invalid] ${this.props.value}` }, this.props.value), this.props.param.options.map(([value, label]) => _jsx("option", { value: value, children: label }, value))] });
    }
}
export class SelectControl extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = { showHelp: false, showOptions: false };
        this.onSelect = item => {
            if (!item || item.value === this.props.value) {
                this.setState({ showOptions: false });
            }
            else {
                this.setState({ showOptions: false }, () => {
                    this.props.onChange({ param: this.props.param, name: this.props.name, value: item.value });
                });
            }
        };
        this.toggle = () => this.setState({ showOptions: !this.state.showOptions });
        this.cycle = () => {
            const { options } = this.props.param;
            const current = options.findIndex(o => o[0] === this.props.value);
            const next = current === options.length - 1 ? 0 : current + 1;
            this.props.onChange({ param: this.props.param, name: this.props.name, value: options[next][0] });
        };
        this.items = memoizeLatest((param) => ActionMenu.createItemsFromSelectOptions(param.options));
        this.toggleHelp = () => this.setState({ showHelp: !this.state.showHelp });
    }
    renderControl() {
        var _a;
        const items = this.items(this.props.param);
        const current = this.props.value !== undefined ? ActionMenu.findItem(items, this.props.value) : void 0;
        const label = current
            ? current.label
            : typeof this.props.value === 'undefined'
                ? `${((_a = ActionMenu.getFirstItem(items)) === null || _a === void 0 ? void 0 : _a.label) || ''} [Default]`
                : `[Invalid] ${this.props.value}`;
        const toggle = this.props.param.cycle ? this.cycle : this.toggle;
        const textAlign = this.props.param.cycle ? 'center' : 'left';
        const icon = this.props.param.cycle
            ? (this.props.value === 'on' ? CheckSvg
                : this.props.value === 'off' ? ClearSvg : void 0)
            : void 0;
        return _jsx(ToggleButton, { disabled: this.props.isDisabled, style: { textAlign, overflow: 'hidden', textOverflow: 'ellipsis' }, label: label, title: label, icon: icon, toggle: toggle, isSelected: this.state.showOptions });
    }
    renderAddOn() {
        if (!this.state.showOptions)
            return null;
        const items = this.items(this.props.param);
        const current = ActionMenu.findItem(items, this.props.value);
        return _jsx(ActionMenu, { items: items, current: current, onSelect: this.onSelect });
    }
    render() {
        return renderSimple({
            props: this.props,
            state: this.state,
            control: this.renderControl(),
            toggleHelp: this.toggleHelp,
            addOn: this.renderAddOn()
        });
    }
}
export class ValueRefControl extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = { showHelp: false, showOptions: false };
        this.onSelect = item => {
            if (!item || item.value === this.props.value) {
                this.setState({ showOptions: false });
            }
            else {
                this.setState({ showOptions: false }, () => {
                    this.props.onChange({ param: this.props.param, name: this.props.name, value: { ref: item.value } });
                });
            }
        };
        this.toggle = () => this.setState({ showOptions: !this.state.showOptions });
        this.toggleHelp = () => this.setState({ showHelp: !this.state.showHelp });
    }
    get items() {
        return ActionMenu.createItemsFromSelectOptions(this.props.param.getOptions(this.context));
    }
    renderControl() {
        var _a;
        const items = this.items;
        const current = this.props.value.ref ? ActionMenu.findItem(items, this.props.value.ref) : void 0;
        const label = current
            ? current.label
            : `[Ref] ${(_a = this.props.value.ref) !== null && _a !== void 0 ? _a : ''}`;
        return _jsx(ToggleButton, { disabled: this.props.isDisabled, style: { textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' }, label: label, title: label, toggle: this.toggle, isSelected: this.state.showOptions });
    }
    renderAddOn() {
        if (!this.state.showOptions)
            return null;
        const items = this.items;
        const current = ActionMenu.findItem(items, this.props.value.ref);
        return _jsx(ActionMenu, { items: items, current: current, onSelect: this.onSelect });
    }
    render() {
        return renderSimple({
            props: this.props,
            state: this.state,
            control: this.renderControl(),
            toggleHelp: this.toggleHelp,
            addOn: this.renderAddOn()
        });
    }
}
ValueRefControl.contextType = PluginReactContext;
export class IntervalControl extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = { isExpanded: false };
        this.components = {
            0: PD.Numeric(0, { step: this.props.param.step }, { label: 'Min' }),
            1: PD.Numeric(0, { step: this.props.param.step }, { label: 'Max' })
        };
        this.componentChange = ({ name, value }) => {
            const v = [...this.props.value];
            v[+name] = value;
            this.change(v);
        };
        this.toggleExpanded = (e) => {
            this.setState({ isExpanded: !this.state.isExpanded });
            e.currentTarget.blur();
        };
    }
    change(value) {
        this.props.onChange({ name: this.props.name, param: this.props.param, value });
    }
    render() {
        const v = this.props.value;
        const label = this.props.param.label || camelCaseToWords(this.props.name);
        const p = getPrecision(this.props.param.step || 0.01);
        const value = `[${v[0].toFixed(p)}, ${v[1].toFixed(p)}]`;
        return _jsxs(_Fragment, { children: [_jsx(ControlRow, { label: label, control: _jsx("button", { onClick: this.toggleExpanded, disabled: this.props.isDisabled, children: value }) }), this.state.isExpanded && _jsx("div", { className: 'msp-control-offset', children: _jsx(ParameterControls, { params: this.components, values: v, onChange: this.componentChange, onEnter: this.props.onEnter }) })] });
    }
}
export class BoundedIntervalControl extends SimpleParam {
    constructor() {
        super(...arguments);
        this.onChange = (v) => { this.update(v); };
    }
    renderControl() {
        return _jsx(Slider2, { value: this.props.value, min: this.props.param.min, max: this.props.param.max, step: this.props.param.step, onChange: this.onChange, disabled: this.props.isDisabled, onEnter: this.props.onEnter });
    }
}
export class ColorControl extends SimpleParam {
    constructor() {
        super(...arguments);
        this.onChange = (e) => {
            this.update(Color(parseInt(e.target.value)));
        };
    }
    stripStyle() {
        return {
            background: Color.toStyle(this.props.value),
            position: 'absolute',
            bottom: '0',
            height: '4px',
            right: '0',
            left: '0'
        };
    }
    renderControl() {
        return _jsxs("div", { style: { position: 'relative' }, children: [_jsxs("select", { value: this.props.value, onChange: this.onChange, children: [ColorValueOption(this.props.value), ColorOptions()] }), _jsx("div", { style: this.stripStyle() })] });
    }
}
function colorEntryToStyle(e, includeOffset = false) {
    if (Array.isArray(e)) {
        if (includeOffset)
            return `${Color.toStyle(e[0])} ${(100 * e[1]).toFixed(2)}%`;
        return Color.toStyle(e[0]);
    }
    return Color.toStyle(e);
}
const colorGradientInterpolated = memoize1((colors) => {
    const styles = colors.map(c => colorEntryToStyle(c, true));
    return `linear-gradient(to right, ${styles.join(', ')})`;
});
const colorGradientBanded = memoize1((colors) => {
    const n = colors.length;
    const styles = [`${colorEntryToStyle(colors[0])} ${100 * (1 / n)}%`];
    // TODO: does this need to support offsets?
    for (let i = 1, il = n - 1; i < il; ++i) {
        styles.push(`${colorEntryToStyle(colors[i])} ${100 * (i / n)}%`, `${colorEntryToStyle(colors[i])} ${100 * ((i + 1) / n)}%`);
    }
    styles.push(`${colorEntryToStyle(colors[n - 1])} ${100 * ((n - 1) / n)}%`);
    return `linear-gradient(to right, ${styles.join(', ')})`;
});
function colorStripStyle(list, right = '0') {
    return {
        background: colorGradient(list.colors, list.kind === 'set'),
        position: 'absolute',
        bottom: '0',
        height: '4px',
        right,
        left: '0'
    };
}
function colorGradient(colors, banded) {
    return banded ? colorGradientBanded(colors) : colorGradientInterpolated(colors);
}
function createColorListHelpers() {
    const addOn = (l) => {
        const preset = getColorListFromName(l[0]);
        return _jsx("div", { style: colorStripStyle({ kind: preset.type !== 'qualitative' ? 'interpolate' : 'set', colors: preset.list }) });
    };
    return {
        ColorPresets: {
            all: ActionMenu.createItemsFromSelectOptions(ColorListOptions, { addOn }),
            scale: ActionMenu.createItemsFromSelectOptions(ColorListOptionsScale, { addOn }),
            set: ActionMenu.createItemsFromSelectOptions(ColorListOptionsSet, { addOn })
        },
        ColorsParam: PD.ObjectList({ color: PD.Color(0x0) }, ({ color }) => Color.toHexString(color).toUpperCase()),
        OffsetColorsParam: PD.ObjectList({ color: PD.Color(0x0), offset: PD.Numeric(0, { min: 0, max: 1, step: 0.01 }) }, ({ color, offset }) => `${Color.toHexString(color).toUpperCase()} [${offset.toFixed(2)}]`),
        IsInterpolatedParam: PD.Boolean(false, { label: 'Interpolated' })
    };
}
let _colorListHelpers;
function ColorListHelpers() {
    if (_colorListHelpers)
        return _colorListHelpers;
    _colorListHelpers = createColorListHelpers();
    return _colorListHelpers;
}
export class ColorListControl extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = { showHelp: false, show: void 0 };
        this.toggleEdit = () => this.setState({ show: this.state.show === 'edit' ? void 0 : 'edit' });
        this.togglePresets = () => this.setState({ show: this.state.show === 'presets' ? void 0 : 'presets' });
        this.selectPreset = item => {
            if (!item)
                return;
            this.setState({ show: void 0 });
            const preset = getColorListFromName(item.value);
            this.update({ kind: preset.type !== 'qualitative' ? 'interpolate' : 'set', colors: preset.list });
        };
        this.colorsChanged = ({ value }) => {
            this.update({
                kind: this.props.value.kind,
                colors: value.map(c => c.color)
            });
        };
        this.isInterpolatedChanged = ({ value }) => {
            this.update({ kind: value ? 'interpolate' : 'set', colors: this.props.value.colors });
        };
        this.toggleHelp = () => this.setState({ showHelp: !this.state.showHelp });
    }
    update(value) {
        this.props.onChange({ param: this.props.param, name: this.props.name, value });
    }
    renderControl() {
        const { value } = this.props;
        // TODO: fix the button right offset
        return _jsxs(_Fragment, { children: [_jsxs("button", { onClick: this.toggleEdit, style: { position: 'relative', paddingRight: '33px' }, children: [value.colors.length === 1 ? '1 color' : `${value.colors.length} colors`, _jsx("div", { style: colorStripStyle(value, '33px') })] }), _jsx(IconButton, { svg: BookmarksOutlinedSvg, onClick: this.togglePresets, toggleState: this.state.show === 'presets', title: 'Color Presets', style: { padding: 0, position: 'absolute', right: 0, top: 0, width: '32px' } })] });
    }
    renderColors() {
        if (!this.state.show)
            return null;
        const { ColorPresets, ColorsParam, IsInterpolatedParam } = ColorListHelpers();
        const preset = ColorPresets[this.props.param.presetKind];
        if (this.state.show === 'presets')
            return _jsx(ActionMenu, { items: preset, onSelect: this.selectPreset });
        const values = this.props.value.colors.map(color => ({ color }));
        return _jsxs("div", { className: 'msp-control-offset', children: [_jsx(ObjectListControl, { name: 'colors', param: ColorsParam, value: values, onChange: this.colorsChanged, isDisabled: this.props.isDisabled, onEnter: this.props.onEnter }), _jsx(BoolControl, { name: 'isInterpolated', param: IsInterpolatedParam, value: this.props.value.kind === 'interpolate', onChange: this.isInterpolatedChanged, isDisabled: this.props.isDisabled, onEnter: this.props.onEnter })] });
    }
    render() {
        return renderSimple({
            props: this.props,
            state: this.state,
            control: this.renderControl(),
            toggleHelp: this.toggleHelp,
            addOn: this.renderColors()
        });
    }
}
export class OffsetColorListControl extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = { showHelp: false, show: void 0 };
        this.toggleEdit = () => this.setState({ show: this.state.show === 'edit' ? void 0 : 'edit' });
        this.togglePresets = () => this.setState({ show: this.state.show === 'presets' ? void 0 : 'presets' });
        this.selectPreset = item => {
            if (!item)
                return;
            this.setState({ show: void 0 });
            const preset = getColorListFromName(item.value);
            this.update({ kind: preset.type !== 'qualitative' ? 'interpolate' : 'set', colors: preset.list });
        };
        this.colorsChanged = ({ value }) => {
            const colors = value.map(c => [c.color, c.offset]);
            colors.sort((a, b) => a[1] - b[1]);
            this.update({ kind: this.props.value.kind, colors });
        };
        this.isInterpolatedChanged = ({ value }) => {
            this.update({ kind: value ? 'interpolate' : 'set', colors: this.props.value.colors });
        };
        this.toggleHelp = () => this.setState({ showHelp: !this.state.showHelp });
    }
    update(value) {
        this.props.onChange({ param: this.props.param, name: this.props.name, value });
    }
    renderControl() {
        const { value } = this.props;
        // TODO: fix the button right offset
        return _jsxs(_Fragment, { children: [_jsxs("button", { onClick: this.toggleEdit, style: { position: 'relative', paddingRight: '33px' }, children: [value.colors.length === 1 ? '1 color' : `${value.colors.length} colors`, _jsx("div", { style: colorStripStyle(value, '33px') })] }), _jsx(IconButton, { svg: BookmarksOutlinedSvg, onClick: this.togglePresets, toggleState: this.state.show === 'presets', title: 'Color Presets', style: { padding: 0, position: 'absolute', right: 0, top: 0, width: '32px' } })] });
    }
    renderColors() {
        if (!this.state.show)
            return null;
        const { ColorPresets, OffsetColorsParam, IsInterpolatedParam } = ColorListHelpers();
        const preset = ColorPresets[this.props.param.presetKind];
        if (this.state.show === 'presets')
            return _jsx(ActionMenu, { items: preset, onSelect: this.selectPreset });
        const colors = this.props.value.colors;
        const values = colors.map((color, i) => {
            if (Array.isArray(color))
                return { color: color[0], offset: color[1] };
            return { color, offset: i / colors.length };
        });
        values.sort((a, b) => a.offset - b.offset);
        return _jsxs("div", { className: 'msp-control-offset', children: [_jsx(ObjectListControl, { name: 'colors', param: OffsetColorsParam, value: values, onChange: this.colorsChanged, isDisabled: this.props.isDisabled, onEnter: this.props.onEnter }), _jsx(BoolControl, { name: 'isInterpolated', param: IsInterpolatedParam, value: this.props.value.kind === 'interpolate', onChange: this.isInterpolatedChanged, isDisabled: this.props.isDisabled, onEnter: this.props.onEnter })] });
    }
    render() {
        return renderSimple({
            props: this.props,
            state: this.state,
            control: this.renderControl(),
            toggleHelp: this.toggleHelp,
            addOn: this.renderColors()
        });
    }
}
export class Vec3Control extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = { isExpanded: false };
        this.components = {
            0: PD.Numeric(0, { step: this.props.param.step }, { label: (this.props.param.fieldLabels && this.props.param.fieldLabels.x) || 'X' }),
            1: PD.Numeric(0, { step: this.props.param.step }, { label: (this.props.param.fieldLabels && this.props.param.fieldLabels.y) || 'Y' }),
            2: PD.Numeric(0, { step: this.props.param.step }, { label: (this.props.param.fieldLabels && this.props.param.fieldLabels.z) || 'Z' })
        };
        this.componentChange = ({ name, value }) => {
            const v = Vec3.copy(Vec3.zero(), this.props.value);
            v[+name] = value;
            this.change(v);
        };
        this.toggleExpanded = (e) => {
            this.setState({ isExpanded: !this.state.isExpanded });
            e.currentTarget.blur();
        };
    }
    change(value) {
        this.props.onChange({ name: this.props.name, param: this.props.param, value });
    }
    render() {
        const v = this.props.value;
        const label = this.props.param.label || camelCaseToWords(this.props.name);
        const p = getPrecision(this.props.param.step || 0.01);
        const value = `[${v[0].toFixed(p)}, ${v[1].toFixed(p)}, ${v[2].toFixed(p)}]`;
        return _jsxs(_Fragment, { children: [_jsx(ControlRow, { label: label, control: _jsx("button", { onClick: this.toggleExpanded, disabled: this.props.isDisabled, children: value }) }), this.state.isExpanded && _jsx("div", { className: 'msp-control-offset', children: _jsx(ParameterControls, { params: this.components, values: v, onChange: this.componentChange, onEnter: this.props.onEnter }) })] });
    }
}
export class Mat4Control extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = { isExpanded: false };
        this.components = {
            json: PD.Text(JSON.stringify(Mat4()), { description: 'JSON array with 4x4 matrix in a column major (j * 4 + i indexing) format' })
        };
        this.componentChange = ({ name, value }) => {
            const v = Mat4.copy(Mat4(), this.props.value);
            if (name === 'json') {
                Mat4.copy(v, JSON.parse(value));
            }
            else {
                v[+name] = value;
            }
            this.change(v);
        };
        this.toggleExpanded = (e) => {
            this.setState({ isExpanded: !this.state.isExpanded });
            e.currentTarget.blur();
        };
    }
    change(value) {
        this.props.onChange({ name: this.props.name, param: this.props.param, value });
    }
    changeValue(idx) {
        return (v) => {
            const m = Mat4.copy(Mat4(), this.props.value);
            m[idx] = v;
            this.change(m);
        };
    }
    get grid() {
        const v = this.props.value;
        const rows = [];
        for (let i = 0; i < 4; i++) {
            const row = [];
            for (let j = 0; j < 4; j++) {
                row.push(_jsx(TextInput, { numeric: true, delayMs: 50, value: Mat4.getValue(v, i, j), onChange: this.changeValue(4 * j + i), className: 'msp-form-control', blurOnEnter: true, isDisabled: this.props.isDisabled }, j));
            }
            rows.push(_jsx("div", { className: 'msp-flex-row', children: row }, i));
        }
        return _jsx("div", { className: 'msp-parameter-matrix', children: rows });
    }
    render() {
        const v = {
            json: JSON.stringify(this.props.value)
        };
        const label = this.props.param.label || camelCaseToWords(this.props.name);
        return _jsxs(_Fragment, { children: [_jsx(ControlRow, { label: label, control: _jsx("button", { onClick: this.toggleExpanded, disabled: this.props.isDisabled, children: '4\u00D74 Matrix' }) }), this.state.isExpanded && _jsxs("div", { className: 'msp-control-offset', children: [this.grid, _jsx(ParameterControls, { params: this.components, values: v, onChange: this.componentChange, onEnter: this.props.onEnter })] })] });
    }
}
export class UrlControl extends SimpleParam {
    constructor() {
        super(...arguments);
        this.onChange = (e) => {
            const value = e.target.value;
            if (value !== Asset.getUrl(this.props.value || '')) {
                this.update(Asset.Url(value));
            }
        };
        this.onKeyPress = (e) => {
            if ((e.keyCode === 13 || e.charCode === 13 || e.key === 'Enter')) {
                if (this.props.onEnter)
                    this.props.onEnter();
            }
            e.stopPropagation();
        };
    }
    renderControl() {
        const placeholder = this.props.param.label || camelCaseToWords(this.props.name);
        return _jsx("input", { type: 'text', value: Asset.getUrl(this.props.value || ''), placeholder: placeholder, onChange: this.onChange, onKeyPress: this.props.onEnter ? this.onKeyPress : void 0, disabled: this.props.isDisabled });
    }
}
export class FileControl extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = { showHelp: false };
        this.onChangeFile = (e) => {
            this.change(e.target.files[0]);
        };
        this.toggleHelp = () => this.setState({ showHelp: !this.state.showHelp });
    }
    change(value) {
        this.props.onChange({ name: this.props.name, param: this.props.param, value: Asset.File(value) });
    }
    renderControl() {
        const value = this.props.value;
        return _jsxs("div", { className: 'msp-btn msp-btn-block msp-btn-action msp-loader-msp-btn-file', style: { marginTop: '1px' }, children: [value ? value.name : 'Select a file...', " ", _jsx("input", { disabled: this.props.isDisabled, onChange: this.onChangeFile, type: 'file', multiple: false, accept: this.props.param.accept })] });
    }
    render() {
        if (this.props.param.label) {
            return renderSimple({
                props: this.props,
                state: this.state,
                control: this.renderControl(),
                toggleHelp: this.toggleHelp,
                addOn: null
            });
        }
        else {
            return this.renderControl();
        }
    }
}
export class FileListControl extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = { showHelp: false };
        this.onChangeFileList = (e) => {
            this.change(e.target.files);
        };
        this.toggleHelp = () => this.setState({ showHelp: !this.state.showHelp });
    }
    change(value) {
        const files = [];
        if (value) {
            for (let i = 0, il = value.length; i < il; ++i) {
                files.push(Asset.File(value[i]));
            }
        }
        this.props.onChange({ name: this.props.name, param: this.props.param, value: files });
    }
    renderControl() {
        const value = this.props.value;
        const names = [];
        if (value) {
            for (const file of value) {
                names.push(file.name);
            }
        }
        const label = names.length === 0
            ? 'Select files...' : names.length === 1
            ? names[0] : `${names.length} files selected`;
        return _jsxs("div", { className: 'msp-btn msp-btn-block msp-btn-action msp-loader-msp-btn-file', style: { marginTop: '1px' }, children: [label, " ", _jsx("input", { disabled: this.props.isDisabled, onChange: this.onChangeFileList, type: 'file', multiple: true, accept: this.props.param.accept })] });
    }
    render() {
        if (this.props.param.label) {
            return renderSimple({
                props: this.props,
                state: this.state,
                control: this.renderControl(),
                toggleHelp: this.toggleHelp,
                addOn: null
            });
        }
        else {
            return this.renderControl();
        }
    }
}
export class MultiSelectControl extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = { isExpanded: false };
        this.toggleExpanded = (e) => {
            this.setState({ isExpanded: !this.state.isExpanded });
            e.currentTarget.blur();
        };
    }
    change(value) {
        this.props.onChange({ name: this.props.name, param: this.props.param, value });
    }
    toggle(key) {
        return (e) => {
            if (this.props.value.indexOf(key) < 0)
                this.change(this.props.value.concat(key));
            else
                this.change(this.props.value.filter(v => v !== key));
            e.currentTarget.blur();
        };
    }
    render() {
        const current = this.props.value;
        const emptyLabel = this.props.param.emptyValue;
        const label = this.props.param.label || camelCaseToWords(this.props.name);
        return _jsxs(_Fragment, { children: [_jsx(ControlRow, { label: label, control: _jsx("button", { onClick: this.toggleExpanded, disabled: this.props.isDisabled, children: current.length === 0 && emptyLabel ? emptyLabel : `${current.length} of ${this.props.param.options.length}` }) }), this.state.isExpanded && _jsx("div", { className: 'msp-control-offset', children: this.props.param.options.map(([value, label]) => {
                        const sel = current.indexOf(value) >= 0;
                        return _jsx(Button, { onClick: this.toggle(value), disabled: this.props.isDisabled, style: { marginTop: '1px' }, children: _jsx("span", { style: { float: sel ? 'left' : 'right' }, children: sel ? `✓ ${label}` : `${label} ✗` }) }, value);
                    }) })] });
    }
}
export class GroupControl extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = { isExpanded: !!this.props.param.isExpanded, showPresets: false, showHelp: false };
        this.onChangeParam = e => {
            this.change({ ...this.props.value, [e.name]: e.value });
        };
        this.toggleExpanded = () => this.setState({ isExpanded: !this.state.isExpanded });
        this.toggleShowPresets = () => this.setState({ showPresets: !this.state.showPresets });
        this.presetItems = memoizeLatest((param) => { var _a; return ActionMenu.createItemsFromSelectOptions((_a = param.presets) !== null && _a !== void 0 ? _a : []); });
        this.onSelectPreset = item => {
            this.setState({ showPresets: false });
            this.change(item === null || item === void 0 ? void 0 : item.value);
        };
    }
    change(value) {
        this.props.onChange({ name: this.props.name, param: this.props.param, value });
    }
    pivotedPresets() {
        if (!this.props.param.presets)
            return null;
        const label = this.props.param.label || camelCaseToWords(this.props.name);
        return _jsxs("div", { className: 'msp-control-group-wrapper', children: [_jsx("div", { className: 'msp-control-group-header', children: _jsxs("button", { className: 'msp-btn msp-form-control msp-btn-block', onClick: this.toggleShowPresets, children: [_jsx(Icon, { svg: BookmarksOutlinedSvg }), label, " Presets"] }) }), this.state.showPresets && _jsx(ActionMenu, { items: this.presetItems(this.props.param), onSelect: this.onSelectPreset })] });
    }
    presets() {
        if (!this.props.param.presets)
            return null;
        return _jsxs(_Fragment, { children: [_jsx("div", { className: 'msp-control-group-presets-wrapper', children: _jsx("div", { className: 'msp-control-group-header', children: _jsxs("button", { className: 'msp-btn msp-form-control msp-btn-block', onClick: this.toggleShowPresets, children: [_jsx(Icon, { svg: BookmarksOutlinedSvg }), "Presets"] }) }) }), this.state.showPresets && _jsx(ActionMenu, { items: this.presetItems(this.props.param), onSelect: this.onSelectPreset })] });
    }
    pivoted() {
        const key = this.props.param.pivot;
        const params = this.props.param.params;
        const pivot = params[key];
        const Control = controlFor(pivot);
        const ctrl = _jsx(Control, { name: key, param: pivot, value: this.props.value[key], onChange: this.onChangeParam, onEnter: this.props.onEnter, isDisabled: this.props.isDisabled });
        if (!this.state.isExpanded) {
            return _jsxs("div", { className: 'msp-mapped-parameter-group', children: [ctrl, _jsx(IconButton, { svg: MoreHorizSvg, onClick: this.toggleExpanded, toggleState: this.state.isExpanded, title: `More Options` })] });
        }
        const filtered = Object.create(null);
        for (const k of Object.keys(params)) {
            if (k !== key)
                filtered[k] = params[k];
        }
        return _jsxs("div", { className: 'msp-mapped-parameter-group', children: [ctrl, _jsx(IconButton, { svg: MoreHorizSvg, onClick: this.toggleExpanded, toggleState: this.state.isExpanded, title: `More Options` }), _jsxs("div", { className: 'msp-control-offset', children: [this.pivotedPresets(), _jsx(ParameterControls, { params: filtered, onEnter: this.props.onEnter, values: this.props.value, onChange: this.onChangeParam, isDisabled: this.props.isDisabled })] })] });
    }
    render() {
        const params = this.props.param.params;
        // Do not show if there are no params.
        if (Object.keys(params).length === 0)
            return null;
        if (this.props.param.pivot)
            return this.pivoted();
        const label = this.props.param.label || camelCaseToWords(this.props.name);
        const controls = _jsx(ParameterControls, { params: params, onChange: this.onChangeParam, values: this.props.value, onEnter: this.props.onEnter, isDisabled: this.props.isDisabled });
        if (this.props.inMapped) {
            return _jsx("div", { className: 'msp-control-offset', children: controls });
        }
        if (this.props.param.isFlat) {
            return controls;
        }
        return _jsxs("div", { className: 'msp-control-group-wrapper', style: { position: 'relative' }, children: [_jsx("div", { className: 'msp-control-group-header', children: _jsxs("button", { className: 'msp-btn msp-form-control msp-btn-block', onClick: this.toggleExpanded, children: [_jsx(Icon, { svg: this.state.isExpanded ? ArrowDropDownSvg : ArrowRightSvg }), label] }) }), this.presets(), this.state.isExpanded && _jsx("div", { className: 'msp-control-offset', children: controls })] });
    }
}
export class MappedControl extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = { isExpanded: false };
        // TODO: this could lead to a rare bug where the component is reused with different mapped control.
        // I think there are currently no cases where this could happen in the UI, but still need to watch out..
        this.valuesCache = {};
        this.onChangeName = e => {
            this.change({ name: e.value, params: this.getValues(e.value) });
        };
        this.onChangeParam = e => {
            this.setValues(this.props.value.name, e.value);
            this.change({ name: this.props.value.name, params: e.value });
        };
        this.toggleExpanded = () => this.setState({ isExpanded: !this.state.isExpanded });
    }
    setValues(name, values) {
        this.valuesCache[name] = values;
    }
    getValues(name) {
        if (name in this.valuesCache) {
            return this.valuesCache[name];
        }
        else {
            return this.props.param.map(name).defaultValue;
        }
    }
    change(value) {
        this.props.onChange({ name: this.props.name, param: this.props.param, value });
    }
    areParamsEmpty(params) {
        for (const k of Object.keys(params)) {
            if (!params[k].isHidden)
                return false;
        }
        return true;
    }
    render() {
        const value = this.props.value || this.props.param.defaultValue;
        const param = this.props.param.map(value.name);
        const label = this.props.param.label || camelCaseToWords(this.props.name);
        const Mapped = controlFor(param);
        const help = this.props.param.help;
        const select = help
            ? {
                ...this.props.param.select,
                help: (name) => help({ name, params: this.getValues(name) })
            }
            : this.props.param.select;
        const Select = _jsx(SelectControl, { param: select, isDisabled: this.props.isDisabled, onChange: this.onChangeName, onEnter: this.props.onEnter, name: label, value: value.name });
        if (!Mapped) {
            return Select;
        }
        if (param.type === 'group' && !param.isFlat) {
            if (!this.areParamsEmpty(param.params)) {
                return _jsxs("div", { className: 'msp-mapped-parameter-group', children: [Select, _jsx(IconButton, { svg: MoreHorizSvg, onClick: this.toggleExpanded, toggleState: this.state.isExpanded, title: `${label} Properties` }), this.state.isExpanded && _jsx(GroupControl, { inMapped: true, param: param, value: value.params, name: value.name, onChange: this.onChangeParam, onEnter: this.props.onEnter, isDisabled: this.props.isDisabled })] });
            }
            return Select;
        }
        return _jsxs(_Fragment, { children: [Select, _jsx(Mapped, { param: param, value: value.params, name: value.name, onChange: this.onChangeParam, onEnter: this.props.onEnter, isDisabled: this.props.isDisabled })] });
    }
}
class ObjectListEditor extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = { current: this.props.value };
        this.onChangeParam = e => {
            this.setState({ current: { ...this.state.current, [e.name]: e.value } });
        };
        this.apply = () => {
            this.props.apply(this.state.current);
        };
    }
    componentDidUpdate(prevProps) {
        if (this.props.params !== prevProps.params || this.props.value !== prevProps.value) {
            this.setState({ current: this.props.value });
        }
    }
    render() {
        return _jsxs(_Fragment, { children: [_jsx(ParameterControls, { params: this.props.params, onChange: this.onChangeParam, values: this.state.current, onEnter: this.apply, isDisabled: this.props.isDisabled }), _jsx("button", { className: `msp-btn msp-btn-block msp-form-control msp-control-top-offset`, onClick: this.apply, disabled: this.props.isDisabled, children: this.props.isUpdate ? 'Update' : 'Add' })] });
    }
}
class ObjectListItem extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = { isExpanded: false };
        this.update = (v) => {
            // this.setState({ isExpanded: false }); // TODO auto update? mark changed state?
            this.props.actions.update(v, this.props.index);
        };
        this.moveUp = () => {
            this.props.actions.move(this.props.index, -1);
        };
        this.moveDown = () => {
            this.props.actions.move(this.props.index, 1);
        };
        this.remove = () => {
            this.setState({ isExpanded: false });
            this.props.actions.remove(this.props.index);
        };
        this.toggleExpanded = (e) => {
            this.setState({ isExpanded: !this.state.isExpanded });
            e.currentTarget.blur();
        };
    }
    render() {
        return _jsxs(_Fragment, { children: [_jsxs("div", { className: 'msp-param-object-list-item', children: [_jsxs("button", { className: 'msp-btn msp-btn-block msp-form-control', onClick: this.toggleExpanded, children: [_jsx("span", { children: `${this.props.index + 1}: ` }), this.props.param.getLabel(this.props.value)] }), _jsxs("div", { children: [_jsx(IconButton, { svg: ArrowDownwardSvg, title: 'Move Up', onClick: this.moveUp, small: true }), _jsx(IconButton, { svg: ArrowUpwardSvg, title: 'Move Down', onClick: this.moveDown, small: true }), _jsx(IconButton, { svg: DeleteOutlinedSvg, title: 'Remove', onClick: this.remove, small: true })] })] }), this.state.isExpanded && _jsx("div", { className: 'msp-control-offset', children: _jsx(ObjectListEditor, { params: this.props.param.element, apply: this.update, value: this.props.value, isUpdate: true, isDisabled: this.props.isDisabled }) })] });
    }
}
export class ObjectListControl extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = { isExpanded: false };
        this.add = (v) => {
            this.change([...this.props.value, v]);
        };
        this.actions = {
            update: (v, i) => {
                const value = this.props.value.slice(0);
                value[i] = v;
                this.change(value);
            },
            move: (i, dir) => {
                let xs = this.props.value;
                if (xs.length === 1)
                    return;
                let j = (i + dir) % xs.length;
                if (j < 0)
                    j += xs.length;
                xs = xs.slice(0);
                const t = xs[i];
                xs[i] = xs[j];
                xs[j] = t;
                this.change(xs);
            },
            remove: (i) => {
                const xs = this.props.value;
                const update = [];
                for (let j = 0; j < xs.length; j++) {
                    if (i !== j)
                        update.push(xs[j]);
                }
                this.change(update);
            }
        };
        this.toggleExpanded = (e) => {
            this.setState({ isExpanded: !this.state.isExpanded });
            e.currentTarget.blur();
        };
    }
    change(value) {
        this.props.onChange({ name: this.props.name, param: this.props.param, value });
    }
    render() {
        const v = this.props.value;
        const label = this.props.param.label || camelCaseToWords(this.props.name);
        const value = `${v.length} item${v.length !== 1 ? 's' : ''}`;
        return _jsxs(_Fragment, { children: [_jsx(ControlRow, { label: label, control: _jsx("button", { onClick: this.toggleExpanded, disabled: this.props.isDisabled, children: value }) }), this.state.isExpanded && _jsxs("div", { className: 'msp-control-offset', children: [this.props.value.map((v, i) => _jsx(ObjectListItem, { param: this.props.param, value: v, index: i, actions: this.actions, isDisabled: this.props.isDisabled }, i)), _jsx(ControlGroup, { header: 'New Item', children: _jsx(ObjectListEditor, { params: this.props.param.element, apply: this.add, value: this.props.param.ctor(), isDisabled: this.props.isDisabled }) })] })] });
    }
}
export class ConditionedControl extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onChangeCondition = e => {
            this.change(this.props.param.conditionedValue(this.props.value, e.value));
        };
        this.onChangeParam = e => {
            this.change(e.value);
        };
    }
    change(value) {
        this.props.onChange({ name: this.props.name, param: this.props.param, value });
    }
    render() {
        const value = this.props.value;
        const condition = this.props.param.conditionForValue(value);
        const param = this.props.param.conditionParams[condition];
        const label = this.props.param.label || camelCaseToWords(this.props.name);
        const Conditioned = controlFor(param);
        const select = _jsx(SelectControl, { param: this.props.param.select, isDisabled: this.props.isDisabled, onChange: this.onChangeCondition, onEnter: this.props.onEnter, name: `${label} Kind`, value: condition });
        if (!Conditioned) {
            return select;
        }
        return _jsxs(_Fragment, { children: [select, _jsx(Conditioned, { param: param, value: value, name: label, onChange: this.onChangeParam, onEnter: this.props.onEnter, isDisabled: this.props.isDisabled })] });
    }
}
export class ConvertedControl extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onChange = e => {
            this.props.onChange({
                name: this.props.name,
                param: this.props.param,
                value: this.props.param.toValue(e.value)
            });
        };
    }
    render() {
        const value = this.props.param.fromValue(this.props.value);
        const Converted = controlFor(this.props.param.converted);
        if (!Converted)
            return null;
        return _jsx(Converted, { param: this.props.param.converted, value: value, name: this.props.name, onChange: this.onChange, onEnter: this.props.onEnter, isDisabled: this.props.isDisabled });
    }
}
export class ScriptControl extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onChange = ({ name, value }) => {
            const k = name;
            if (value !== this.props.value[k]) {
                this.props.onChange({ param: this.props.param, name: this.props.name, value: { ...this.props.value, [k]: value } });
            }
        };
    }
    render() {
        // TODO: improve!
        const selectParam = {
            defaultValue: this.props.value.language,
            options: PD.objectToOptions(Script.Info),
            type: 'select',
        };
        const select = _jsx(SelectControl, { param: selectParam, isDisabled: this.props.isDisabled, onChange: this.onChange, onEnter: this.props.onEnter, name: 'language', value: this.props.value.language });
        const textParam = {
            defaultValue: this.props.value.language,
            type: 'text',
        };
        const text = _jsx(TextControl, { param: textParam, isDisabled: this.props.isDisabled, onChange: this.onChange, name: 'expression', value: this.props.value.expression });
        return _jsxs(_Fragment, { children: [select, this.props.value.language !== 'mol-script' && _jsxs("div", { className: 'msp-help-text', style: { padding: '10px' }, children: [_jsx(Icon, { svg: WarningSvg }), " Support for PyMOL, VMD, and Jmol selections is an experimental feature and may not always work as intended."] }), text] });
    }
}
