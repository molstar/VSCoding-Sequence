/**
 * Copyright (c) 2017-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted from CIFTools.js (https://github.com/dsehnal/CIFTools.js)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { encodeMsgPack } from '../../../common/msgpack/encode';
import { ArrayEncoder, ArrayEncoding as E, VERSION } from '../../../common/binary-cif';
import { Category } from '../encoder';
import { getIncludedFields, getCategoryInstanceData } from './util';
import { classifyIntArray, classifyFloatArray } from '../../../common/binary-cif/classifier';
export class BinaryEncoder {
    setFilter(filter) {
        this.filter = filter || Category.DefaultFilter;
    }
    isCategoryIncluded(name) {
        return this.filter.includeCategory(name);
    }
    setFormatter(formatter) {
        this.formatter = formatter || Category.DefaultFormatter;
    }
    startDataBlock(header) {
        this.dataBlocks.push({
            header: (header || '').replace(/[ \n\t]/g, '').toUpperCase(),
            categories: []
        });
    }
    writeCategory(category, context, options) {
        if (!this.data) {
            throw new Error('The writer contents have already been encoded, no more writing.');
        }
        if (!this.dataBlocks.length) {
            throw new Error('No data block created.');
        }
        if (!(options === null || options === void 0 ? void 0 : options.ignoreFilter) && !this.filter.includeCategory(category.name))
            return;
        const { instance, rowCount, source } = getCategoryInstanceData(category, context);
        if (!rowCount)
            return;
        const cat = { name: '_' + category.name, columns: [], rowCount };
        const fields = getIncludedFields(instance);
        for (const f of fields) {
            if (!this.filter.includeField(category.name, f.name))
                continue;
            const format = this.formatter.getFormat(category.name, f.name);
            cat.columns.push(encodeField(category.name, f, source, rowCount, format, this.binaryEncodingProvider, this.autoClassify));
        }
        // no columns included.
        if (!cat.columns.length)
            return;
        this.dataBlocks[this.dataBlocks.length - 1].categories.push(cat);
    }
    encode() {
        if (this.encodedData)
            return;
        this.encodedData = encodeMsgPack(this.data);
        this.data = null;
        this.dataBlocks = null;
    }
    writeTo(writer) {
        writer.writeBinary(this.encodedData);
    }
    getData() {
        this.encode();
        return this.encodedData;
    }
    getSize() {
        return this.encodedData.length;
    }
    constructor(encoder, encodingProvider, autoClassify) {
        this.autoClassify = autoClassify;
        this.dataBlocks = [];
        this.filter = Category.DefaultFilter;
        this.formatter = Category.DefaultFormatter;
        this.isBinary = true;
        this.binaryEncodingProvider = void 0;
        this.binaryEncodingProvider = encodingProvider;
        this.data = {
            encoder,
            version: VERSION,
            dataBlocks: this.dataBlocks
        };
    }
}
function getArrayCtor(field, format) {
    if (format && format.typedArray)
        return format.typedArray;
    if (field.defaultFormat && field.defaultFormat.typedArray)
        return field.defaultFormat.typedArray;
    if (field.type === 0 /* Field.Type.Str */)
        return Array;
    if (field.type === 1 /* Field.Type.Int */)
        return Int32Array;
    return Float64Array;
}
function getDefaultEncoder(type) {
    if (type === 0 /* Field.Type.Str */)
        return ArrayEncoder.by(E.stringArray);
    return ArrayEncoder.by(E.byteArray);
}
function tryGetEncoder(categoryName, field, format, provider) {
    if (format && format.encoder) {
        return format.encoder;
    }
    else if (field.defaultFormat && field.defaultFormat.encoder) {
        return field.defaultFormat.encoder;
    }
    else if (provider) {
        return provider.get(categoryName, field.name);
    }
    else {
        return void 0;
    }
}
function classify(type, data) {
    if (type === 0 /* Field.Type.Str */)
        return ArrayEncoder.by(E.stringArray);
    if (type === 1 /* Field.Type.Int */)
        return classifyIntArray(data);
    return classifyFloatArray(data);
}
function encodeField(categoryName, field, data, totalCount, format, encoderProvider, autoClassify) {
    const { array, allPresent, mask } = getFieldData(field, getArrayCtor(field, format), totalCount, data);
    let encoder;
    if (field.type === 0 /* Field.Type.Str */) {
        // Force string array encoding if field type is str to prevent conflicts between
        // encoderProvider (determined by automatic classifier) and field type comming from a CIF schema
        encoder = ArrayEncoder.by(E.stringArray);
    }
    else {
        encoder = tryGetEncoder(categoryName, field, format, encoderProvider);
    }
    if (!encoder) {
        if (autoClassify)
            encoder = classify(field.type, array);
        else
            encoder = getDefaultEncoder(field.type);
    }
    const encoded = encoder.encode(array);
    let maskData = void 0;
    if (!allPresent) {
        const maskRLE = ArrayEncoder.by(E.runLength).and(E.byteArray).encode(mask);
        if (maskRLE.data.length < mask.length) {
            maskData = maskRLE;
        }
        else {
            maskData = ArrayEncoder.by(E.byteArray).encode(mask);
        }
    }
    return {
        name: field.name,
        data: encoded,
        mask: maskData
    };
}
function getFieldData(field, arrayCtor, totalCount, data) {
    const isStr = field.type === 0 /* Field.Type.Str */;
    const array = new arrayCtor(totalCount);
    const mask = new Uint8Array(totalCount);
    const valueKind = field.valueKind;
    const getter = field.value;
    let allPresent = true;
    let offset = 0;
    for (let _d = 0; _d < data.length; _d++) {
        const d = data[_d].data;
        const keys = data[_d].keys();
        while (keys.hasNext) {
            const key = keys.move();
            const p = valueKind ? valueKind(key, d) : 0 /* Column.ValueKinds.Present */;
            if (p !== 0 /* Column.ValueKinds.Present */) {
                mask[offset] = p;
                if (isStr)
                    array[offset] = '';
                allPresent = false;
            }
            else {
                const value = getter(key, d, offset);
                if (typeof value === 'string' && !value) {
                    mask[offset] = 1 /* Column.ValueKinds.NotPresent */;
                    allPresent = false;
                }
                else {
                    mask[offset] = 0 /* Column.ValueKinds.Present */;
                }
                array[offset] = value;
            }
            offset++;
        }
    }
    return { array, allPresent, mask };
}
