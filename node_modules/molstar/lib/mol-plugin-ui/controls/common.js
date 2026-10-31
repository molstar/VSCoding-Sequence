import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as React from 'react';
import { Color } from '../../mol-util/color';
import { Icon, ArrowRightSvg, ArrowDropDownSvg, RemoveSvg, AddSvg } from './icons';
export class ControlGroup extends React.Component {
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
        return _jsxs("div", { className: 'msp-control-group-wrapper', style: { position: 'relative', marginTop: this.props.noTopMargin ? 0 : void 0 }, children: [_jsx("div", { className: 'msp-control-group-header', style: { marginLeft: this.props.headerLeftMargin }, title: this.props.title, children: _jsxs(Button, { onClick: this.headerClicked, children: [!this.props.hideExpander && _jsx(Icon, { svg: this.state.isExpanded ? ArrowRightSvg : ArrowDropDownSvg }), this.props.topRightIcon && _jsx(Icon, { svg: this.props.topRightIcon, style: { position: 'absolute', right: '2px', top: 0 } }), _jsx("b", { children: this.props.header })] }) }), this.state.isExpanded && _jsx("div", { className: groupClassName, style: { display: this.state.isExpanded ? 'block' : 'none', maxHeight: this.props.maxHeight, overflow: 'hidden', overflowY: 'auto' }, children: this.props.children })] });
    }
}
function _id(x) { return x; }
export class TextInput extends React.PureComponent {
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
        return _jsx("input", { type: 'text', className: this.props.className, style: this.props.style, ref: this.input, onBlur: this.onBlur, value: this.state.value, placeholder: this.props.placeholder, onChange: this.onChange, onKeyPress: this.props.onEnter || this.props.blurOnEnter || this.props.blurOnEscape ? this.onKeyPress : void 0, onKeyDown: this.props.blurOnEscape ? this.onKeyUp : void 0, disabled: !!this.props.isDisabled });
    }
}
export class ExpandableControlRow extends React.Component {
    constructor() {
        super(...arguments);
        this.state = { isExpanded: false };
        this.toggleExpanded = () => this.setState({ isExpanded: !this.state.isExpanded });
    }
    render() {
        const { label, pivot, controls } = this.props;
        // TODO: fix the inline CSS
        return _jsxs(_Fragment, { children: [_jsx(ControlRow, { label: _jsxs(_Fragment, { children: [label, _jsx("button", { className: 'msp-btn-link msp-btn-icon msp-control-group-expander', onClick: this.toggleExpanded, title: `${this.state.isExpanded ? 'Less' : 'More'} options`, style: { background: 'transparent', textAlign: 'left', padding: '0' }, children: _jsx(Icon, { svg: this.state.isExpanded ? RemoveSvg : AddSvg, style: { display: 'inline-block' } }) })] }), control: pivot, children: this.props.colorStripe && _jsx("div", { className: 'msp-expandable-group-color-stripe', style: { backgroundColor: Color.toStyle(this.props.colorStripe) } }) }), this.state.isExpanded && _jsx("div", { className: 'msp-control-offset', children: controls })] });
    }
}
export function SectionHeader(props) {
    return _jsxs("div", { className: `msp-section-header${props.accent ? ' msp-transform-header-brand-' + props.accent : ''}`, children: [props.icon && _jsx(Icon, { svg: props.icon }), props.title, " ", _jsx("small", { children: props.desc })] });
}
export function Button(props) {
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
    return _jsxs("button", { onClick: props.onClick, title: props.title, disabled: props.disabled, style: style, className: className, "data-id": props['data-id'], "data-color": props['data-color'], onContextMenu: props.onContextMenu, onMouseEnter: props.onMouseEnter, onMouseLeave: props.onMouseLeave, children: [props.icon && _jsx(Icon, { svg: props.icon }), props.children] });
}
export function IconButton(props) {
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
    return _jsxs("button", { className: className, onClick: props.onClick, title: props.title, disabled: props.disabled, "data-id": props['data-id'], style: style, children: [props.svg && _jsx(Icon, { svg: props.svg }), props.extraContent] });
}
export class ToggleButton extends React.PureComponent {
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
        return _jsx(Button, { icon: this.props.icon, onClick: this.onClick, title: this.props.title, inline: this.props.inline, disabled: props.disabled, style: props.style, className: className, children: label && this.props.isSelected ? _jsx("b", { children: label }) : label });
    }
}
export class ExpandGroup extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = { isExpanded: !!this.props.initiallyExpanded };
        this.toggleExpanded = () => this.setState({ isExpanded: !this.state.isExpanded });
    }
    render() {
        return _jsxs(_Fragment, { children: [_jsx("div", { className: 'msp-control-group-header', style: { marginTop: this.props.marginTop !== void 0 ? this.props.marginTop : '1px', marginLeft: this.props.headerLeftMargin }, children: _jsxs("button", { className: 'msp-btn msp-form-control msp-btn-block', onClick: this.toggleExpanded, style: this.props.headerStyle, children: [_jsx(Icon, { svg: this.state.isExpanded ? ArrowDropDownSvg : ArrowRightSvg }), this.props.header] }) }), this.state.isExpanded &&
                    (this.props.noOffset
                        ? this.props.children
                        : _jsx("div", { className: this.props.accent ? 'msp-accent-offset' : 'msp-control-offset', children: this.props.children }))] });
    }
}
export function ControlRow(props) {
    let className = 'msp-control-row';
    if (props.className)
        className += ' ' + props.className;
    return _jsxs("div", { className: className, children: [_jsx("span", { className: 'msp-control-row-label', title: props.title, children: props.label }), _jsx("div", { className: 'msp-control-row-ctrl', children: props.control }), props.children] });
}
