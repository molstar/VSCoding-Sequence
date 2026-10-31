"use strict";
/**
 * Copyright (c) 2017-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CifField = void 0;
exports.CifFile = CifFile;
exports.CifBlock = CifBlock;
exports.CifSaveFrame = CifSaveFrame;
exports.CifCategory = CifCategory;
exports.tensorFieldNameGetter = tensorFieldNameGetter;
exports.getTensor = getTensor;
exports.getCifFieldType = getCifFieldType;
const db_1 = require("../../../mol-data/db");
const number_parser_1 = require("../common/text/number-parser");
const token_1 = require("../common/text/column/token");
function CifFile(blocks, name) {
    return { name, blocks: blocks };
}
function CifBlock(categoryNames, categories, header, saveFrames = []) {
    return {
        categoryNames, header, categories, saveFrames,
        getField(name) {
            const [category, field] = name.split('.');
            return categories[category].getField(field || '');
        }
    };
}
function CifSaveFrame(categoryNames, categories, header) {
    return { categoryNames, header, categories };
}
function CifCategory(name, rowCount, fieldNames, fields) {
    return { rowCount, name, fieldNames: [...fieldNames], getField(name) { return fields[name]; } };
}
(function (CifCategory) {
    function empty(name) {
        return { rowCount: 0, name, fieldNames: [], getField(name) { return void 0; } };
    }
    CifCategory.empty = empty;
    ;
    function ofFields(name, fields) {
        const fieldNames = Object.keys(fields);
        return {
            rowCount: fieldNames.length > 0 ? fields[fieldNames[0]].rowCount : 0,
            name,
            fieldNames,
            getField(name) { return fields[name]; }
        };
    }
    CifCategory.ofFields = ofFields;
    function ofTable(name, table) {
        const fields = {};
        for (const name of table._columns) {
            fields[name] = CifField.ofColumn(table[name]);
        }
        return ofFields(name, fields);
    }
    CifCategory.ofTable = ofTable;
})(CifCategory || (exports.CifCategory = CifCategory = {}));
var CifField;
(function (CifField) {
    function ofString(value) {
        return ofStrings([value]);
    }
    CifField.ofString = ofString;
    function ofStrings(values) {
        const rowCount = values.length;
        const str = row => { const ret = values[row]; if (!ret || ret === '.' || ret === '?')
            return ''; return ret; };
        const int = row => { const v = values[row]; return (0, number_parser_1.parseInt)(v, 0, v.length) || 0; };
        const float = row => { const v = values[row]; return (0, number_parser_1.parseFloat)(v, 0, v.length) || 0; };
        const valueKind = row => {
            const v = values[row], l = v.length;
            if (l > 1)
                return 0 /* Column.ValueKinds.Present */;
            if (l === 0)
                return 1 /* Column.ValueKinds.NotPresent */;
            const c = v.charCodeAt(0);
            if (c === 46 /* . */)
                return 1 /* Column.ValueKinds.NotPresent */;
            if (c === 63 /* ? */)
                return 2 /* Column.ValueKinds.Unknown */;
            return 0 /* Column.ValueKinds.Present */;
        };
        return {
            __array: void 0,
            binaryEncoding: void 0,
            isDefined: true,
            rowCount,
            str,
            int,
            float,
            valueKind,
            areValuesEqual: (rowA, rowB) => values[rowA] === values[rowB],
            toStringArray: params => params ? db_1.ColumnHelpers.createAndFillArray(rowCount, str, params) : values,
            toIntArray: params => db_1.ColumnHelpers.createAndFillArray(rowCount, int, params),
            toFloatArray: params => db_1.ColumnHelpers.createAndFillArray(rowCount, float, params)
        };
    }
    CifField.ofStrings = ofStrings;
    function ofNumbers(values) {
        const rowCount = values.length;
        const str = row => { return '' + values[row]; };
        const float = row => values[row];
        const valueKind = row => 0 /* Column.ValueKinds.Present */;
        const toFloatArray = (params) => {
            if (!params || params.array && values instanceof params.array) {
                return values;
            }
            else {
                return db_1.ColumnHelpers.createAndFillArray(rowCount, float, params);
            }
        };
        return {
            __array: void 0,
            binaryEncoding: void 0,
            isDefined: true,
            rowCount,
            str,
            int: float,
            float,
            valueKind,
            areValuesEqual: (rowA, rowB) => values[rowA] === values[rowB],
            toStringArray: params => db_1.ColumnHelpers.createAndFillArray(rowCount, str, params),
            toIntArray: toFloatArray,
            toFloatArray
        };
    }
    CifField.ofNumbers = ofNumbers;
    function ofTokens(tokens) {
        const { data, indices, count: rowCount } = tokens;
        const str = row => {
            const ret = data.substring(indices[2 * row], indices[2 * row + 1]);
            if (ret === '.' || ret === '?')
                return '';
            return ret;
        };
        const int = row => {
            return (0, number_parser_1.parseInt)(data, indices[2 * row], indices[2 * row + 1]) || 0;
        };
        const float = row => {
            return (0, number_parser_1.parseFloat)(data, indices[2 * row], indices[2 * row + 1]) || 0;
        };
        const valueKind = row => {
            const s = indices[2 * row], l = indices[2 * row + 1] - s;
            if (l > 1)
                return 0 /* Column.ValueKinds.Present */;
            if (l === 0)
                return 1 /* Column.ValueKinds.NotPresent */;
            const v = data.charCodeAt(s);
            if (v === 46 /* . */)
                return 1 /* Column.ValueKinds.NotPresent */;
            if (v === 63 /* ? */)
                return 2 /* Column.ValueKinds.Unknown */;
            return 0 /* Column.ValueKinds.Present */;
        };
        return {
            __array: void 0,
            binaryEncoding: void 0,
            isDefined: true,
            rowCount,
            str,
            int,
            float,
            valueKind,
            areValuesEqual: (0, token_1.areValuesEqualProvider)(tokens),
            toStringArray: params => db_1.ColumnHelpers.createAndFillArray(rowCount, str, params),
            toIntArray: params => db_1.ColumnHelpers.createAndFillArray(rowCount, int, params),
            toFloatArray: params => db_1.ColumnHelpers.createAndFillArray(rowCount, float, params)
        };
    }
    CifField.ofTokens = ofTokens;
    function ofColumn(column) {
        const { rowCount, valueKind, areValuesEqual, isDefined } = column;
        let str;
        let int;
        let float;
        switch (column.schema.valueType) {
            case 'float':
            case 'int':
                str = row => { return '' + column.value(row); };
                int = column.value;
                float = column.value;
                break;
            case 'str':
                str = column.value;
                int = row => { const v = column.value(row); return (0, number_parser_1.parseInt)(v, 0, v.length) || 0; };
                float = row => { const v = column.value(row); return (0, number_parser_1.parseFloat)(v, 0, v.length) || 0; };
                break;
            case 'list':
                const { separator } = column.schema;
                str = row => column.value(row).join(separator);
                int = row => NaN;
                float = row => NaN;
                break;
            default:
                throw new Error(`unsupported valueType '${column.schema.valueType}'`);
        }
        return {
            __array: void 0,
            binaryEncoding: void 0,
            isDefined,
            rowCount,
            str,
            int,
            float,
            valueKind,
            areValuesEqual,
            toStringArray: params => db_1.ColumnHelpers.createAndFillArray(rowCount, str, params),
            toIntArray: params => db_1.ColumnHelpers.createAndFillArray(rowCount, int, params),
            toFloatArray: params => db_1.ColumnHelpers.createAndFillArray(rowCount, float, params)
        };
    }
    CifField.ofColumn = ofColumn;
    function ofUndefined(rowCount, schema) {
        return ofColumn(db_1.Column.Undefined(rowCount, schema));
    }
    CifField.ofUndefined = ofUndefined;
})(CifField || (exports.CifField = CifField = {}));
function tensorFieldNameGetter(field, rank, zeroIndexed, namingVariant) {
    const offset = zeroIndexed ? 0 : 1;
    switch (rank) {
        case 1:
            return namingVariant === 'brackets'
                ? (i) => `${field}[${i + offset}]`
                : (i) => `${field}_${i + offset}`;
        case 2:
            return namingVariant === 'brackets'
                ? (i, j) => `${field}[${i + offset}][${j + offset}]`
                : (i, j) => `${field}_${i + offset}${j + offset}`;
        case 3:
            return namingVariant === 'brackets'
                ? (i, j, k) => `${field}[${i + offset}][${j + offset}][${k + offset}]`
                : (i, j, k) => `${field}_${i + offset}${j + offset}${k + offset}`;
        default:
            throw new Error('Tensors with rank > 3 or rank 0 are currently not supported.');
    }
}
function getTensor(category, space, row, getName) {
    const ret = space.create();
    if (space.rank === 1) {
        const rows = space.dimensions[0];
        for (let i = 0; i < rows; i++) {
            const f = category.getField(getName(i));
            space.set(ret, i, !!f ? f.float(row) : 0.0);
        }
    }
    else if (space.rank === 2) {
        const rows = space.dimensions[0], cols = space.dimensions[1];
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const f = category.getField(getName(i, j));
                space.set(ret, i, j, !!f ? f.float(row) : 0.0);
            }
        }
    }
    else if (space.rank === 3) {
        const d0 = space.dimensions[0], d1 = space.dimensions[1], d2 = space.dimensions[2];
        for (let i = 0; i < d0; i++) {
            for (let j = 0; j < d1; j++) {
                for (let k = 0; k < d2; k++) {
                    const f = category.getField(getName(i, j, k));
                    space.set(ret, i, j, k, !!f ? f.float(row) : 0.0);
                }
            }
        }
    }
    else {
        throw new Error('Tensors with rank > 3 or rank 0 are currently not supported.');
    }
    return ret;
}
function getCifFieldType(field) {
    let floatCount = 0, hasStringOrScientific = false, undefinedCount = 0;
    for (let i = 0, _i = field.rowCount; i < _i; i++) {
        const k = field.valueKind(i);
        if (k !== 0 /* Column.ValueKinds.Present */) {
            undefinedCount++;
            continue;
        }
        const type = (0, number_parser_1.getNumberType)(field.str(i));
        if (type === 0 /* NumberTypes.Int */)
            continue;
        else if (type === 1 /* NumberTypes.Float */)
            floatCount++;
        else {
            hasStringOrScientific = true;
            break;
        }
    }
    // numbers in scientific notation and plain text are not distinguishable
    if (hasStringOrScientific || undefinedCount === field.rowCount)
        return db_1.Column.Schema.str;
    if (floatCount > 0)
        return db_1.Column.Schema.float;
    return db_1.Column.Schema.int;
}
