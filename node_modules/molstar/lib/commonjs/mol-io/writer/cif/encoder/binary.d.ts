/**
 * Copyright (c) 2017-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted from CIFTools.js (https://github.com/dsehnal/CIFTools.js)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { ArrayEncoder } from '../../../common/binary-cif';
import { Category, Encoder } from '../encoder';
import { Writer } from '../../writer';
export interface BinaryEncodingProvider {
    get(category: string, field: string): ArrayEncoder | undefined;
}
export declare class BinaryEncoder implements Encoder<Uint8Array> {
    private autoClassify;
    private data;
    private dataBlocks;
    private encodedData;
    private filter;
    private formatter;
    readonly isBinary = true;
    binaryEncodingProvider: BinaryEncodingProvider | undefined;
    setFilter(filter?: Category.Filter): void;
    isCategoryIncluded(name: string): boolean;
    setFormatter(formatter?: Category.Formatter): void;
    startDataBlock(header: string): void;
    writeCategory<Ctx>(category: Category<Ctx>, context?: Ctx, options?: Encoder.WriteCategoryOptions): void;
    encode(): void;
    writeTo(writer: Writer): void;
    getData(): Uint8Array;
    getSize(): number;
    constructor(encoder: string, encodingProvider: BinaryEncodingProvider | undefined, autoClassify: boolean);
}
