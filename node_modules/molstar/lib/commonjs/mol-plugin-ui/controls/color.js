"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombinedColorControl = void 0;
exports.ColorOptions = ColorOptions;
exports.ColorValueOption = ColorValueOption;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
const color_1 = require("../../mol-util/color");
const string_1 = require("../../mol-util/string");
const React = tslib_1.__importStar(require("react"));
const common_1 = require("./common");
const swatches_1 = require("../../mol-util/color/swatches");
class CombinedColorControl extends React.PureComponent {
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
            const value = color_1.Color.fromHexString(e.currentTarget.getAttribute('data-color') || '0');
            if (value !== this.props.value) {
                if (!this.props.param.isExpanded)
                    this.setState({ isExpanded: false });
                this.update(value);
            }
        };
        this.onR = (v) => {
            const [, g, b] = color_1.Color.toRgb(this.props.value);
            const value = color_1.Color.fromRgb(v, g, b);
            if (value !== this.props.value)
                this.update(value);
        };
        this.onG = (v) => {
            const [r, , b] = color_1.Color.toRgb(this.props.value);
            const value = color_1.Color.fromRgb(r, v, b);
            if (value !== this.props.value)
                this.update(value);
        };
        this.onB = (v) => {
            const [r, g] = color_1.Color.toRgb(this.props.value);
            const value = color_1.Color.fromRgb(r, g, v);
            if (value !== this.props.value)
                this.update(value);
        };
        this.onRGB = (e) => {
            const value = color_1.Color.fromHexStyle(e.currentTarget.value || '0');
            if (value !== this.props.value)
                this.update(value);
        };
        this.onLighten = () => {
            this.update(color_1.Color.lighten(this.props.value, 0.1));
        };
        this.onDarken = () => {
            this.update(color_1.Color.darken(this.props.value, 0.1));
        };
    }
    update(value) {
        this.props.onChange({ param: this.props.param, name: this.props.name, value });
    }
    swatch() {
        return (0, jsx_runtime_1.jsx)("div", { className: 'msp-combined-color-swatch', children: swatches_1.DefaultColorSwatch.map(c => (0, jsx_runtime_1.jsx)(common_1.Button, { inline: true, "data-color": c[1], onClick: this.onClickSwatch, style: { background: color_1.Color.toStyle(c[1]) } }, c[1])) });
    }
    render() {
        const label = this.props.param.label || (0, string_1.camelCaseToWords)(this.props.name);
        const [r, g, b] = color_1.Color.toRgb(this.props.value);
        const inner = (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [this.swatch(), (0, jsx_runtime_1.jsx)(common_1.ControlRow, { label: 'RGB', className: 'msp-control-label-short', control: (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', textAlignLast: 'center', left: '80px' }, children: [(0, jsx_runtime_1.jsx)(common_1.TextInput, { onChange: this.onR, numeric: true, value: r, delayMs: 250, style: { order: 1, flex: '1 1 auto', minWidth: 0 }, className: 'msp-form-control', onEnter: this.props.onEnter, blurOnEnter: true, blurOnEscape: true }), (0, jsx_runtime_1.jsx)(common_1.TextInput, { onChange: this.onG, numeric: true, value: g, delayMs: 250, style: { order: 2, flex: '1 1 auto', minWidth: 0 }, className: 'msp-form-control', onEnter: this.props.onEnter, blurOnEnter: true, blurOnEscape: true }), (0, jsx_runtime_1.jsx)(common_1.TextInput, { onChange: this.onB, numeric: true, value: b, delayMs: 250, style: { order: 3, flex: '1 1 auto', minWidth: 0 }, className: 'msp-form-control', onEnter: this.props.onEnter, blurOnEnter: true, blurOnEscape: true }), (0, jsx_runtime_1.jsx)("input", { onInput: this.onRGB, type: 'color', value: color_1.Color.toHexStyle(this.props.value), style: { order: 4, flex: '1 1 auto', minWidth: '32px', width: '32px', height: '32px', padding: '0 2px 0 2px', background: 'none', border: 'none', cursor: 'pointer' } })] }) }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', textAlignLast: 'center' }, children: [(0, jsx_runtime_1.jsx)(common_1.Button, { onClick: this.onLighten, style: { order: 1, flex: '1 1 auto', minWidth: 0 }, className: 'msp-form-control', children: "Lighten" }), (0, jsx_runtime_1.jsx)(common_1.Button, { onClick: this.onDarken, style: { order: 1, flex: '1 1 auto', minWidth: 0 }, className: 'msp-form-control', children: "Darken" })] })] });
        if (this.props.hideNameRow) {
            return inner;
        }
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(common_1.ControlRow, { title: this.props.param.description, label: label, control: (0, jsx_runtime_1.jsx)(common_1.Button, { onClick: this.toggleExpanded, inline: true, className: 'msp-combined-color-button', style: { background: color_1.Color.toStyle(this.props.value) } }) }), this.state.isExpanded && (0, jsx_runtime_1.jsx)("div", { className: 'msp-control-offset', children: inner })] });
    }
}
exports.CombinedColorControl = CombinedColorControl;
let _colors = void 0;
function ColorOptions() {
    if (_colors)
        return _colors;
    _colors = (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: swatches_1.DefaultColorSwatch.map(v => (0, jsx_runtime_1.jsx)("option", { value: v[1], style: { background: `${color_1.Color.toStyle(v[1])}` }, children: (0, string_1.stringToWords)(v[0]) }, v[1])) });
    return _colors;
}
const DefaultColorSwatchMap = (function () {
    const map = new Map();
    for (const v of swatches_1.DefaultColorSwatch)
        map.set(v[1], v[0]);
    return map;
})();
function ColorValueOption(color) {
    return !DefaultColorSwatchMap.has(color) ? (0, jsx_runtime_1.jsx)("option", { value: color, style: { background: `${color_1.Color.toStyle(color)}` }, children: color_1.Color.toRgbString(color) }, color_1.Color.toHexString(color)) : null;
}
