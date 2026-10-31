/**
 * Copyright (c) 2017-2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Iterator } from '../../../mol-data/iterator';
import { Column, Table, Database, DatabaseCollection } from '../../../mol-data/db';
import { Encoder as EncoderBase } from '../encoder';
import { ArrayEncoder, ArrayEncoding } from '../../common/binary-cif';
import { BinaryEncodingProvider } from './encoder/binary';
export interface Field<Key = any, Data = any> {
    name: string;
    type: Field.Type;
    value(key: Key, data: Data, index: number): string | number;
    valueKind?: (key: Key, data: Data) => Column.ValueKind;
    defaultFormat?: Field.Format;
    shouldInclude?: (data: Data) => boolean;
}
export declare namespace Field {
    const enum Type {
        Str = 0,
        Int = 1,
        Float = 2
    }
    interface Format {
        digitCount?: number;
        encoder?: ArrayEncoder;
        typedArray?: ArrayEncoding.TypedArrayCtor;
    }
    type ParamsBase<K, D> = {
        valueKind?: (k: K, d: D) => Column.ValueKind;
        encoder?: ArrayEncoder;
        shouldInclude?: (data: D) => boolean;
    };
    function str<K, D = any>(name: string, value: (k: K, d: D, index: number) => string, params?: ParamsBase<K, D>): Field<K, D>;
    function int<K, D = any>(name: string, value: (k: K, d: D, index: number) => number, params?: ParamsBase<K, D> & {
        typedArray?: ArrayEncoding.TypedArrayCtor;
    }): Field<K, D>;
    function float<K, D = any>(name: string, value: (k: K, d: D, index: number) => number, params?: ParamsBase<K, D> & {
        typedArray?: ArrayEncoding.TypedArrayCtor;
        digitCount?: number;
    }): Field<K, D>;
    function index(name: string): Field<unknown, any>;
    class Builder<K = number, D = any, N extends string = string> {
        private fields;
        index(name: N): this;
        str(name: N, value: (k: K, d: D, index: number) => string, params?: ParamsBase<K, D>): this;
        int(name: N, value: (k: K, d: D, index: number) => number, params?: ParamsBase<K, D> & {
            typedArray?: ArrayEncoding.TypedArrayCtor;
        }): this;
        vec(name: N, values: ((k: K, d: D, index: number) => number)[], params?: ParamsBase<K, D> & {
            typedArray?: ArrayEncoding.TypedArrayCtor;
        }): this;
        float(name: N, value: (k: K, d: D, index: number) => number, params?: ParamsBase<K, D> & {
            typedArray?: ArrayEncoding.TypedArrayCtor;
            digitCount?: number;
        }): this;
        many(fields: ArrayLike<Field<K, D>>): this;
        add(field: Field<K, D>): this;
        getFields(): Field<K, D>[];
    }
    function build<K = number, D = any, N extends string = string>(): Builder<K, D, N>;
}
export interface Category<Ctx = any> {
    name: string;
    instance(ctx: Ctx): Category.Instance;
}
export declare namespace Category {
    const Empty: Instance;
    interface DataSource<Key = any, Data = any> {
        data?: Data;
        rowCount: number;
        keys?: () => Iterator<Key>;
    }
    interface Instance<Key = any, Data = any> {
        fields: Field[];
        source: DataSource<Key, Data>[];
    }
    interface Filter {
        includeCategory(categoryName: string): boolean;
        includeField(categoryName: string, fieldName: string): boolean;
    }
    function filterOf(directives: string): Filter;
    const DefaultFilter: Filter;
    interface Formatter {
        getFormat(categoryName: string, fieldName: string): Field.Format | undefined;
    }
    const DefaultFormatter: Formatter;
    function ofTable(table: Table, indices?: ArrayLike<number>): Category.Instance;
}
export interface Encoder<T = string | Uint8Array> extends EncoderBase {
    readonly isBinary: boolean;
    setFilter(filter?: Category.Filter): void;
    isCategoryIncluded(name: string): boolean;
    setFormatter(formatter?: Category.Formatter): void;
    startDataBlock(header: string): void;
    writeCategory<Ctx>(category: Category<Ctx>, context?: Ctx, options?: Encoder.WriteCategoryOptions): void;
    getData(): T;
    binaryEncodingProvider: BinaryEncodingProvider | undefined;
}
export declare namespace Encoder {
    interface WriteCategoryOptions {
        ignoreFilter?: boolean;
    }
    function writeDatabase(encoder: Encoder, name: string, database: Database<Database.Schema>): void;
    function writeDatabaseCollection(encoder: Encoder, collection: DatabaseCollection<Database.Schema>): void;
}
