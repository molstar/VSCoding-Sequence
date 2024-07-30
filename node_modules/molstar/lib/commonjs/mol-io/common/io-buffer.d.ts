/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted and converted to TypeScript from https://github.com/image-js/iobuffer
 * MIT License, Copyright (c) 2015 Michaël Zasso
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { TypedArray } from '../../mol-util/type-helpers';
export interface IOBufferParameters {
    offset?: number;
}
/**
 * Class for writing and reading binary data
 */
export declare class IOBuffer {
    private _lastWrittenByte;
    private _mark;
    private _marks;
    private _data;
    offset: number;
    littleEndian: boolean;
    buffer: ArrayBuffer;
    length: number;
    byteLength: number;
    byteOffset: number;
    /**
     * If it's a number, it will initialize the buffer with the number as
     * the buffer's length. If it's undefined, it will initialize the buffer
     * with a default length of 8 Kb. If its an ArrayBuffer, a TypedArray,
     * it will create a view over the underlying ArrayBuffer.
     */
    constructor(data: number | ArrayBuffer | TypedArray, params?: IOBufferParameters);
    /**
     * Checks if the memory allocated to the buffer is sufficient to store more bytes after the offset
     * @param byteLength The needed memory in bytes
     */
    available(byteLength?: number): boolean;
    /**
     * Check if little-endian mode is used for reading and writing multi-byte values
     * Returns true if little-endian mode is used, false otherwise
     */
    isLittleEndian(): boolean;
    /**
     * Set little-endian mode for reading and writing multi-byte values
     */
    setLittleEndian(): this;
    /**
     * Check if big-endian mode is used for reading and writing multi-byte values
     * Returns true if big-endian mode is used, false otherwise
     */
    isBigEndian(): boolean;
    /**
     * Switches to big-endian mode for reading and writing multi-byte values
     */
    setBigEndian(): this;
    /**
     * Move the pointer n bytes forward
     */
    skip(n: number): this;
    /**
     * Move the pointer to the given offset
     */
    seek(offset: number): this;
    /**
     * Store the current pointer offset.
     */
    mark(): this;
    /**
     * Move the pointer back to the last pointer offset set by mark
     */
    reset(): this;
    /**
     * Push the current pointer offset to the mark stack
     */
    pushMark(): this;
    /**
     * Pop the last pointer offset from the mark stack, and set the current pointer offset to the popped value
     */
    popMark(): this;
    /**
     * Move the pointer offset back to 0
     */
    rewind(): this;
    /**
     * Make sure the buffer has sufficient memory to write a given byteLength at the current pointer offset
     * If the buffer's memory is insufficient, this method will create a new buffer (a copy) with a length
     * that is twice (byteLength + current offset)
     */
    ensureAvailable(byteLength: number): this;
    /**
     * Read a byte and return false if the byte's value is 0, or true otherwise
     * Moves pointer forward
     */
    readBoolean(): boolean;
    /**
     * Read a signed 8-bit integer and move pointer forward
     */
    readInt8(): number;
    /**
     * Read an unsigned 8-bit integer and move pointer forward
     */
    readUint8(): number;
    /**
     * Alias for {@link IOBuffer#readUint8}
     */
    readByte(): number;
    /**
     * Read n bytes and move pointer forward.
     */
    readBytes(n: number): Uint8Array;
    /**
     * Read a 16-bit signed integer and move pointer forward
     */
    readInt16(): number;
    /**
     * Read a 16-bit unsigned integer and move pointer forward
     */
    readUint16(): number;
    /**
     * Read a 32-bit signed integer and move pointer forward
     */
    readInt32(): number;
    /**
     * Read a 32-bit unsigned integer and move pointer forward
     */
    readUint32(): number;
    /**
     * Read a 32-bit floating number and move pointer forward
     */
    readFloat32(): number;
    /**
     * Read a 64-bit floating number and move pointer forward
     */
    readFloat64(): number;
    /**
     * Read 1-byte ascii character and move pointer forward
     */
    readChar(): string;
    /**
     * Read n 1-byte ascii characters and move pointer forward
     */
    readChars(n?: number): string;
    /**
     * Write 0xff if the passed value is truthy, 0x00 otherwise
     */
    writeBoolean(value?: boolean): this;
    /**
     * Write value as an 8-bit signed integer
     */
    writeInt8(value: number): this;
    /**
     * Write value as a 8-bit unsigned integer
     */
    writeUint8(value: number): this;
    /**
     * An alias for IOBuffer#writeUint8
     */
    writeByte(value: number): this;
    /**
     * Write bytes
     */
    writeBytes(bytes: number[] | Uint8Array): this;
    /**
     * Write value as an 16-bit signed integer
     */
    writeInt16(value: number): this;
    /**
     * Write value as a 16-bit unsigned integer
     */
    writeUint16(value: number): this;
    /**
     * Write a 32-bit signed integer at the current pointer offset
     */
    writeInt32(value: number): this;
    /**
     * Write a 32-bit unsigned integer at the current pointer offset
     */
    writeUint32(value: number): this;
    /**
     * Write a 32-bit floating number at the current pointer offset
     */
    writeFloat32(value: number): this;
    /**
     * Write a 64-bit floating number at the current pointer offset
     */
    writeFloat64(value: number): this;
    /**
     * Write the charCode of the passed string's first character to the current pointer offset
     */
    writeChar(str: string): this;
    /**
     * Write the charCodes of the passed string's characters to the current pointer offset
     */
    writeChars(str: string): this;
    /**
     * Export a Uint8Array view of the internal buffer.
     * The view starts at the byte offset and its length
     * is calculated to stop at the last written byte or the original length.
     */
    toArray(): Uint8Array;
    /**
     * Update the last written byte offset
     */
    private _updateLastWrittenByte;
}
