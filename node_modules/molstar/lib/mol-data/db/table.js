/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Column } from './column';
import { sortArray } from '../util/sort';
import { StringBuilder } from '../../mol-util';
/** An immutable table */
var Table;
(function (Table) {
    function is(t) {
        return t && typeof t._rowCount === 'number' && !!t._columns && !!t._schema;
    }
    Table.is = is;
    function pickColumns(schema, table, guard = {}) {
        const ret = Object.create(null);
        const keys = Object.keys(schema);
        ret._rowCount = table._rowCount;
        ret._columns = keys;
        ret._schema = schema;
        for (const k of keys) {
            if (!!table[k])
                ret[k] = table[k];
            else if (!!guard[k])
                ret[k] = guard[k];
            else
                throw Error(`Cannot find column '${k}'.`);
        }
        return ret;
    }
    Table.pickColumns = pickColumns;
    function ofColumns(schema, columns) {
        const _columns = Object.keys(columns);
        const _rowCount = columns[_columns[0]].rowCount;
        return { _rowCount, _columns, _schema: schema, ...columns };
    }
    Table.ofColumns = ofColumns;
    function ofPartialColumns(schema, partialColumns, rowCount) {
        const ret = Object.create(null);
        const columns = Object.keys(schema);
        ret._rowCount = rowCount;
        ret._columns = columns;
        ret._schema = schema;
        for (const k of columns) {
            if (k in partialColumns)
                ret[k] = partialColumns[k];
            else
                ret[k] = Column.Undefined(rowCount, schema[k]);
        }
        return ret;
    }
    Table.ofPartialColumns = ofPartialColumns;
    function ofUndefinedColumns(schema, rowCount) {
        const ret = Object.create(null);
        const columns = Object.keys(schema);
        ret._rowCount = rowCount;
        ret._columns = columns;
        ret._schema = schema;
        for (const k of columns) {
            ret[k] = Column.Undefined(rowCount, schema[k]);
        }
        return ret;
    }
    Table.ofUndefinedColumns = ofUndefinedColumns;
    function ofRows(schema, rows) {
        const ret = Object.create(null);
        const rowCount = rows.length;
        const columns = Object.keys(schema);
        ret._rowCount = rowCount;
        ret._columns = columns;
        ret._schema = schema;
        for (const k of columns) {
            ret[k] = Column.ofLambda({
                rowCount,
                schema: schema[k],
                value: r => rows[r][k],
                valueKind: r => typeof rows[r][k] === 'undefined' ? 1 /* Column.ValueKinds.NotPresent */ : 0 /* Column.ValueKinds.Present */
            });
        }
        return ret;
    }
    Table.ofRows = ofRows;
    function ofArrays(schema, arrays) {
        var _a;
        const ret = Object.create(null);
        const columns = Object.keys(schema);
        ret._rowCount = 0;
        ret._columns = columns;
        ret._schema = schema;
        for (const k of columns) {
            if (typeof arrays[k] !== 'undefined') {
                ret[k] = Column.ofArray({ array: arrays[k], schema: schema[k] });
                ret._rowCount = (_a = arrays[k]) === null || _a === void 0 ? void 0 : _a.length;
            }
            else {
                ret[k] = Column.Undefined(ret._rowCount, schema[k]);
            }
        }
        return ret;
    }
    Table.ofArrays = ofArrays;
    function view(table, schema, view) {
        const ret = Object.create(null);
        const columns = Object.keys(schema);
        ret._rowCount = view.length;
        ret._columns = columns;
        ret._schema = schema;
        for (const k of columns) {
            ret[k] = Column.view(table[k], view);
        }
        return ret;
    }
    Table.view = view;
    function pick(table, schema, test) {
        const _view = [];
        for (let i = 0, il = table._rowCount; i < il; ++i) {
            if (test(i))
                _view.push(i);
        }
        return view(table, schema, _view);
    }
    Table.pick = pick;
    function window(table, schema, start, end) {
        if (start === 0 && end === table._rowCount)
            return table;
        const ret = Object.create(null);
        const columns = Object.keys(schema);
        ret._rowCount = end - start;
        ret._columns = columns;
        ret._schema = schema;
        for (const k of columns) {
            ret[k] = Column.window(table[k], start, end);
        }
        return ret;
    }
    Table.window = window;
    function concat(tables, schema) {
        const ret = Object.create(null);
        const columns = Object.keys(schema);
        ret._rowCount = 0;
        for (const table of tables) {
            ret._rowCount += table._rowCount;
        }
        const arrays = {};
        for (const column of columns) {
            arrays[column] = new Array(ret._rowCount);
        }
        ret._columns = columns;
        ret._schema = schema;
        let offset = 0;
        for (const table of tables) {
            for (const k of columns) {
                Column.copyToArray(table[k], arrays[k], offset);
            }
            offset += table._rowCount;
        }
        for (const k of columns) {
            ret[k] = Column.ofArray({ array: arrays[k], schema: schema[k] });
        }
        return ret;
    }
    Table.concat = concat;
    function columnToArray(table, name, array) {
        table[name] = Column.asArrayColumn(table[name], array);
    }
    Table.columnToArray = columnToArray;
    /** Sort and return a new table */
    function sort(table, cmp) {
        const indices = new Int32Array(table._rowCount);
        for (let i = 0, _i = indices.length; i < _i; i++)
            indices[i] = i;
        sortArray(indices, (_, i, j) => cmp(i, j));
        let isIdentity = true;
        for (let i = 0, _i = indices.length; i < _i; i++) {
            if (indices[i] !== i) {
                isIdentity = false;
                break;
            }
        }
        if (isIdentity)
            return table;
        const ret = Object.create(null);
        ret._rowCount = table._rowCount;
        ret._columns = table._columns;
        ret._schema = table._schema;
        for (const c of table._columns) {
            ret[c] = Column.view(table[c], indices, false);
        }
        return ret;
    }
    Table.sort = sort;
    function areEqual(a, b) {
        if (a._rowCount !== b._rowCount)
            return false;
        if (a._columns.length !== b._columns.length)
            return false;
        for (const c of a._columns) {
            if (!b[c])
                return false;
        }
        for (const c of a._columns) {
            if (!Column.areEqual(a[c], b[c]))
                return false;
        }
        return true;
    }
    Table.areEqual = areEqual;
    /** Allocate a new object with the given row values. */
    function getRow(table, index) {
        const row = Object.create(null);
        const { _columns: cols } = table;
        for (let i = 0; i < cols.length; i++) {
            const c = cols[i];
            row[c] = table[c].value(index);
        }
        return row;
    }
    Table.getRow = getRow;
    /** Pick the first row for which `test` evaluates to true */
    function pickRow(table, test) {
        for (let i = 0, il = table._rowCount; i < il; ++i) {
            if (test(i))
                return getRow(table, i);
        }
    }
    Table.pickRow = pickRow;
    function getRows(table) {
        const ret = [];
        const { _rowCount: c } = table;
        for (let i = 0; i < c; i++) {
            ret[i] = getRow(table, i);
        }
        return ret;
    }
    Table.getRows = getRows;
    function toArrays(table) {
        const arrays = {};
        const { _columns } = table;
        for (let i = 0; i < _columns.length; i++) {
            const c = _columns[i];
            arrays[c] = table[c].toArray();
        }
        return arrays;
    }
    Table.toArrays = toArrays;
    function formatToString(table) {
        const sb = StringBuilder.create();
        const { _columns: cols, _rowCount } = table;
        let headerLength = 1;
        StringBuilder.write(sb, '|');
        for (let i = 0; i < cols.length; i++) {
            StringBuilder.write(sb, cols[i]);
            StringBuilder.write(sb, '|');
            headerLength += cols[i].length + 1;
        }
        StringBuilder.newline(sb);
        StringBuilder.write(sb, new Array(headerLength + 1).join('-'));
        StringBuilder.newline(sb);
        for (let r = 0; r < _rowCount; r++) {
            StringBuilder.write(sb, '|');
            for (let i = 0; i < cols.length; i++) {
                const c = table[cols[i]];
                if (c.valueKind(r) === 0 /* Column.ValueKinds.Present */) {
                    StringBuilder.write(sb, c.value(r));
                    StringBuilder.write(sb, '|');
                }
                else {
                    StringBuilder.write(sb, '.|');
                }
            }
            StringBuilder.newline(sb);
        }
        return StringBuilder.getString(sb);
    }
    Table.formatToString = formatToString;
})(Table || (Table = {}));
export { Table };
