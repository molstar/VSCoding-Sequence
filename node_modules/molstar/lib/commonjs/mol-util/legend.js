"use strict";
/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableLegend = TableLegend;
exports.ScaleLegend = ScaleLegend;
function TableLegend(table) {
    return { kind: 'table-legend', table };
}
function ScaleLegend(minLabel, maxLabel, colors) {
    return { kind: 'scale-legend', minLabel, maxLabel, colors };
}
