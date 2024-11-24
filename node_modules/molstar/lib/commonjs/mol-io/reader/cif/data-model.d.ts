/**
 * Copyright (c) 2017-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Column, Table } from '../../../mol-data/db';
import { Tensor } from '../../../mol-math/linear-algebra';
import { Encoding } from '../../common/binary-cif';
import { Tokens } from '../common/text/tokenizer';
export interface CifFile {
    readonly name?: string;
    readonly blocks: ReadonlyArray<CifBlock>;
}
export declare function CifFile(blocks: ArrayLike<CifBlock>, name?: string): CifFile;
export interface CifFrame {
    readonly header: string;
    /** Category names, stored separately so that the ordering can be preserved. */
    readonly categoryNames: ReadonlyArray<string>;
    readonly categories: CifCategories;
}
export interface CifBlock extends CifFrame {
    readonly saveFrames: CifFrame[];
    getField(name: string): CifField | undefined;
}
export declare function CifBlock(categoryNames: string[], categories: CifCategories, header: string, saveFrames?: CifFrame[]): CifBlock;
export declare function CifSaveFrame(categoryNames: string[], categories: CifCategories, header: string): CifFrame;
export type CifAliases = {
    readonly [name: string]: string[];
};
export type CifCategories = {
    readonly [name: string]: CifCategory;
};
export interface CifCategory {
    readonly rowCount: number;
    readonly name: string;
    readonly fieldNames: ReadonlyArray<string>;
    getField(name: string): CifField | undefined;
}
export declare function CifCategory(name: string, rowCount: number, fieldNames: string[], fields: {
    [name: string]: CifField;
}): CifCategory;
export declare namespace CifCategory {
    function empty(name: string): CifCategory;
    type SomeFields<S> = {
        [P in keyof S]?: CifField;
    };
    type Fields<S> = {
        [P in keyof S]: CifField;
    };
    function ofFields(name: string, fields: {
        [name: string]: CifField | undefined;
    }): CifCategory;
    function ofTable(name: string, table: Table<any>): CifCategory;
}
/**
 * Implementation note:
 * Always implement without using "this." in any of the interface functions.
 * This is to ensure that the functions can invoked without having to "bind" them.
 */
export interface CifField {
    readonly __array: ArrayLike<any> | undefined;
    readonly binaryEncoding: Encoding[] | undefined;
    readonly isDefined: boolean;
    readonly rowCount: number;
    str(row: number): string;
    int(row: number): number;
    float(row: number): number;
    valueKind(row: number): Column.ValueKind;
    areValuesEqual(rowA: number, rowB: number): boolean;
    toStringArray(params?: Column.ToArrayParams<string>): ReadonlyArray<string>;
    toIntArray(params?: Column.ToArrayParams<number>): ReadonlyArray<number>;
    toFloatArray(params?: Column.ToArrayParams<number>): ReadonlyArray<number>;
}
export declare namespace CifField {
    function ofString(value: string): CifField;
    function ofStrings(values: ArrayLike<string>): CifField;
    function ofNumbers(values: ArrayLike<number>): CifField;
    function ofTokens(tokens: Tokens): CifField;
    function ofColumn(column: Column<any>): CifField;
    function ofUndefined(rowCount: number, schema: Column.Schema): CifField;
}
export declare function tensorFieldNameGetter(field: string, rank: number, zeroIndexed: boolean, namingVariant: 'brackets' | 'underscore'): (i: number, j: number, k: number) => string;
export declare function getTensor(category: CifCategory, space: Tensor.Space, row: number, getName: (...args: number[]) => string): Tensor.Data;
export declare function getCifFieldType(field: CifField): Column.Schema.Int | Column.Schema.Float | Column.Schema.Str;
