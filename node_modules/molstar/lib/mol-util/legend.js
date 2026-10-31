/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export function TableLegend(table) {
    return { kind: 'table-legend', table };
}
export function ScaleLegend(minLabel, maxLabel, colors) {
    return { kind: 'scale-legend', minLabel, maxLabel, colors };
}
