/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export interface Database {
    tables: {
        [tableName: string]: Table;
    };
    aliases: {
        [path: string]: string[];
    };
}
export interface Table {
    description: string;
    key: Set<string>;
    columns: {
        [columnName: string]: Column;
    };
}
export type Column = IntCol | StrCol | FloatCol | CoordCol | EnumCol | VectorCol | MatrixCol | ListCol;
type BaseCol = {
    description: string;
};
export type IntCol = {
    type: 'int';
} & BaseCol;
export declare function IntCol(description: string): IntCol;
export type StrCol = {
    type: 'str';
} & BaseCol;
export declare function StrCol(description: string): StrCol;
export type FloatCol = {
    type: 'float';
} & BaseCol;
export declare function FloatCol(description: string): FloatCol;
export type CoordCol = {
    type: 'coord';
} & BaseCol;
export declare function CoordCol(description: string): CoordCol;
export type EnumCol = {
    type: 'enum';
    subType: 'int' | 'str' | 'ustr' | 'lstr';
    values: string[];
} & BaseCol;
export declare function EnumCol(values: string[], subType: 'int' | 'str' | 'ustr' | 'lstr', description: string): EnumCol;
export type VectorCol = {
    type: 'vector';
    length: number;
} & BaseCol;
export declare function VectorCol(length: number, description: string): VectorCol;
export type MatrixCol = {
    type: 'matrix';
    rows: number;
    columns: number;
} & BaseCol;
export declare function MatrixCol(columns: number, rows: number, description: string): MatrixCol;
export type ListCol = {
    type: 'list';
    subType: 'int' | 'str' | 'float' | 'coord';
    separator: string;
} & BaseCol;
export declare function ListCol(subType: 'int' | 'str' | 'float' | 'coord', separator: string, description: string): ListCol;
export type Filter = {
    [table: string]: {
        [column: string]: true;
    };
};
export declare function mergeFilters(...filters: Filter[]): Filter;
export {};
