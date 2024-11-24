/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Table } from './table';
/** A collection of tables */
type Database<Schema extends Database.Schema> = {
    readonly _name: string;
    readonly _tableNames: ReadonlyArray<string>;
    readonly _schema: Schema;
} & Database.Tables<Schema>;
declare namespace Database {
    type Tables<S extends Schema> = {
        [T in keyof S]: Table<S[T]>;
    };
    type Schema = {
        [table: string]: Table.Schema;
    };
    function ofTables<S extends Schema>(name: string, schema: Schema, tables: Tables<S>): any;
    function getTablesAsRows<S extends Schema>(database: Database<S>): {
        [k: string]: Table.Row<any>[];
    };
}
export { Database };
