/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { DatabaseCollection, Database, Table } from '../../../mol-data/db';
import * as Data from './data-model';
export declare namespace FieldPath {
    function canonical(path: string): string;
    function equal(pathA: string, pathB: string): boolean;
    function create(category: string, field: string, asCanonical?: boolean): string;
}
export declare function toDatabaseCollection<Schema extends Database.Schema>(schema: Schema, file: Data.CifFile, aliases?: Data.CifAliases): DatabaseCollection<Schema>;
export declare function toDatabase<Schema extends Database.Schema, Frame extends Database<Schema> = Database<Schema>>(schema: Schema, frame: Data.CifFrame, aliases?: Data.CifAliases): Frame;
export declare function toTable<Schema extends Table.Schema, R extends Table<Schema> = Table<Schema>>(schema: Schema, category: Data.CifCategory): R;
