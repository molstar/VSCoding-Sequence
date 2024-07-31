/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Task } from '../../../mol-task';
import { ReaderResult as Result } from '../result';
import { Column, Table } from '../../../mol-data/db';
declare const AtomsSchema: {
    nr: Column.Schema.Int;
    type: Column.Schema.Str;
    resnr: Column.Schema.Int;
    residu: Column.Schema.Str;
    atom: Column.Schema.Str;
    cgnr: Column.Schema.Int;
    charge: Column.Schema.Float;
    mass: Column.Schema.Float;
};
declare const BondsSchema: {
    ai: Column.Schema.Int;
    aj: Column.Schema.Int;
};
declare const MoleculesSchema: {
    compound: Column.Schema.Str;
    molCount: Column.Schema.Int;
};
type Compound = {
    atoms: Table<typeof AtomsSchema>;
    bonds?: Table<typeof BondsSchema>;
};
export interface TopFile {
    readonly system: string;
    readonly molecules: Table<typeof MoleculesSchema>;
    readonly compounds: Record<string, Compound>;
}
export declare function parseTop(data: string): Task<Result<TopFile>>;
export {};
