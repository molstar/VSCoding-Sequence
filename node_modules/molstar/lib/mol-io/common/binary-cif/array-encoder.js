/**
 * Copyright (c) 2017-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted from CIFTools.js (https://github.com/dsehnal/CIFTools.js; MIT) and MMTF (https://github.com/rcsb/mmtf-javascript/; MIT)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ChunkedArray } from '../../../mol-data/util';
import { Encoding } from './encoding';
import { classifyIntArray } from './classifier';
export class ArrayEncoderImpl {
    and(f) {
        return new ArrayEncoderImpl(this.providers.concat([f]));
    }
    encode(data) {
        const encoding = [];
        for (const p of this.providers) {
            const t = p(data);
            if (!t.encodings.length) {
                throw new Error('Encodings must be non-empty.');
            }
            data = t.data;
            for (const e of t.encodings) {
                encoding.push(e);
            }
        }
        if (!(data instanceof Uint8Array)) {
            throw new Error('The encoding must result in a Uint8Array. Fix your encoding chain.');
        }
        return {
            encoding,
            data
        };
    }
    constructor(providers) {
        this.providers = providers;
    }
}
export var ArrayEncoder;
(function (ArrayEncoder) {
    function by(f) {
        return new ArrayEncoderImpl([f]);
    }
    ArrayEncoder.by = by;
    function fromEncoding(encoding) {
        let e = by(getProvider(encoding[0]));
        for (let i = 1; i < encoding.length; i++) {
            if (encoding[i - 1].kind === 'IntegerPacking')
                break;
            e = e.and(getProvider(encoding[i]));
        }
        return e;
    }
    ArrayEncoder.fromEncoding = fromEncoding;
    function getProvider(e) {
        switch (e.kind) {
            case 'ByteArray': return ArrayEncoding.byteArray;
            case 'FixedPoint': return ArrayEncoding.fixedPoint(e.factor);
            case 'IntervalQuantization': return ArrayEncoding.intervalQuantizaiton(e.min, e.max, e.numSteps);
            case 'RunLength': return ArrayEncoding.runLength;
            case 'Delta': return ArrayEncoding.delta;
            case 'IntegerPacking': return ArrayEncoding.integerPacking;
            case 'StringArray': return ArrayEncoding.stringArray;
        }
    }
})(ArrayEncoder || (ArrayEncoder = {}));
export var ArrayEncoding;
(function (ArrayEncoding) {
    function by(f) {
        return new ArrayEncoderImpl([f]);
    }
    ArrayEncoding.by = by;
    function uint8(data) {
        return {
            encodings: [{ kind: 'ByteArray', type: Encoding.IntDataType.Uint8 }],
            data
        };
    }
    function int8(data) {
        return {
            encodings: [{ kind: 'ByteArray', type: Encoding.IntDataType.Int8 }],
            data: new Uint8Array(data.buffer, data.byteOffset)
        };
    }
    const writers = {
        [Encoding.IntDataType.Int16]: function (v, i, a) { v.setInt16(2 * i, a, true); },
        [Encoding.IntDataType.Uint16]: function (v, i, a) { v.setUint16(2 * i, a, true); },
        [Encoding.IntDataType.Int32]: function (v, i, a) { v.setInt32(4 * i, a, true); },
        [Encoding.IntDataType.Uint32]: function (v, i, a) { v.setUint32(4 * i, a, true); },
        [Encoding.FloatDataType.Float32]: function (v, i, a) { v.setFloat32(4 * i, a, true); },
        [Encoding.FloatDataType.Float64]: function (v, i, a) { v.setFloat64(8 * i, a, true); }
    };
    const byteSizes = {
        [Encoding.IntDataType.Int16]: 2,
        [Encoding.IntDataType.Uint16]: 2,
        [Encoding.IntDataType.Int32]: 4,
        [Encoding.IntDataType.Uint32]: 4,
        [Encoding.FloatDataType.Float32]: 4,
        [Encoding.FloatDataType.Float64]: 8
    };
    function byteArray(data) {
        const type = Encoding.getDataType(data);
        if (type === Encoding.IntDataType.Int8)
            return int8(data);
        else if (type === Encoding.IntDataType.Uint8)
            return uint8(data);
        const result = new Uint8Array(data.length * byteSizes[type]);
        const w = writers[type];
        const view = new DataView(result.buffer);
        for (let i = 0, n = data.length; i < n; i++) {
            w(view, i, data[i]);
        }
        return {
            encodings: [{ kind: 'ByteArray', type }],
            data: result
        };
    }
    ArrayEncoding.byteArray = byteArray;
    function _fixedPoint(data, factor) {
        const srcType = Encoding.getDataType(data);
        const result = new Int32Array(data.length);
        for (let i = 0, n = data.length; i < n; i++) {
            result[i] = Math.round(data[i] * factor);
        }
        return {
            encodings: [{ kind: 'FixedPoint', factor, srcType }],
            data: result
        };
    }
    function fixedPoint(factor) { return data => _fixedPoint(data, factor); }
    ArrayEncoding.fixedPoint = fixedPoint;
    function _intervalQuantizaiton(data, min, max, numSteps, arrayType) {
        const srcType = Encoding.getDataType(data);
        if (!data.length) {
            return {
                encodings: [{ kind: 'IntervalQuantization', min, max, numSteps, srcType }],
                data: new Int32Array(0)
            };
        }
        if (max < min) {
            const t = min;
            min = max;
            max = t;
        }
        const delta = (max - min) / (numSteps - 1);
        const output = new arrayType(data.length);
        for (let i = 0, n = data.length; i < n; i++) {
            const v = data[i];
            if (v <= min)
                output[i] = 0;
            else if (v >= max)
                output[i] = numSteps - 1;
            else
                output[i] = (Math.round((v - min) / delta)) | 0;
        }
        return {
            encodings: [{ kind: 'IntervalQuantization', min, max, numSteps, srcType }],
            data: output
        };
    }
    function intervalQuantizaiton(min, max, numSteps, arrayType = Int32Array) {
        return data => _intervalQuantizaiton(data, min, max, numSteps, arrayType);
    }
    ArrayEncoding.intervalQuantizaiton = intervalQuantizaiton;
    function runLength(data) {
        let srcType = Encoding.getDataType(data);
        if (srcType === void 0) {
            data = new Int32Array(data);
            srcType = Encoding.IntDataType.Int32;
        }
        if (!data.length) {
            return {
                encodings: [{ kind: 'RunLength', srcType, srcSize: 0 }],
                data: new Int32Array(0)
            };
        }
        // calculate output size
        let fullLength = 2;
        for (let i = 1, il = data.length; i < il; i++) {
            if (data[i - 1] !== data[i]) {
                fullLength += 2;
            }
        }
        const output = new Int32Array(fullLength);
        let offset = 0;
        let runLength = 1;
        for (let i = 1, il = data.length; i < il; i++) {
            if (data[i - 1] !== data[i]) {
                output[offset] = data[i - 1];
                output[offset + 1] = runLength;
                runLength = 1;
                offset += 2;
            }
            else {
                ++runLength;
            }
        }
        output[offset] = data[data.length - 1];
        output[offset + 1] = runLength;
        return {
            encodings: [{ kind: 'RunLength', srcType, srcSize: data.length }],
            data: output
        };
    }
    ArrayEncoding.runLength = runLength;
    function delta(data) {
        if (!Encoding.isSignedIntegerDataType(data)) {
            throw new Error('Only signed integer types can be encoded using delta encoding.');
        }
        let srcType = Encoding.getDataType(data);
        if (srcType === void 0) {
            data = new Int32Array(data);
            srcType = Encoding.IntDataType.Int32;
        }
        if (!data.length) {
            return {
                encodings: [{ kind: 'Delta', origin: 0, srcType }],
                data: new data.constructor(0)
            };
        }
        const output = new data.constructor(data.length);
        const origin = data[0];
        output[0] = data[0];
        for (let i = 1, n = data.length; i < n; i++) {
            output[i] = data[i] - data[i - 1];
        }
        output[0] = 0;
        return {
            encodings: [{ kind: 'Delta', origin, srcType }],
            data: output
        };
    }
    ArrayEncoding.delta = delta;
    function isSigned(data) {
        for (let i = 0, n = data.length; i < n; i++) {
            if (data[i] < 0)
                return true;
        }
        return false;
    }
    function packingSizeUnsigned(data, upperLimit) {
        let size = 0;
        for (let i = 0, n = data.length; i < n; i++) {
            size += (data[i] / upperLimit) | 0;
        }
        size += data.length;
        return size;
    }
    function packingSizeSigned(data, upperLimit) {
        const lowerLimit = -upperLimit - 1;
        let size = 0;
        for (let i = 0, n = data.length; i < n; i++) {
            const value = data[i];
            if (value >= 0) {
                size += (value / upperLimit) | 0;
            }
            else {
                size += (value / lowerLimit) | 0;
            }
        }
        size += data.length;
        return size;
    }
    function determinePacking(data) {
        const signed = isSigned(data);
        const size8 = signed ? packingSizeSigned(data, 0x7F) : packingSizeUnsigned(data, 0xFF);
        const size16 = signed ? packingSizeSigned(data, 0x7FFF) : packingSizeUnsigned(data, 0xFFFF);
        if (data.length * 4 < size16 * 2) {
            // 4 byte packing is the most effective
            return {
                isSigned: signed,
                size: data.length,
                bytesPerElement: 4
            };
        }
        else if (size16 * 2 < size8) {
            // 2 byte packing is the most effective
            return {
                isSigned: signed,
                size: size16,
                bytesPerElement: 2
            };
        }
        else {
            // 1 byte packing is the most effective
            return {
                isSigned: signed,
                size: size8,
                bytesPerElement: 1
            };
        }
        ;
    }
    function _integerPacking(data, packing) {
        const upperLimit = packing.isSigned
            ? (packing.bytesPerElement === 1 ? 0x7F : 0x7FFF)
            : (packing.bytesPerElement === 1 ? 0xFF : 0xFFFF);
        const lowerLimit = -upperLimit - 1;
        const n = data.length;
        const packed = packing.isSigned
            ? packing.bytesPerElement === 1 ? new Int8Array(packing.size) : new Int16Array(packing.size)
            : packing.bytesPerElement === 1 ? new Uint8Array(packing.size) : new Uint16Array(packing.size);
        let j = 0;
        for (let i = 0; i < n; i++) {
            let value = data[i];
            if (value >= 0) {
                while (value >= upperLimit) {
                    packed[j] = upperLimit;
                    ++j;
                    value -= upperLimit;
                }
            }
            else {
                while (value <= lowerLimit) {
                    packed[j] = lowerLimit;
                    ++j;
                    value -= lowerLimit;
                }
            }
            packed[j] = value;
            ++j;
        }
        const result = byteArray(packed);
        return {
            encodings: [{
                    kind: 'IntegerPacking',
                    byteCount: packing.bytesPerElement,
                    isUnsigned: !packing.isSigned,
                    srcSize: n
                },
                result.encodings[0]
            ],
            data: result.data
        };
    }
    /**
     * Packs Int32 array. The packing level is determined automatically to either 1-, 2-, or 4-byte words.
     */
    function integerPacking(data) {
        // if (!(data instanceof Int32Array)) {
        //     throw new Error('Integer packing can only be applied to Int32 data.');
        // }
        const packing = determinePacking(data);
        if (packing.bytesPerElement === 4) {
            // no packing done, Int32 encoding will be used
            return byteArray(data);
        }
        return _integerPacking(data, packing);
    }
    ArrayEncoding.integerPacking = integerPacking;
    function stringArray(data) {
        const map = Object.create(null);
        const strings = [];
        const output = new Int32Array(data.length);
        const offsets = ChunkedArray.create(Int32Array, 1, Math.min(1024, data.length < 32 ? data.length + 1 : Math.round(data.length / 8) + 1));
        ChunkedArray.add(offsets, 0);
        let accLength = 0;
        let i = 0;
        for (const s of data) {
            // handle null strings.
            if (s === null || s === void 0) {
                output[i++] = -1;
                continue;
            }
            let index = map[s];
            if (index === void 0) {
                // increment the length
                accLength += s.length;
                // store the string and index
                index = strings.length;
                strings[index] = s;
                map[s] = index;
                // write the offset
                ChunkedArray.add(offsets, accLength);
            }
            output[i++] = index;
        }
        const offsetArray = ChunkedArray.compact(offsets);
        const offsetEncoding = classifyIntArray(offsetArray);
        const encodedOddsets = offsetEncoding.encode(offsetArray);
        const dataEncoding = classifyIntArray(output);
        const encodedData = dataEncoding.encode(output);
        return {
            encodings: [{ kind: 'StringArray', dataEncoding: encodedData.encoding, stringData: strings.join(''), offsetEncoding: encodedOddsets.encoding, offsets: encodedOddsets.data }],
            data: encodedData.data
        };
    }
    ArrayEncoding.stringArray = stringArray;
})(ArrayEncoding || (ArrayEncoding = {}));
