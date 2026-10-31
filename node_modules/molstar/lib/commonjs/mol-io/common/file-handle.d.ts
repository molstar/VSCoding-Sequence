/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { SimpleBuffer } from './simple-buffer';
export interface FileHandle {
    name: string;
    /**
     * Asynchronously reads data, returning buffer and number of bytes read
     *
     * @param position The offset from the beginning of the file from which data should be read.
     * @param sizeOrBuffer The buffer the data will be read from.
     * @param length The number of bytes to read.
     * @param byteOffset The offset in the buffer at which to start reading.
     */
    readBuffer(position: number, sizeOrBuffer: SimpleBuffer | number, length?: number, byteOffset?: number): Promise<{
        bytesRead: number;
        buffer: SimpleBuffer;
    }>;
    /**
     * Asynchronously writes buffer, returning the number of bytes written.
     *
     * @param position — The offset from the beginning of the file where this data should be written.
     * @param buffer - The buffer data to be written.
     * @param length — The number of bytes to write. If not supplied, defaults to buffer.length
     */
    writeBuffer(position: number, buffer: SimpleBuffer, length?: number): Promise<number>;
    /**
     * Synchronously writes buffer, returning the number of bytes written.
     *
     * @param position — The offset from the beginning of the file where this data should be written.
     * @param buffer - The buffer data to be written.
     * @param length — The number of bytes to write. If not supplied, defaults to buffer.length
     */
    writeBufferSync(position: number, buffer: SimpleBuffer, length?: number): number;
    /** Closes a file handle */
    close(): void;
}
export declare namespace FileHandle {
    function fromBuffer(buffer: SimpleBuffer, name: string): FileHandle;
}
