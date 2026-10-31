/**
 * Copyright (c) 2017-2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Iterator } from '../../../mol-data/iterator';
import { ArrayEncoding } from '../../common/binary-cif';
import { assertUnreachable } from '../../../mol-util/type-helpers';
export var Field;
(function (Field) {
    function str(name, value, params) {
        return { name, type: 0 /* Type.Str */, value, valueKind: params && params.valueKind, defaultFormat: params && params.encoder ? { encoder: params.encoder } : void 0, shouldInclude: params && params.shouldInclude };
    }
    Field.str = str;
    function int(name, value, params) {
        return {
            name,
            type: 1 /* Type.Int */,
            value,
            valueKind: params && params.valueKind,
            defaultFormat: params ? { encoder: params.encoder, typedArray: params.typedArray } : void 0,
            shouldInclude: params && params.shouldInclude
        };
    }
    Field.int = int;
    function float(name, value, params) {
        return {
            name,
            type: 2 /* Type.Float */,
            value,
            valueKind: params && params.valueKind,
            defaultFormat: params ? { encoder: params.encoder, typedArray: params.typedArray, digitCount: typeof params.digitCount !== 'undefined' ? params.digitCount : void 0 } : void 0,
            shouldInclude: params && params.shouldInclude
        };
    }
    Field.float = float;
    function index(name) {
        return int(name, (e, d, i) => i + 1, { typedArray: Int32Array, encoder: ArrayEncoding.by(ArrayEncoding.delta).and(ArrayEncoding.runLength).and(ArrayEncoding.integerPacking) });
    }
    Field.index = index;
    class Builder {
        constructor() {
            this.fields = [];
        }
        index(name) {
            this.fields.push(Field.index(name));
            return this;
        }
        str(name, value, params) {
            this.fields.push(Field.str(name, value, params));
            return this;
        }
        int(name, value, params) {
            this.fields.push(Field.int(name, value, params));
            return this;
        }
        vec(name, values, params) {
            for (let i = 0; i < values.length; i++) {
                this.fields.push(Field.int(`${name}[${i + 1}]`, values[i], params));
            }
            return this;
        }
        float(name, value, params) {
            this.fields.push(Field.float(name, value, params));
            return this;
        }
        many(fields) {
            for (let i = 0; i < fields.length; i++)
                this.fields.push(fields[i]);
            return this;
        }
        add(field) {
            this.fields.push(field);
            return this;
        }
        getFields() { return this.fields; }
    }
    Field.Builder = Builder;
    function build() {
        return new Builder();
    }
    Field.build = build;
})(Field || (Field = {}));
export var Category;
(function (Category) {
    Category.Empty = { fields: [], source: [] };
    function filterOf(directives) {
        const cat_whitelist = [];
        const cat_blacklist = [];
        const field_whitelist = [];
        const field_blacklist = [];
        for (let d of directives.split(/[\r\n]+/)) {
            d = d.trim();
            // allow for empty lines in config
            if (d.length === 0)
                continue;
            // let ! denote blacklisted entries
            const blacklist = /^!/.test(d);
            if (blacklist)
                d = d.substr(1);
            const split = d.split(/\./);
            const field = split[1];
            const list = blacklist ? (field ? field_blacklist : cat_blacklist) : (field ? field_whitelist : cat_whitelist);
            list[list.length] = d;
            // ensure categories are aware about whitelisted columns
            if (field && !cat_whitelist.includes(split[0])) {
                cat_whitelist[cat_whitelist.length] = split[0];
            }
        }
        const wlcatcol = field_whitelist.map(it => it.split('.')[0]);
        // blacklist has higher priority
        return {
            includeCategory(cat) {
                // block if category in black
                if (cat_blacklist.includes(cat)) {
                    return false;
                }
                else {
                    // if there is a whitelist, the category has to be explicitly allowed
                    return cat_whitelist.length <= 0 ||
                        // otherwise include if whitelist contains category
                        cat_whitelist.indexOf(cat) !== -1;
                }
            },
            includeField(cat, field) {
                // column names are assumed to follow the pattern 'category_name.column_name'
                const full = cat + '.' + field;
                if (field_blacklist.includes(full)) {
                    return false;
                }
                else {
                    // if for this category no whitelist entries exist
                    return !wlcatcol.includes(cat) ||
                        // otherwise must be specifically allowed
                        field_whitelist.includes(full);
                }
            }
        };
    }
    Category.filterOf = filterOf;
    Category.DefaultFilter = {
        includeCategory(cat) { return true; },
        includeField(cat, field) { return true; }
    };
    Category.DefaultFormatter = {
        getFormat(cat, field) { return void 0; }
    };
    function ofTable(table, indices) {
        if (indices) {
            return {
                fields: cifFieldsFromTableSchema(table._schema),
                source: [{ data: table, rowCount: indices.length, keys: () => Iterator.Array(indices) }]
            };
        }
        return {
            fields: cifFieldsFromTableSchema(table._schema),
            source: [{ data: table, rowCount: table._rowCount }]
        };
    }
    Category.ofTable = ofTable;
})(Category || (Category = {}));
export var Encoder;
(function (Encoder) {
    function writeDatabase(encoder, name, database) {
        encoder.startDataBlock(name);
        for (const table of database._tableNames) {
            encoder.writeCategory({ name: table, instance: () => Category.ofTable(database[table]) });
        }
    }
    Encoder.writeDatabase = writeDatabase;
    function writeDatabaseCollection(encoder, collection) {
        for (const name of Object.keys(collection)) {
            writeDatabase(encoder, name, collection[name]);
        }
    }
    Encoder.writeDatabaseCollection = writeDatabaseCollection;
})(Encoder || (Encoder = {}));
function columnValue(k) {
    return (i, d) => d[k].value(i);
}
function columnListValue(k) {
    return (i, d) => d[k].value(i).join(d[k].schema.separator);
}
function columnTensorValue(k, ...coords) {
    return (i, d) => d[k].schema.space.get(d[k].value(i), ...coords);
}
function columnValueKind(k) {
    return (i, d) => d[k].valueKind(i);
}
function getTensorDefinitions(field, space) {
    const fieldDefinitions = [];
    const type = 2 /* Field.Type.Float */;
    const valueKind = columnValueKind(field);
    if (space.rank === 1) {
        const rows = space.dimensions[0];
        for (let i = 0; i < rows; i++) {
            const name = `${field}[${i + 1}]`;
            fieldDefinitions.push({ name, type, value: columnTensorValue(field, i), valueKind });
        }
    }
    else if (space.rank === 2) {
        const rows = space.dimensions[0], cols = space.dimensions[1];
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const name = `${field}[${i + 1}][${j + 1}]`;
                fieldDefinitions.push({ name, type, value: columnTensorValue(field, i, j), valueKind });
            }
        }
    }
    else if (space.rank === 3) {
        const d0 = space.dimensions[0], d1 = space.dimensions[1], d2 = space.dimensions[2];
        for (let i = 0; i < d0; i++) {
            for (let j = 0; j < d1; j++) {
                for (let k = 0; k < d2; k++) {
                    const name = `${field}[${i + 1}][${j + 1}][${k + 1}]`;
                    fieldDefinitions.push({ name, type, value: columnTensorValue(field, i, j, k), valueKind });
                }
            }
        }
    }
    else {
        throw new Error('Tensors with rank > 3 or rank 0 are currently not supported.');
    }
    return fieldDefinitions;
}
function cifFieldsFromTableSchema(schema) {
    const fields = [];
    for (const k of Object.keys(schema)) {
        const t = schema[k];
        if (t.valueType === 'int') {
            fields.push({ name: k, type: 1 /* Field.Type.Int */, value: columnValue(k), valueKind: columnValueKind(k) });
        }
        else if (t.valueType === 'float') {
            fields.push({ name: k, type: 2 /* Field.Type.Float */, value: columnValue(k), valueKind: columnValueKind(k) });
        }
        else if (t.valueType === 'str') {
            fields.push({ name: k, type: 0 /* Field.Type.Str */, value: columnValue(k), valueKind: columnValueKind(k) });
        }
        else if (t.valueType === 'list') {
            fields.push({ name: k, type: 0 /* Field.Type.Str */, value: columnListValue(k), valueKind: columnValueKind(k) });
        }
        else if (t.valueType === 'tensor') {
            fields.push(...getTensorDefinitions(k, t.space));
        }
        else {
            assertUnreachable(t.valueType);
        }
    }
    return fields;
}
