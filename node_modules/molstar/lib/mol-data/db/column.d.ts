/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Tensor as Tensors } from '../../mol-math/linear-algebra';
import { Tokens } from '../../mol-io/reader/common/text/tokenizer';
interface Column<T> {
    readonly schema: Column.Schema;
    readonly __array: ArrayLike<any> | undefined;
    readonly isDefined: boolean;
    readonly rowCount: number;
    value(row: number): T;
    valueKind(row: number): Column.ValueKind;
    toArray(params?: Column.ToArrayParams<T>): ArrayLike<T>;
    areValuesEqual(rowA: number, rowB: number): boolean;
}
declare namespace Column {
    type ArrayCtor<T> = {
        new (size: number): ArrayLike<T>;
    };
    type Schema<T = any> = Schema.Str | Schema.Int | Schema.Float | Schema.Coordinate | Schema.Aliased<T> | Schema.Tensor | Schema.List<number | string>;
    namespace Schema {
        type Base<T extends string> = {
            valueType: T;
        };
        export type Str = {
            '@type': 'str';
            T: string;
            transform?: 'uppercase' | 'lowercase';
        } & Base<'str'>;
        export type Int = {
            '@type': 'int';
            T: number;
        } & Base<'int'>;
        export type Float = {
            '@type': 'float';
            T: number;
        } & Base<'float'>;
        export type Coordinate = {
            '@type': 'coord';
            T: number;
        } & Base<'float'>;
        export type Tensor = {
            '@type': 'tensor';
            T: Tensors.Data;
            space: Tensors.Space;
            baseType: Int | Float;
        } & Base<'tensor'>;
        export type Aliased<T> = {
            '@type': 'aliased';
            T: T;
            transform?: T extends string ? 'uppercase' | 'lowercase' : never;
        } & Base<T extends string ? 'str' : 'int'>;
        export type List<T extends number | string> = {
            '@type': 'list';
            T: T[];
            separator: string;
            itemParse: (x: string) => T;
        } & Base<'list'>;
        export const str: Str;
        export const ustr: Str;
        export const lstr: Str;
        export const int: Int;
        export const coord: Coordinate;
        export const float: Float;
        export function Str(options?: {
            defaultValue?: string;
            transform?: 'uppercase' | 'lowercase';
        }): Str;
        export function Int(defaultValue?: number): Int;
        export function Float(defaultValue?: number): Float;
        export function Tensor(space: Tensors.Space, baseType?: Int | Float): Tensor;
        export function Vector(dim: number, baseType?: Int | Float): Tensor;
        export function Matrix(rows: number, cols: number, baseType?: Int | Float): Tensor;
        export function Aliased<T>(t: Str | Int): Aliased<T>;
        export function List<T extends number | string>(separator: string, itemParse: (x: string) => T, defaultValue?: T[]): List<T>;
        export {};
    }
    interface ToArrayParams<T> {
        array?: ArrayCtor<T>;
        start?: number;
        /** Last row (exclusive) */
        end?: number;
    }
    interface LambdaSpec<T extends Schema> {
        value: (row: number) => T['T'];
        rowCount: number;
        schema: T;
        valueKind?: (row: number) => ValueKind;
        areValuesEqual?: (rowA: number, rowB: number) => boolean;
    }
    interface ArraySpec<T extends Schema> {
        array: ArrayLike<T['T']>;
        schema: T;
        valueKind?: (row: number) => ValueKind;
    }
    interface MapSpec<S extends Schema, T extends Schema> {
        f: (v: S['T']) => T['T'];
        schema: T;
        valueKind?: (row: number) => ValueKind;
    }
    function is(v: any): v is Column<any>;
    const enum ValueKinds {
        /** Defined value (= 0) */
        Present = 0,
        /** Expressed in CIF as `.` (= 1) */
        NotPresent = 1,
        /** Expressed in CIF as `?` (= 2) */
        Unknown = 2
    }
    const ValueKind: {
        /** Defined value (= 0) */
        readonly Present: ValueKinds.Present;
        /** Expressed in CIF as `.` (= 1) */
        readonly NotPresent: ValueKinds.NotPresent;
        /** Expressed in CIF as `?` (= 2) */
        readonly Unknown: ValueKinds.Unknown;
    };
    type ValueKind = (typeof ValueKind)[keyof typeof ValueKinds];
    function Undefined<T extends Schema>(rowCount: number, schema: T): Column<T['T']>;
    function ofConst<T extends Schema>(v: T['T'], rowCount: number, type: T): Column<T['T']>;
    function ofLambda<T extends Schema>(spec: LambdaSpec<T>): Column<T['T']>;
    /** values [min, max] (i.e. include both values) */
    function range(min: number, max: number): Column<number>;
    function ofArray<T extends Column.Schema>(spec: Column.ArraySpec<T>): Column<T['T']>;
    function ofIntArray(array: ArrayLike<number>): Column<number>;
    function ofFloatArray(array: ArrayLike<number>): Column<number>;
    function ofStringArray(array: ArrayLike<string>): Column<string>;
    function ofStringAliasArray<T extends string>(array: ArrayLike<T>): Column<T>;
    function ofStringListArray<T extends string>(array: ArrayLike<T[]>, separator?: string): Column<T[]>;
    function ofIntTokens(tokens: Tokens): Column<number>;
    function ofFloatTokens(tokens: Tokens): Column<number>;
    function ofStringTokens(tokens: Tokens): Column<string>;
    function window<T>(column: Column<T>, start: number, end: number): Column<T>;
    function view<T>(column: Column<T>, indices: ArrayLike<number>, checkIndentity?: boolean): Column<T>;
    /** A map of the 1st occurence of each value. */
    function createFirstIndexMap<T>(column: Column<T>): Map<T, number>;
    function createIndexer<T, R extends number = number>(column: Column<T>): ((e: T) => R);
    function mapToArray<T, S>(column: Column<T>, f: (v: T) => S, ctor?: ArrayCtor<S>): ArrayLike<S>;
    function areEqual<T>(a: Column<T>, b: Column<T>): boolean;
    function indicesOf<T>(c: Column<T>, test: (e: T) => boolean): number[];
    /** Makes the column backed by an array. Useful for columns that are accessed often. */
    function asArrayColumn<T>(c: Column<T>, array?: ArrayCtor<T>): Column<T>;
    function copyToArray<T extends number>(c: Column<T>, array: {
        [k: number]: T;
        length: number;
    }, offset?: number): void;
    function isIdentity<T extends number>(c: Column<T>): boolean;
}
export { Column };
