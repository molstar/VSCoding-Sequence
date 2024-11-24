"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpandGroup = exports.ToggleButton = exports.ExpandableControlRow = exports.TextInput = exports.ControlGroup = void 0;
exports.SectionHeader = SectionHeader;
exports.Button = Button;
exports.IconButton = IconButton;
exports.ControlRow = ControlRow;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
const React = tslib_1.__importStar(require("react"));
const color_1 = require("../../mol-util/color");
const icons_1 = require("./icons");
class ControlGroup extends React.Component {
    constructor() {
        super(...arguments);
        this.state = { isExpanded: !!this.props.initialExpanded };
        this.headerClicked = () => {
            if (this.props.onHeaderClick) {
                this.props.onHeaderClick();
            }
            else {
                this.setState({ isExpanded: !this.state.isExpanded });
            }
        };
    }
    render() {
        let groupClassName = this.props.hideOffset ? 'msp-control-group-children' : 'msp-control-group-children msp-control-offset';
        if (this.props.childrenClassName)
            groupClassName += ' ' + this.props.childrenClassName;
        // TODO: customize header style (bg color, togle button etc)
        return (0, jsx_runtime_1.jsxs)("div", { className: 'msp-control-group-wrapper', style: { position: 'relative', marginTop: this.props.noTopMargin ? 0 : void 0 }, children: [(0, jsx_runtime_1.jsx)("div", { className: 'msp-control-group-header', style: { marginLeft: this.props.headerLeftMargin }, title: this.props.title, children: (0, jsx_runtime_1.jsxs)(Button, { onClick: this.headerClicked, children: [!this.props.hideExpander && (0, jsx_runtime_1.jsx)(icons_1.Icon, { svg: this.state.isExpanded ? icons_1.ArrowRightSvg : icons_1.ArrowDropDownSvg }), this.props.topRightIcon && (0, jsx_runtime_1.jsx)(icons_1.Icon, { svg: this.props.topRightIcon, style: { position: 'absolute', right: '2px', top: 0 } }), (0, jsx_runtime_1.jsx)("b", { children: this.props.header })] }) }), this.state.isExpanded && (0, jsx_runtime_1.jsx)("div", { className: groupClassName, style: { display: this.state.isExpanded ? 'block' : 'none', maxHeight: this.props.maxHeight, overflow: 'hidden', overflowY: 'auto' }, children: this.props.children })] });
    }
}
exports.ControlGroup = ControlGroup;
function _id(x) { return x; }
class TextInput extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.input = React.createRef();
        this.delayHandle = void 0;
        this.pendingValue = void 0;
        this.state = { originalValue: '', value: '' };
        this.onBlur = () => {
            this.setState({ value: '' + this.state.originalValue });
            if (this.props.onBlur)
                this.props.onBlur();
        };
        this.raiseOnChange = () => {
            if (this.pendingValue === void 0)
                return;
            this.props.onChange(this.pendingValue);
            this.pendingValue = void 0;
        };
        this.onChange = (e) => {
            const value = e.target.value;
            const isInvalid = (this.props.isValid && !this.props.isValid(value)) || (this.props.numeric && Number.isNaN(+value));
            if (isInvalid) {
                this.clearTimeout();
                this.setState({ value });
                return;
            }
            if (this.props.numeric) {
                this.setState({ value }, () => this.triggerChanged(value, +value));
            }
            else {
                const converted = (this.props.toValue || _id)(value);
                const formatted = (this.props.fromValue || _id)(converted);
                this.setState({ value: formatted }, () => this.triggerChanged(formatted, converted));
            }
        };
        this.onKeyUp = (e) => {
            if (e.charCode === 27 || e.keyCode === 27 || e.key === 'Escape') {
                if (this.props.blurOnEscape && this.input.current) {
                    this.input.current.blur();
                }
            }
        };
        this.onKeyPress = (e) => {
            if (e.keyCode === 13 || e.charCode === 13 || e.key === 'Enter') {
                if (this.isPending) {
                    this.clearTimeout();
                    this.raiseOnChange();
                }
                if (this.props.blurOnEnter && this.input.current) {
                    this.input.current.blur();
                }
                if (this.props.onEnter)
                    this.props.onEnter();
            }
            e.stopPropagation();
        };
    }
    get isPending() { return typeof this.delayHandle !== 'undefined'; }
    clearTimeout() {
        if (this.isPending) {
            clearTimeout(this.delayHandle);
            this.delayHandle = void 0;
        }
    }
    triggerChanged(formatted, converted) {
        this.clearTimeout();
        if (formatted === this.state.originalValue)
            return;
        if (this.props.delayMs) {
            this.pendingValue = converted;
            this.delayHandle = setTimeout(this.raiseOnChange, this.props.delayMs);
        }
        else {
            this.props.onChange(converted);
        }
    }
    static getDerivedStateFromProps(props, state) {
        const value = props.fromValue ? props.fromValue(props.value) : props.value;
        if (value === state.originalValue)
            return null;
        return { originalValue: value, value };
    }
    render() {
        return (0, jsx_runtime_1.jsx)("input", { type: 'text', className: this.props.className, style: this.props.style, ref: this.input, onBlur: this.onBlur, value: this.state.value, placeholder: this.props.placeholder, onChange: this.onChange, onKeyPress: this.props.onEnter || this.props.blurOnEnter || this.props.blurOnEscape ? this.onKeyPress : void 0, onKeyDown: this.props.blurOnEscape ? this.onKeyUp : void 0, disabled: !!this.props.isDisabled });
    }
}
exports.TextInput = TextInput;
class ExpandableControlRow extends React.Component {
    constructor() {
        super(...arguments);
        this.state = { isExpanded: false };
        this.toggleExpanded = () => this.setState({ isExpanded: !this.state.isExpanded });
    }
    render() {
        const { label, pivot, controls } = this.props;
        // TODO: fix the inline CSS
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(ControlRow, { label: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [label, (0, jsx_runtime_1.jsx)("button", { className: 'msp-btn-link msp-btn-icon msp-control-group-expander', onClick: this.toggleExpanded, title: `${this.state.isExpanded ? 'Less' : 'More'} options`, style: { background: 'transparent', textAlign: 'left', padding: '0' }, children: (0, jsx_runtime_1.jsx)(icons_1.Icon, { svg: this.state.isExpanded ? icons_1.RemoveSvg : icons_1.AddSvg, style: { display: 'inline-block' } }) })] }), control: pivot, children: this.props.colorStripe && (0, jsx_runtime_1.jsx)("div", { className: 'msp-expandable-group-color-stripe', style: { backgroundColor: color_1.Color.toStyle(this.props.colorStripe) } }) }), this.state.isExpanded && (0, jsx_runtime_1.jsx)("div", { className: 'msp-control-offset', children: controls })] });
    }
}
exports.ExpandableControlRow = ExpandableControlRow;
function SectionHeader(props) {
    return (0, jsx_runtime_1.jsxs)("div", { className: `msp-section-header${props.accent ? ' msp-transform-header-brand-' + props.accent : ''}`, children: [props.icon && (0, jsx_runtime_1.jsx)(icons_1.Icon, { svg: props.icon }), props.title, " ", (0, jsx_runtime_1.jsx)("small", { children: props.desc })] });
}
function Button(props) {
    let className = 'msp-btn';
    if (!props.inline)
        className += ' msp-btn-block';
    if (props.noOverflow)
        className += ' msp-no-overflow';
    if (props.flex)
        className += ' msp-flex-item';
    if (props.commit === 'on' || props.commit)
        className += ' msp-btn-commit msp-btn-commit-on';
    if (props.commit === 'off')
        className += ' msp-btn-commit msp-btn-commit-off';
    if (!props.children)
        className += ' msp-btn-childless';
    if (props.className)
        className += ' ' + props.className;
    let style = void 0;
    if (props.flex) {
        if (typeof props.flex === 'number')
            style = { flex: `0 0 ${props.flex}px`, padding: 0, maxWidth: `${props.flex}px` };
        else if (typeof props.flex === 'string')
            style = { flex: `0 0 ${props.flex}`, padding: 0, maxWidth: props.flex };
    }
    if (props.style) {
        if (style)
            Object.assign(style, props.style);
        else
            style = props.style;
    }
    return (0, jsx_runtime_1.jsxs)("button", { onClick: props.onClick, title: props.title, disabled: props.disabled, style: style, className: className, "data-id": props['data-id'], "data-color": props['data-color'], onContextMenu: props.onContextMenu, onMouseEnter: props.onMouseEnter, onMouseLeave: props.onMouseLeave, children: [props.icon && (0, jsx_runtime_1.jsx)(icons_1.Icon, { svg: props.icon }), props.children] });
}
function IconButton(props) {
    let className = `msp-btn msp-btn-icon${props.small ? '-small' : ''}${props.className ? ' ' + props.className : ''}`;
    if (typeof props.toggleState !== 'undefined') {
        className += ` msp-btn-link-toggle-${props.toggleState ? 'on' : 'off'}`;
    }
    if (props.transparent) {
        className += ' msp-transparent-bg';
    }
    let style = void 0;
    if (props.flex) {
        if (typeof props.flex === 'boolean')
            style = { flex: '0 0 32px', padding: 0 };
        else if (typeof props.flex === 'number')
            style = { flex: `0 0 ${props.flex}px`, padding: 0, maxWidth: `${props.flex}px` };
        else
            style = { flex: `0 0 ${props.flex}`, padding: 0, maxWidth: props.flex };
    }
    if (props.style) {
        if (style)
            Object.assign(style, props.style);
        else
            style = props.style;
    }
    return (0, jsx_runtime_1.jsxs)("button", { className: className, onClick: props.onClick, title: props.title, disabled: props.disabled, "data-id": props['data-id'], style: style, children: [props.svg && (0, jsx_runtime_1.jsx)(icons_1.Icon, { svg: props.svg }), props.extraContent] });
}
class ToggleButton extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onClick = (e) => {
            e.currentTarget.blur();
            this.props.toggle();
        };
    }
    render() {
        const props = this.props;
        const label = props.label;
        const className = props.isSelected ? `${props.className || ''} msp-control-current` : props.className;
        return (0, jsx_runtime_1.jsx)(Button, { icon: this.props.icon, onClick: this.onClick, title: this.props.title, inline: this.props.inline, disabled: props.disabled, style: props.style, className: className, children: label && this.props.isSelected ? (0, jsx_runtime_1.jsx)("b", { children: label }) : label });
    }
}
exports.ToggleButton = ToggleButton;
class ExpandGroup extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = { isExpanded: !!this.props.initiallyExpanded };
        this.toggleExpanded = () => this.setState({ isExpanded: !this.state.isExpanded });
    }
    render() {
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: 'msp-control-group-header', style: { marginTop: this.props.marginTop !== void 0 ? this.props.marginTop : '1px', marginLeft: this.props.headerLeftMargin }, children: (0, jsx_runtime_1.jsxs)("button", { className: 'msp-btn msp-form-control msp-btn-block', onClick: this.toggleExpanded, style: this.props.headerStyle, children: [(0, jsx_runtime_1.jsx)(icons_1.Icon, { svg: this.state.isExpanded ? icons_1.ArrowDropDownSvg : icons_1.ArrowRightSvg }), this.props.header] }) }), this.state.isExpanded &&
                    (this.props.noOffset
                        ? this.props.children
                        : (0, jsx_runtime_1.jsx)("div", { className: this.props.accent ? 'msp-accent-offset' : 'msp-control-offset', children: this.props.children }))] });
    }
}
exports.ExpandGroup = ExpandGroup;
function ControlRow(props) {
    let className = 'msp-control-row';
    if (props.className)
        className += ' ' + props.className;
    return (0, jsx_runtime_1.jsxs)("div", { className: className, children: [(0, jsx_runtime_1.jsx)("span", { className: 'msp-control-row-label', title: props.title, children: props.label }), (0, jsx_runtime_1.jsx)("div", { className: 'msp-control-row-ctrl', children: props.control }), props.children] });
}
