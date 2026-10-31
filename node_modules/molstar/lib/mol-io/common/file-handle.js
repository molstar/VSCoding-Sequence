/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { defaults, noop } from '../../mol-util';
import { SimpleBuffer } from './simple-buffer';
export var FileHandle;
(function (FileHandle) {
    function fromBuffer(buffer, name) {
        return {
            name,
            readBuffer: (position, sizeOrBuffer, size, byteOffset) => {
                let bytesRead;
                let outBuffer;
                if (typeof sizeOrBuffer === 'number') {
                    size = defaults(size, sizeOrBuffer);
                    const start = position;
                    const end = Math.min(buffer.length, start + size);
                    bytesRead = end - start;
                    outBuffer = SimpleBuffer.fromUint8Array(new Uint8Array(buffer.buffer, start, end - start));
                }
                else {
                    size = defaults(size, sizeOrBuffer.length);
                    const start = position;
                    const end = Math.min(buffer.length, start + size);
                    sizeOrBuffer.set(buffer.subarray(start, end), byteOffset);
                    bytesRead = end - start;
                    outBuffer = sizeOrBuffer;
                }
                if (size !== bytesRead) {
                    console.warn(`byteCount ${size} and bytesRead ${bytesRead} differ`);
                }
                return Promise.resolve({ bytesRead, buffer: outBuffer });
            },
            writeBuffer: (position, buffer, length) => {
                length = defaults(length, buffer.length);
                console.error('.writeBuffer not implemented for FileHandle.fromBuffer');
                return Promise.resolve(0);
            },
            writeBufferSync: (position, buffer, length) => {
                length = defaults(length, buffer.length);
                console.error('.writeSync not implemented for FileHandle.fromBuffer');
                return 0;
            },
            close: noop
        };
    }
    FileHandle.fromBuffer = fromBuffer;
})(FileHandle || (FileHandle = {}));
