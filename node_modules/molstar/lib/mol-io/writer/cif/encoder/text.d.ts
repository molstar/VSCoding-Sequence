/**
 * Copyright (c) 2017-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted from CIFTools.js (https://github.com/dsehnal/CIFTools.js)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Category, Encoder } from '../encoder';
import { Writer } from '../../writer';
export declare class TextEncoder implements Encoder<string> {
    private builder;
    private encoded;
    private dataBlockCreated;
    private filter;
    private formatter;
    readonly isBinary = false;
    binaryEncodingProvider: undefined;
    setFilter(filter?: Category.Filter): void;
    isCategoryIncluded(name: string): boolean;
    setFormatter(formatter?: Category.Formatter): void;
    startDataBlock(header: string): void;
    writeCategory<Ctx>(category: Category<Ctx>, context?: Ctx, options?: Encoder.WriteCategoryOptions): void;
    encode(): void;
    writeTo(stream: Writer): void;
    getSize(): number;
    getData(): string;
}
