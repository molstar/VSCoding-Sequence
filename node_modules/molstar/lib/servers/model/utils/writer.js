/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as fs from 'fs';
import * as path from 'path';
import { makeDir } from '../../../mol-util/make-dir';
import { encodeTarHeader, END_OF_TAR } from './tar';
import * as zlib from 'zlib';
export class SimpleResponseResultWriter {
    beginEntry(name) {
        throw new Error('Not supported');
    }
    endEntry() {
        throw new Error('Not supported');
    }
    doError(code = 404, message = 'Not Found.') {
        if (!this.headerWritten) {
            this.headerWritten = true;
            this.res.status(code).send(message);
        }
        this.end();
    }
    writeHeader() {
        if (this.headerWritten)
            return;
        this.headerWritten = true;
        this.res.writeHead(200, {
            // TODO there seems to be a bug in swagger-ui - front-end will freeze for cif delivered as text/plain (forcing binary is a hack to circumvent this)
            'Content-Type': this.isBinary ? 'application/octet-stream' : 'text/plain; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'X-Requested-With',
            'Content-Disposition': `${this.isDownload ? 'attachment' : 'inline'}; filename="${this.fn}"`
        });
    }
    writeBinary(data) {
        this.writeHeader();
        return this.res.write(Buffer.from(data.buffer, data.byteOffset, data.byteLength));
    }
    writeString(data) {
        this.writeHeader();
        return this.res.write(data);
    }
    end() {
        if (this.ended)
            return;
        this.res.end();
        this.ended = true;
    }
    constructor(fn, res, isBinary, isDownload) {
        this.fn = fn;
        this.res = res;
        this.isBinary = isBinary;
        this.isDownload = isDownload;
        this.ended = false;
        this.headerWritten = false;
    }
}
export class TarballResponseResultWriter {
    beginEntry(name, size) {
        this.writeHeader();
        const header = encodeTarHeader({ name, size });
        this.entrySize = size;
        this.stream.write(header);
    }
    endEntry() {
        const size = this.entrySize & 511;
        if (size)
            this.stream.write(END_OF_TAR.slice(0, 512 - size));
    }
    doError(code = 404, message = 'Not Found.') {
        if (!this.headerWritten) {
            this.headerWritten = true;
            this.res.status(code).send(message);
        }
        this.end();
    }
    writeHeader() {
        if (this.headerWritten)
            return;
        this.stream.pipe(this.res, { end: true });
        this.stream.on('end', () => this.res.end());
        this.headerWritten = true;
        this.res.writeHead(200, {
            'Content-Type': 'application/tar+gzip',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'X-Requested-With',
            'Content-Disposition': `inline; filename="${this.fn}"`
        });
    }
    writeBinary(data) {
        this.writeHeader();
        return !!this.stream.write(Buffer.from(data.buffer, data.byteOffset, data.byteLength));
    }
    writeString(data) {
        this.writeHeader();
        return !!this.stream.write(data);
    }
    end() {
        if (this.ended)
            return;
        this.ended = true;
        if (!this.headerWritten) {
            return;
        }
        this.stream.write(END_OF_TAR);
        this.stream.end();
    }
    constructor(fn, res) {
        this.fn = fn;
        this.res = res;
        this.ended = false;
        this.headerWritten = false;
        this.stream = zlib.createGzip({ level: 6, memLevel: 9, chunkSize: 16 * 16384 });
        this.entrySize = 0;
    }
}
export class FileResultWriter {
    beginEntry(name) {
        throw new Error('Not supported');
    }
    endEntry() {
        throw new Error('Not supported');
    }
    open() {
        if (this.opened)
            return;
        makeDir(path.dirname(this.fn));
        this.file = fs.createWriteStream(this.fn);
        this.opened = true;
    }
    writeBinary(data) {
        var _a;
        this.open();
        (_a = this.file) === null || _a === void 0 ? void 0 : _a.write(Buffer.from(data.buffer, data.byteOffset, data.byteLength));
        return true;
    }
    writeString(data) {
        var _a;
        this.open();
        (_a = this.file) === null || _a === void 0 ? void 0 : _a.write(data);
        return true;
    }
    end() {
        var _a;
        if (!this.opened || this.ended)
            return;
        (_a = this.file) === null || _a === void 0 ? void 0 : _a.end();
        this.ended = true;
    }
    constructor(fn) {
        this.fn = fn;
        this.file = void 0;
        this.ended = false;
        this.opened = false;
    }
}
export class TarballFileResultWriter {
    beginEntry(name, size) {
        const header = encodeTarHeader({ name, size });
        this.entrySize = size;
        this.stream.write(header);
    }
    endEntry() {
        const size = this.entrySize & 511;
        if (size)
            this.stream.write(END_OF_TAR.slice(0, 512 - size));
    }
    open() {
        if (this.opened)
            return;
        makeDir(path.dirname(this.fn));
        this.file = fs.createWriteStream(this.fn);
        this.stream.pipe(this.file, { end: true });
        this.opened = true;
    }
    writeBinary(data) {
        this.open();
        this.stream.write(Buffer.from(data.buffer, data.byteOffset, data.byteLength));
        return true;
    }
    writeString(data) {
        this.open();
        this.stream.write(data);
        return true;
    }
    end() {
        if (!this.opened || this.ended)
            return;
        this.stream.write(END_OF_TAR);
        this.stream.end();
        this.ended = true;
    }
    constructor(fn, gzipLevel = 6) {
        this.fn = fn;
        this.gzipLevel = gzipLevel;
        this.file = void 0;
        this.ended = false;
        this.opened = false;
        this.stream = zlib.createGzip({ level: this.gzipLevel, memLevel: 9, chunkSize: 16 * 16384 });
        this.entrySize = 0;
    }
}
