import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Color } from '../../mol-util/color';
import { camelCaseToWords, stringToWords } from '../../mol-util/string';
import * as React from 'react';
import { TextInput, Button, ControlRow } from './common';
import { DefaultColorSwatch } from '../../mol-util/color/swatches';
export class CombinedColorControl extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            isExpanded: !!this.props.param.isExpanded || !!this.props.hideNameRow,
            lightness: 0
        };
        this.toggleExpanded = (e) => {
            this.setState({ isExpanded: !this.state.isExpanded });
            e.currentTarget.blur();
        };
        this.onClickSwatch = (e) => {
            const value = Color.fromHexString(e.currentTarget.getAttribute('data-color') || '0');
            if (value !== this.props.value) {
                if (!this.props.param.isExpanded)
                    this.setState({ isExpanded: false });
                this.update(value);
            }
        };
        this.onR = (v) => {
            const [, g, b] = Color.toRgb(this.props.value);
            const value = Color.fromRgb(v, g, b);
            if (value !== this.props.value)
                this.update(value);
        };
        this.onG = (v) => {
            const [r, , b] = Color.toRgb(this.props.value);
            const value = Color.fromRgb(r, v, b);
            if (value !== this.props.value)
                this.update(value);
        };
        this.onB = (v) => {
            const [r, g] = Color.toRgb(this.props.value);
            const value = Color.fromRgb(r, g, v);
            if (value !== this.props.value)
                this.update(value);
        };
        this.onRGB = (e) => {
            const value = Color.fromHexStyle(e.currentTarget.value || '0');
            if (value !== this.props.value)
                this.update(value);
        };
        this.onLighten = () => {
            this.update(Color.lighten(this.props.value, 0.1));
        };
        this.onDarken = () => {
            this.update(Color.darken(this.props.value, 0.1));
        };
    }
    update(value) {
        this.props.onChange({ param: this.props.param, name: this.props.name, value });
    }
    swatch() {
        return _jsx("div", { className: 'msp-combined-color-swatch', children: DefaultColorSwatch.map(c => _jsx(Button, { inline: true, "data-color": c[1], onClick: this.onClickSwatch, style: { background: Color.toStyle(c[1]) } }, c[1])) });
    }
    render() {
        const label = this.props.param.label || camelCaseToWords(this.props.name);
        const [r, g, b] = Color.toRgb(this.props.value);
        const inner = _jsxs(_Fragment, { children: [this.swatch(), _jsx(ControlRow, { label: 'RGB', className: 'msp-control-label-short', control: _jsxs("div", { style: { display: 'flex', textAlignLast: 'center', left: '80px' }, children: [_jsx(TextInput, { onChange: this.onR, numeric: true, value: r, delayMs: 250, style: { order: 1, flex: '1 1 auto', minWidth: 0 }, className: 'msp-form-control', onEnter: this.props.onEnter, blurOnEnter: true, blurOnEscape: true }), _jsx(TextInput, { onChange: this.onG, numeric: true, value: g, delayMs: 250, style: { order: 2, flex: '1 1 auto', minWidth: 0 }, className: 'msp-form-control', onEnter: this.props.onEnter, blurOnEnter: true, blurOnEscape: true }), _jsx(TextInput, { onChange: this.onB, numeric: true, value: b, delayMs: 250, style: { order: 3, flex: '1 1 auto', minWidth: 0 }, className: 'msp-form-control', onEnter: this.props.onEnter, blurOnEnter: true, blurOnEscape: true }), _jsx("input", { onInput: this.onRGB, type: 'color', value: Color.toHexStyle(this.props.value), style: { order: 4, flex: '1 1 auto', minWidth: '32px', width: '32px', height: '32px', padding: '0 2px 0 2px', background: 'none', border: 'none', cursor: 'pointer' } })] }) }), _jsxs("div", { style: { display: 'flex', textAlignLast: 'center' }, children: [_jsx(Button, { onClick: this.onLighten, style: { order: 1, flex: '1 1 auto', minWidth: 0 }, className: 'msp-form-control', children: "Lighten" }), _jsx(Button, { onClick: this.onDarken, style: { order: 1, flex: '1 1 auto', minWidth: 0 }, className: 'msp-form-control', children: "Darken" })] })] });
        if (this.props.hideNameRow) {
            return inner;
        }
        return _jsxs(_Fragment, { children: [_jsx(ControlRow, { title: this.props.param.description, label: label, control: _jsx(Button, { onClick: this.toggleExpanded, inline: true, className: 'msp-combined-color-button', style: { background: Color.toStyle(this.props.value) } }) }), this.state.isExpanded && _jsx("div", { className: 'msp-control-offset', children: inner })] });
    }
}
let _colors = void 0;
export function ColorOptions() {
    if (_colors)
        return _colors;
    _colors = _jsx(_Fragment, { children: DefaultColorSwatch.map(v => _jsx("option", { value: v[1], style: { background: `${Color.toStyle(v[1])}` }, children: stringToWords(v[0]) }, v[1])) });
    return _colors;
}
const DefaultColorSwatchMap = (function () {
    const map = new Map();
    for (const v of DefaultColorSwatch)
        map.set(v[1], v[0]);
    return map;
})();
export function ColorValueOption(color) {
    return !DefaultColorSwatchMap.has(color) ? _jsx("option", { value: color, style: { background: `${Color.toStyle(color)}` }, children: Color.toRgbString(color) }, Color.toHexString(color)) : null;
}
