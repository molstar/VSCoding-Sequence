/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { ColumnHelpers } from '../../../../../mol-data/db';
import { trimStr } from '../tokenizer';
import { parseIntSkipLeadingWhitespace, parseFloatSkipLeadingWhitespace } from '../number-parser';
export function FixedColumnProvider(lines) {
    return function (offset, width, type) {
        return FixedColumn(lines, offset, width, type);
    };
}
export function FixedColumn(lines, offset, width, schema) {
    const { data, indices, count: rowCount } = lines;
    const { valueType: type } = schema;
    const value = type === 'str' ? row => {
        const s = indices[2 * row] + offset, le = indices[2 * row + 1];
        if (s >= le)
            return '';
        let e = s + width;
        if (e > le)
            e = le;
        return trimStr(data, s, e);
    } : type === 'int' ? row => {
        const s = indices[2 * row] + offset;
        if (s > indices[2 * row + 1])
            return 0;
        return parseIntSkipLeadingWhitespace(data, s, s + width);
    } : row => {
        const s = indices[2 * row] + offset;
        if (s > indices[2 * row + 1])
            return 0;
        return parseFloatSkipLeadingWhitespace(data, s, s + width);
    };
    return {
        schema: schema,
        __array: void 0,
        isDefined: true,
        rowCount,
        value,
        valueKind: row => 0 /* Column.ValueKinds.Present */,
        toArray: params => ColumnHelpers.createAndFillArray(rowCount, value, params),
        areValuesEqual: (rowA, rowB) => value(rowA) === value(rowB)
    };
}
