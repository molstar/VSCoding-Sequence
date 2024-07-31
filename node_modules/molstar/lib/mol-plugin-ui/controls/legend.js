import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Color } from '../../mol-util/color';
import * as React from 'react';
export function legendFor(legend) {
    switch (legend.kind) {
        case 'scale-legend': return ScaleLegend;
        case 'table-legend': return TableLegend;
        default:
            const _ = legend;
            console.warn(`${_} has no associated UI component`);
            return void 0;
    }
}
export class ScaleLegend extends React.PureComponent {
    render() {
        const { legend } = this.props;
        const colors = legend.colors.map(c => Array.isArray(c) ? `${Color.toStyle(c[0])} ${100 * c[1]}%` : Color.toStyle(c)).join(', ');
        return _jsx("div", { className: 'msp-scale-legend', children: _jsxs("div", { style: { background: `linear-gradient(to right, ${colors})` }, children: [_jsx("span", { style: { float: 'left' }, children: legend.minLabel }), _jsx("span", { style: { float: 'right' }, children: legend.maxLabel })] }) });
    }
}
export class TableLegend extends React.PureComponent {
    render() {
        const { legend } = this.props;
        return _jsx("div", { className: 'msp-table-legend', children: legend.table.map((value, i) => {
                const [name, color] = value;
                return _jsxs("div", { children: [_jsx("div", { className: 'msp-table-legend-color', style: { backgroundColor: Color.toStyle(color) } }), _jsx("div", { className: 'msp-table-legend-text', children: name })] }, i);
            }) });
    }
}
