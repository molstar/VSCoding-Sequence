/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { BinaryEncodingProvider } from './cif/encoder/binary';
import * as _Encoder from './cif/encoder';
import { ArrayEncoding, ArrayEncoder } from '../common/binary-cif';
import { CifFrame } from '../reader/cif';
export declare namespace CifWriter {
    export import Encoder = _Encoder.Encoder;
    export import Category = _Encoder.Category;
    export import Field = _Encoder.Field;
    export import Encoding = ArrayEncoding;
    interface EncoderParams {
        binary?: boolean;
        encoderName?: string;
        binaryEncodingPovider?: BinaryEncodingProvider;
        binaryAutoClassifyEncoding?: boolean;
    }
    function createEncoder(params?: EncoderParams): Encoder;
    function fields<K = number, D = any, N extends string = string>(): Field.Builder<K, D, N>;
    const Encodings: {
        deltaRLE: ArrayEncoder;
        fixedPoint2: ArrayEncoder;
        fixedPoint3: ArrayEncoder;
    };
    function categoryInstance<Key, Data>(fields: Field<Key, Data>[], source: Category.DataSource): Category.Instance;
    function createEncodingProviderFromCifFrame(frame: CifFrame): BinaryEncodingProvider;
    function createEncodingProviderFromJsonConfig(hints: EncodingStrategyHint[]): BinaryEncodingProvider;
}
/**
 * Defines the information needed to encode certain fields: category and column name as well as encoding tag, precision is optional and identifies float columns.
 */
export interface EncodingStrategyHint {
    categoryName: string;
    columnName: string;
    encoding: EncodingType;
    /**
     * number of decimal places to keep - must be specified to float columns
     */
    precision?: number;
}
type EncodingType = 'pack' | 'rle' | 'delta' | 'delta-rle';
export {};
