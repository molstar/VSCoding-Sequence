"use strict";
/**
 * Copyright (c) 2017-2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Field = Field;
const db_1 = require("../../../../mol-data/db");
const binary_cif_1 = require("../../../common/binary-cif");
const number_parser_1 = require("../../common/text/number-parser");
function Field(column) {
    const mask = column.mask ? (0, binary_cif_1.decode)(column.mask) : void 0;
    const data = (0, binary_cif_1.decode)(column.data);
    const isNumeric = db_1.ColumnHelpers.isTypedArray(data);
    const str = isNumeric
        ? mask
            ? row => mask[row] === 0 /* Column.ValueKinds.Present */ ? '' + data[row] : ''
            : row => '' + data[row]
        : mask
            ? row => mask[row] === 0 /* Column.ValueKinds.Present */ ? data[row] : ''
            : row => data[row];
    const int = isNumeric
        ? row => data[row]
        : row => { const v = data[row]; return (0, number_parser_1.parseInt)(v, 0, v.length); };
    const float = isNumeric
        ? row => data[row]
        : row => { const v = data[row]; return (0, number_parser_1.parseFloat)(v, 0, v.length); };
    const valueKind = mask
        ? row => mask[row]
        : row => 0 /* Column.ValueKinds.Present */;
    const rowCount = data.length;
    return {
        __array: data,
        binaryEncoding: column.data.encoding,
        isDefined: true,
        rowCount,
        str,
        int,
        float,
        valueKind,
        areValuesEqual: (rowA, rowB) => data[rowA] === data[rowB],
        toStringArray: params => db_1.ColumnHelpers.createAndFillArray(rowCount, str, params),
        toIntArray: isNumeric
            ? params => db_1.ColumnHelpers.typedArrayWindow(data, params)
            : params => db_1.ColumnHelpers.createAndFillArray(rowCount, int, params),
        toFloatArray: isNumeric
            ? params => db_1.ColumnHelpers.typedArrayWindow(data, params)
            : params => db_1.ColumnHelpers.createAndFillArray(rowCount, float, params)
    };
}
