/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Column } from './column';
/** A collection of columns */
type Table<Schema extends Table.Schema = any> = {
    readonly _rowCount: number;
    readonly _columns: ReadonlyArray<string>;
    readonly _schema: Schema;
} & Table.Columns<Schema>;
/** An immutable table */
declare namespace Table {
    type Schema = {
        [field: string]: Column.Schema;
    };
    type Columns<S extends Schema> = {
        [C in keyof S]: Column<S[C]['T']>;
    };
    type Row<S extends Schema> = {
        [C in keyof S]: S[C]['T'];
    };
    type Arrays<S extends Schema> = {
        [C in keyof S]: ArrayLike<S[C]['T']>;
    };
    type PartialColumns<S extends Schema> = {
        [C in keyof S]?: Column<S[C]['T']>;
    };
    type PartialTable<S extends Table.Schema> = {
        readonly _rowCount: number;
        readonly _columns: ReadonlyArray<string>;
    } & PartialColumns<S>;
    function is(t: any): t is Table<any>;
    function pickColumns<S extends Schema>(schema: S, table: PartialTable<S>, guard?: Partial<Columns<S>>): Table<S>;
    function ofColumns<S extends Schema, R extends Table<S> = Table<S>>(schema: S, columns: Columns<S>): R;
    function ofPartialColumns<S extends Schema, R extends Table<S> = Table<S>>(schema: S, partialColumns: PartialColumns<S>, rowCount: number): R;
    function ofUndefinedColumns<S extends Schema, R extends Table<S> = Table<S>>(schema: S, rowCount: number): R;
    function ofRows<S extends Schema, R extends Table<S> = Table<S>>(schema: S, rows: ArrayLike<Partial<Row<S>>>): R;
    function ofArrays<S extends Schema, R extends Table<S> = Table<S>>(schema: S, arrays: Partial<Arrays<S>>): R;
    function view<S extends R, R extends Schema>(table: Table<S>, schema: R, view: ArrayLike<number>): Table<R>;
    function pick<S extends R, R extends Schema>(table: Table<S>, schema: R, test: (i: number) => boolean): Table<R>;
    function window<S extends R, R extends Schema>(table: Table<S>, schema: R, start: number, end: number): Table<R>;
    function concat<S extends R, R extends Schema>(tables: Table<S>[], schema: R): Table<R>;
    function columnToArray<S extends Schema>(table: Table<S>, name: keyof S, array?: Column.ArrayCtor<any>): void;
    /** Sort and return a new table */
    function sort<T extends Table>(table: T, cmp: (i: number, j: number) => number): any;
    function areEqual<T extends Table<any>>(a: T, b: T): boolean;
    /** Allocate a new object with the given row values. */
    function getRow<S extends Schema>(table: Table<S>, index: number): Row<S>;
    /** Pick the first row for which `test` evaluates to true */
    function pickRow<S extends Schema>(table: Table<S>, test: (i: number) => boolean): Row<S> | undefined;
    function getRows<S extends Schema>(table: Table<S>): Row<S>[];
    function toArrays<S extends Schema>(table: Table<S>): { [k in keyof S]: ArrayLike<S[k]["T"]>; };
    function formatToString<S extends Schema>(table: Table<S>): string;
}
export { Table };
