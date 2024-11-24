"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableLegend = exports.ScaleLegend = void 0;
exports.legendFor = legendFor;
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
const color_1 = require("../../mol-util/color");
const React = tslib_1.__importStar(require("react"));
function legendFor(legend) {
    switch (legend.kind) {
        case 'scale-legend': return ScaleLegend;
        case 'table-legend': return TableLegend;
        default:
            const _ = legend;
            console.warn(`${_} has no associated UI component`);
            return void 0;
    }
}
class ScaleLegend extends React.PureComponent {
    render() {
        const { legend } = this.props;
        const colors = legend.colors.map(c => Array.isArray(c) ? `${color_1.Color.toStyle(c[0])} ${100 * c[1]}%` : color_1.Color.toStyle(c)).join(', ');
        return (0, jsx_runtime_1.jsx)("div", { className: 'msp-scale-legend', children: (0, jsx_runtime_1.jsxs)("div", { style: { background: `linear-gradient(to right, ${colors})` }, children: [(0, jsx_runtime_1.jsx)("span", { style: { float: 'left' }, children: legend.minLabel }), (0, jsx_runtime_1.jsx)("span", { style: { float: 'right' }, children: legend.maxLabel })] }) });
    }
}
exports.ScaleLegend = ScaleLegend;
class TableLegend extends React.PureComponent {
    render() {
        const { legend } = this.props;
        return (0, jsx_runtime_1.jsx)("div", { className: 'msp-table-legend', children: legend.table.map((value, i) => {
                const [name, color] = value;
                return (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: 'msp-table-legend-color', style: { backgroundColor: color_1.Color.toStyle(color) } }), (0, jsx_runtime_1.jsx)("div", { className: 'msp-table-legend-text', children: name })] }, i);
            }) });
    }
}
exports.TableLegend = TableLegend;
