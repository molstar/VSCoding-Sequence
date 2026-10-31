/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as express from 'express';
export interface ResultWriter {
    beginEntry(name: string, size: number): void;
    endEntry(): void;
    writeBinary(data: Uint8Array): boolean;
    writeString(data: string): boolean;
    end(): void;
}
export interface WebResutlWriter extends ResultWriter {
    doError(code?: number, message?: string): void;
}
export declare class SimpleResponseResultWriter implements WebResutlWriter {
    private fn;
    private res;
    private isBinary;
    private isDownload;
    private ended;
    private headerWritten;
    beginEntry(name: string): void;
    endEntry(): void;
    doError(code?: number, message?: string): void;
    private writeHeader;
    writeBinary(data: Uint8Array): boolean;
    writeString(this: any, data: string): any;
    end(): void;
    constructor(fn: string, res: express.Response, isBinary: boolean, isDownload: boolean);
}
export declare class TarballResponseResultWriter implements WebResutlWriter {
    private fn;
    private res;
    private ended;
    private headerWritten;
    private stream;
    private entrySize;
    beginEntry(name: string, size: number): void;
    endEntry(): void;
    doError(code?: number, message?: string): void;
    private writeHeader;
    writeBinary(data: Uint8Array): boolean;
    writeString(data: string): boolean;
    end(): void;
    constructor(fn: string, res: express.Response);
}
export declare class FileResultWriter implements ResultWriter {
    private fn;
    private file;
    private ended;
    private opened;
    beginEntry(name: string): void;
    endEntry(): void;
    open(): void;
    writeBinary(data: Uint8Array): boolean;
    writeString(data: string): boolean;
    end(): void;
    constructor(fn: string);
}
export declare class TarballFileResultWriter implements ResultWriter {
    private fn;
    private gzipLevel;
    private file;
    private ended;
    private opened;
    private stream;
    private entrySize;
    beginEntry(name: string, size: number): void;
    endEntry(): void;
    open(): void;
    writeBinary(data: Uint8Array): boolean;
    writeString(data: string): boolean;
    end(): void;
    constructor(fn: string, gzipLevel?: number);
}
