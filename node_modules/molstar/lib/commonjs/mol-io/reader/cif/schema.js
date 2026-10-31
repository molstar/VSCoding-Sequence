"use strict";
/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldPath = void 0;
exports.toDatabaseCollection = toDatabaseCollection;
exports.toDatabase = toDatabase;
exports.toTable = toTable;
const tslib_1 = require("tslib");
const db_1 = require("../../../mol-data/db");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const mol_util_1 = require("../../../mol-util");
const Data = tslib_1.__importStar(require("./data-model"));
var FieldPath;
(function (FieldPath) {
    function canonical(path) {
        return path.replace('.', '_').replace(/\[/, '_').replace(/(\[|\])/g, '');
    }
    FieldPath.canonical = canonical;
    function equal(pathA, pathB) {
        return canonical(pathA) === canonical(pathB);
    }
    FieldPath.equal = equal;
    function create(category, field, asCanonical = false) {
        const p = `${category}${field ? `.${field}` : ''}`;
        return asCanonical ? canonical(p) : p;
    }
    FieldPath.create = create;
})(FieldPath || (exports.FieldPath = FieldPath = {}));
function toDatabaseCollection(schema, file, aliases) {
    const dbc = {};
    for (const data of file.blocks) {
        dbc[data.header] = toDatabase(schema, data, aliases);
    }
    return dbc;
}
function toDatabase(schema, frame, aliases) {
    return createDatabase(schema, frame, aliases);
}
function toTable(schema, category) {
    return new CategoryTable(category, schema, true);
}
function getColumnCtor(t) {
    switch (t.valueType) {
        case 'str': return (f, c, k) => createStringColumn(t, f, f.str, f.toStringArray);
        case 'int': return (f, c, k) => createColumn(t, f, f.int, f.toIntArray);
        case 'float': return (f, c, k) => createColumn(t, f, f.float, f.toFloatArray);
        case 'list': throw new Error('Use createListColumn instead.');
        case 'tensor': throw new Error('Use createTensorColumn instead.');
    }
}
function createStringColumn(schema, field, value, toArray) {
    return {
        schema,
        __array: field.__array,
        isDefined: field.isDefined,
        rowCount: field.rowCount,
        value: schema.transform === 'lowercase'
            ? row => value(row).toLowerCase()
            : schema.transform === 'uppercase'
                ? row => value(row).toUpperCase()
                : value,
        valueKind: field.valueKind,
        areValuesEqual: field.areValuesEqual,
        toArray: schema.transform === 'lowercase'
            ? p => Array.from(toArray(p)).map(x => x.toLowerCase())
            : schema.transform === 'uppercase'
                ? p => Array.from(toArray(p)).map(x => x.toUpperCase())
                : toArray,
    };
}
function createColumn(schema, field, value, toArray) {
    return {
        schema,
        __array: field.__array,
        isDefined: field.isDefined,
        rowCount: field.rowCount,
        value,
        valueKind: field.valueKind,
        areValuesEqual: field.areValuesEqual,
        toArray
    };
}
function createListColumn(schema, category, key) {
    const separator = schema.separator;
    const itemParse = schema.itemParse;
    const f = category.getField(key);
    const value = f ? (row) => f.str(row).split(separator).map(x => itemParse(x.trim())).filter(x => !!x) : (row) => [];
    const toArray = params => db_1.ColumnHelpers.createAndFillArray(category.rowCount, value, params);
    return {
        schema,
        __array: void 0,
        isDefined: !!f,
        rowCount: category.rowCount,
        value,
        valueKind: f ? f.valueKind : () => 1 /* Column.ValueKinds.NotPresent */,
        areValuesEqual: (rowA, rowB) => (0, mol_util_1.arrayEqual)(value(rowA), value(rowB)),
        toArray
    };
}
function createTensorColumn(schema, category, key) {
    const space = schema.space;
    const zeroOffset = (category.fieldNames.includes(`${key}[0]`) ||
        category.fieldNames.includes(`${key}[0][0]`) ||
        category.fieldNames.includes(`${key}[0][0][0]`));
    const fst = zeroOffset ? 0 : 1;
    const namingVariant = (category.fieldNames.includes(`${key}_1`) ||
        category.fieldNames.includes(`${key}_11`) ||
        category.fieldNames.includes(`${key}_111`)) ? 'underscore' : 'brackets';
    const getName = Data.tensorFieldNameGetter(key, space.rank, zeroOffset, namingVariant);
    const first = category.getField(getName(fst, fst, fst)) || db_1.Column.Undefined(category.rowCount, schema);
    const value = (row) => Data.getTensor(category, space, row, getName);
    const toArray = params => db_1.ColumnHelpers.createAndFillArray(category.rowCount, value, params);
    return {
        schema,
        __array: void 0,
        isDefined: first.isDefined,
        rowCount: category.rowCount,
        value,
        valueKind: first.valueKind,
        areValuesEqual: (rowA, rowB) => linear_algebra_1.Tensor.areEqualExact(value(rowA), value(rowB)),
        toArray
    };
}
class CategoryTable {
    constructor(category, schema, _isDefined) {
        this._isDefined = _isDefined;
        const fieldKeys = Object.keys(schema);
        this._rowCount = category.rowCount;
        this._columns = fieldKeys;
        this._schema = schema;
        const cache = Object.create(null);
        for (const k of fieldKeys) {
            Object.defineProperty(this, k, {
                get: function () {
                    if (cache[k])
                        return cache[k];
                    const fType = schema[k];
                    if (fType.valueType === 'list') {
                        cache[k] = createListColumn(fType, category, k);
                    }
                    else if (fType.valueType === 'tensor') {
                        cache[k] = createTensorColumn(fType, category, k);
                    }
                    else {
                        const ctor = getColumnCtor(fType);
                        const field = category.getField(k);
                        cache[k] = !!field ? ctor(field, category, k) : db_1.Column.Undefined(category.rowCount, fType);
                    }
                    return cache[k];
                },
                enumerable: true,
                configurable: false
            });
        }
    }
}
function createDatabase(schema, frame, aliases) {
    const tables = Object.create(null);
    for (const k of Object.keys(schema)) {
        tables[k] = createTable(k, schema[k], frame, aliases);
    }
    return db_1.Database.ofTables(frame.header, schema, tables);
}
function flattenFrame(frame) {
    const flatFrame = Object.create(null);
    for (const c of Object.keys(frame.categories)) {
        for (const f of frame.categories[c].fieldNames) {
            const p = FieldPath.create(c, f, true);
            flatFrame[p] = frame.categories[c].getField(f);
        }
    }
    return flatFrame;
}
function getField(field, category, flatFrame, aliases) {
    const path = FieldPath.create(category, field);
    const canonicalPath = FieldPath.canonical(path);
    if (canonicalPath in flatFrame)
        return flatFrame[canonicalPath];
    if (aliases && path in aliases) {
        for (const aliased of aliases[path]) {
            const canonicalAliased = FieldPath.canonical(aliased);
            if (canonicalAliased in flatFrame)
                return flatFrame[canonicalAliased];
        }
    }
}
function createTable(key, schema, frame, aliases) {
    let cat = frame.categories[key];
    if (aliases) {
        const flatFrame = flattenFrame(frame);
        const fields = Object.create(null);
        const fieldNames = [];
        let rowCount = 0;
        for (const k of Object.keys(schema)) {
            const field = getField(k, key, flatFrame, aliases);
            if (field) {
                fields[k] = field;
                fieldNames.push(k);
                rowCount = field.rowCount;
            }
        }
        cat = {
            rowCount,
            name: key,
            fieldNames: [...fieldNames],
            getField(name) {
                return fields[name];
            }
        };
    }
    return new CategoryTable(cat || Data.CifCategory.empty(key), schema, !!cat);
}
