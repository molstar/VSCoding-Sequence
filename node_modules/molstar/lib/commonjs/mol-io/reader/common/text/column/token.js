"use strict";
/**
 * Copyright (c) 2017-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenColumnProvider = TokenColumnProvider;
exports.TokenColumn = TokenColumn;
exports.areValuesEqualProvider = areValuesEqualProvider;
exports.areTokensEmpty = areTokensEmpty;
const db_1 = require("../../../../../mol-data/db");
const number_parser_1 = require("../number-parser");
function TokenColumnProvider(tokens) {
    return function (type) {
        return TokenColumn(tokens, type);
    };
}
function TokenColumn(tokens, schema) {
    const { data, indices, count: rowCount } = tokens;
    const { valueType: type } = schema;
    const value = type === 'str'
        ? row => data.substring(indices[2 * row], indices[2 * row + 1])
        : type === 'int'
            ? row => (0, number_parser_1.parseInt)(data, indices[2 * row], indices[2 * row + 1]) || 0
            : row => (0, number_parser_1.parseFloat)(data, indices[2 * row], indices[2 * row + 1]) || 0;
    return {
        schema: schema,
        __array: void 0,
        isDefined: true,
        rowCount,
        value,
        valueKind: row => 0 /* Column.ValueKinds.Present */,
        toArray: params => db_1.ColumnHelpers.createAndFillArray(rowCount, value, params),
        areValuesEqual: areValuesEqualProvider(tokens)
    };
}
function areValuesEqualProvider(tokens) {
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
function areTokensEmpty(tokens) {
    const { count, indices } = tokens;
    for (let i = 0; i < count; ++i) {
        if (indices[2 * i] !== indices[2 * i + 1])
            return false;
    }
    return true;
}
