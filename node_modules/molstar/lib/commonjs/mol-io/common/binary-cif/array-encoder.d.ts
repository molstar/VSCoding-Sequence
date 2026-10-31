/**
 * Copyright (c) 2017-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted from CIFTools.js (https://github.com/dsehnal/CIFTools.js; MIT) and MMTF (https://github.com/rcsb/mmtf-javascript/; MIT)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Encoding, EncodedData } from './encoding';
import { TypedIntArray, TypedFloatArray } from '../../../mol-util/type-helpers';
export interface ArrayEncoder {
    and(f: ArrayEncoding.Provider): ArrayEncoder;
    encode(data: ArrayLike<any>): EncodedData;
}
export declare class ArrayEncoderImpl implements ArrayEncoder {
    private providers;
    and(f: ArrayEncoding.Provider): ArrayEncoderImpl;
    encode(data: ArrayLike<any>): EncodedData;
    constructor(providers: ArrayEncoding.Provider[]);
}
export declare namespace ArrayEncoder {
    function by(f: ArrayEncoding.Provider): ArrayEncoder;
    function fromEncoding(encoding: Encoding[]): ArrayEncoder;
}
export declare namespace ArrayEncoding {
    type TypedArrayCtor = {
        new (size: number): ArrayLike<number> & {
            buffer: ArrayBuffer;
            byteLength: number;
            byteOffset: number;
            BYTES_PER_ELEMENT: number;
        };
    };
    interface Result {
        encodings: Encoding[];
        data: any;
    }
    type Provider = (data: any) => Result;
    function by(f: Provider): ArrayEncoder;
    function byteArray(data: TypedFloatArray | TypedIntArray): Result;
    function fixedPoint(factor: number): Provider;
    function intervalQuantizaiton(min: number, max: number, numSteps: number, arrayType?: new (size: number) => TypedIntArray): Provider;
    function runLength(data: TypedIntArray): Result;
    function delta(data: Int8Array | Int16Array | Int32Array): Result;
    /**
     * Packs Int32 array. The packing level is determined automatically to either 1-, 2-, or 4-byte words.
     */
    function integerPacking(data: Int32Array): Result;
    function stringArray(data: string[]): Result;
}
