/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Table } from './table';
var Database;
(function (Database) {
    function ofTables(name, schema, tables) {
        const keys = Object.keys(tables);
        const ret = Object.create(null);
        const tableNames = [];
        ret._name = name;
        ret._tableNames = tableNames;
        ret._schema = schema;
        for (const k of keys) {
            if (!Table.is(tables[k]))
                continue;
            ret[k] = tables[k];
            tableNames[tableNames.length] = k;
        }
        return ret;
    }
    Database.ofTables = ofTables;
    function getTablesAsRows(database) {
        const ret = {};
        for (const k of database._tableNames) {
            ret[k] = Table.getRows(database[k]);
        }
        return ret;
    }
    Database.getTablesAsRows = getTablesAsRows;
})(Database || (Database = {}));
export { Database };
