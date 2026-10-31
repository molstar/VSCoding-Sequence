"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const table_1 = require("./table");
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
            if (!table_1.Table.is(tables[k]))
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
            ret[k] = table_1.Table.getRows(database[k]);
        }
        return ret;
    }
    Database.getTablesAsRows = getTablesAsRows;
})(Database || (exports.Database = Database = {}));
