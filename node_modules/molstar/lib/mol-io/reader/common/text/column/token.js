/**
 * Copyright (c) 2017-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ColumnHelpers } from '../../../../../mol-data/db';
import { parseInt as fastParseInt, parseFloat as fastParseFloat } from '../number-parser';
export function TokenColumnProvider(tokens) {
    return function (type) {
        return TokenColumn(tokens, type);
    };
}
export function TokenColumn(tokens, schema) {
    const { data, indices, count: rowCount } = tokens;
    const { valueType: type } = schema;
    const value = type === 'str'
        ? row => data.substring(indices[2 * row], indices[2 * row + 1])
        : type === 'int'
            ? row => fastParseInt(data, indices[2 * row], indices[2 * row + 1]) || 0
            : row => fastParseFloat(data, indices[2 * row], indices[2 * row + 1]) || 0;
    return {
        schema: schema,
        __array: void 0,
        isDefined: true,
        rowCount,
        value,
        valueKind: row => 0 /* Column.ValueKinds.Present */,
        toArray: params => ColumnHelpers.createAndFillArray(rowCount, value, params),
        areValuesEqual: areValuesEqualProvider(tokens)
    };
}
export function areValuesEqualProvider(tokens) {
    const { data, indices } = tokens;
    return function (rowA, rowB) {
        const aS = indices[2 * rowA], bS = indices[2 * rowB];
        const len = indices[2 * rowA + 1] - aS;
        if (len !== indices[2 * rowB + 1] - bS)
            return false;
        for (let i = 0; i < len; i++) {
            if (data.charCodeAt(i + aS) !== data.charCodeAt(i + bS)) {
                return false;
            }
        }
        return true;
    };
}
export function areTokensEmpty(tokens) {
    const { count, indices } = tokens;
    for (let i = 0; i < count; ++i) {
        if (indices[2 * i] !== indices[2 * i + 1])
            return false;
    }
    return true;
}
