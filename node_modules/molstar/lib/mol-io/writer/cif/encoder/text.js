/**
 * Copyright (c) 2017-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted from CIFTools.js (https://github.com/dsehnal/CIFTools.js)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { StringBuilder } from '../../../../mol-util/string-builder';
import { Category } from '../encoder';
import { getFieldDigitCount, getIncludedFields, getCategoryInstanceData } from './util';
export class TextEncoder {
    constructor() {
        this.builder = StringBuilder.create();
        this.encoded = false;
        this.dataBlockCreated = false;
        this.filter = Category.DefaultFilter;
        this.formatter = Category.DefaultFormatter;
        this.isBinary = false;
        this.binaryEncodingProvider = void 0;
    }
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
        this.dataBlockCreated = true;
        StringBuilder.write(this.builder, `data_${(header || '').replace(/[ \n\t]/g, '').toUpperCase()}\n#\n`);
    }
    writeCategory(category, context, options) {
        if (this.encoded) {
            throw new Error('The writer contents have already been encoded, no more writing.');
        }
        if (!this.dataBlockCreated) {
            throw new Error('No data block created.');
        }
        if (!(options === null || options === void 0 ? void 0 : options.ignoreFilter) && !this.filter.includeCategory(category.name))
            return;
        const { instance, rowCount, source } = getCategoryInstanceData(category, context);
        if (!rowCount)
            return;
        if (rowCount === 1) {
            writeCifSingleRecord(category, instance, source, this.builder, this.filter, this.formatter);
        }
        else {
            writeCifLoop(category, instance, source, this.builder, this.filter, this.formatter);
        }
    }
    encode() {
        this.encoded = true;
    }
    writeTo(stream) {
        const chunks = StringBuilder.getChunks(this.builder);
        for (let i = 0, _i = chunks.length; i < _i; i++) {
            stream.writeString(chunks[i]);
        }
    }
    getSize() {
        return StringBuilder.getSize(this.builder);
    }
    getData() {
        return StringBuilder.getString(this.builder);
    }
}
function writeValue(builder, data, key, f, floatPrecision, index) {
    const kind = f.valueKind;
    const p = kind ? kind(key, data) : 0 /* Column.ValueKinds.Present */;
    if (p !== 0 /* Column.ValueKinds.Present */) {
        if (p === 1 /* Column.ValueKinds.NotPresent */)
            writeNotPresent(builder);
        else
            writeUnknown(builder);
    }
    else {
        const val = f.value(key, data, index);
        const t = f.type;
        if (t === 0 /* Field.Type.Str */) {
            if (isMultiline(val)) {
                writeMultiline(builder, val);
                return true;
            }
            else {
                return writeChecked(builder, val);
            }
        }
        else if (t === 1 /* Field.Type.Int */) {
            writeInteger(builder, val);
        }
        else {
            writeFloat(builder, val, floatPrecision);
        }
    }
    return false;
}
function getFloatPrecisions(categoryName, fields, formatter) {
    const ret = [];
    for (const f of fields) {
        const format = formatter.getFormat(categoryName, f.name);
        if (format && typeof format.digitCount !== 'undefined')
            ret[ret.length] = f.type === 2 /* Field.Type.Float */ ? Math.pow(10, Math.max(0, Math.min(format.digitCount, 15))) : 0;
        else
            ret[ret.length] = f.type === 2 /* Field.Type.Float */ ? Math.pow(10, getFieldDigitCount(f)) : 0;
    }
    return ret;
}
function writeCifSingleRecord(category, instance, source, builder, filter, formatter) {
    const fields = getIncludedFields(instance);
    const src = source[0];
    const data = src.data;
    let width = fields.reduce((w, f) => filter.includeField(category.name, f.name) ? Math.max(w, f.name.length) : 0, 0);
    // this means no field from this category is included.
    if (width === 0)
        return;
    width += category.name.length + 6;
    const it = src.keys();
    const key = it.move();
    const precisions = getFloatPrecisions(category.name, instance.fields, formatter);
    for (let _f = 0; _f < fields.length; _f++) {
        const f = fields[_f];
        if (!filter.includeField(category.name, f.name))
            continue;
        StringBuilder.writePadRight(builder, `_${category.name}.${f.name}`, width);
        const multiline = writeValue(builder, data, key, f, precisions[_f], 0);
        if (!multiline)
            StringBuilder.newline(builder);
    }
    StringBuilder.write(builder, '#\n');
}
function writeCifLoop(category, instance, source, builder, filter, formatter) {
    const fieldSource = getIncludedFields(instance);
    const fields = filter === Category.DefaultFilter ? fieldSource : fieldSource.filter(f => filter.includeField(category.name, f.name));
    const fieldCount = fields.length;
    if (fieldCount === 0)
        return;
    const precisions = getFloatPrecisions(category.name, fields, formatter);
    writeLine(builder, 'loop_');
    for (let i = 0; i < fieldCount; i++) {
        writeLine(builder, `_${category.name}.${fields[i].name}`);
    }
    let index = 0;
    for (let _c = 0; _c < source.length; _c++) {
        const src = source[_c];
        const data = src.data;
        if (src.rowCount === 0)
            continue;
        const it = src.keys();
        while (it.hasNext) {
            const key = it.move();
            let multiline = false;
            for (let _f = 0; _f < fieldCount; _f++) {
                multiline = writeValue(builder, data, key, fields[_f], precisions[_f], index);
            }
            if (!multiline)
                StringBuilder.newline(builder);
            index++;
        }
    }
    StringBuilder.write(builder, '#\n');
}
function isMultiline(value) {
    return typeof value === 'string' && value.indexOf('\n') >= 0;
}
function writeLine(builder, val) {
    StringBuilder.write(builder, val);
    StringBuilder.newline(builder);
}
function writeInteger(builder, val) {
    StringBuilder.writeInteger(builder, val);
    StringBuilder.whitespace1(builder);
}
function writeFloat(builder, val, precisionMultiplier) {
    StringBuilder.writeFloat(builder, val, precisionMultiplier);
    StringBuilder.whitespace1(builder);
}
function writeNotPresent(builder) {
    StringBuilder.writeSafe(builder, '. ');
}
function writeUnknown(builder) {
    StringBuilder.writeSafe(builder, '? ');
}
function writeChecked(builder, val) {
    if (!val) {
        StringBuilder.writeSafe(builder, '. ');
        return false;
    }
    const fst = val.charCodeAt(0);
    let escape = false;
    let escapeKind = 0; // 0 => ', 1 => "
    let hasSingleQuote = false, hasDoubleQuote = false;
    for (let i = 0, _l = val.length - 1; i <= _l; i++) {
        const c = val.charCodeAt(i);
        switch (c) {
            case 9: // \t
                escape = true;
                break;
            case 10: // \n
                writeMultiline(builder, val);
                return true;
            case 32: // ' '
                escape = true;
                break;
            case 34: // "
                // no need to escape quote if it's the last char and the length is > 1
                if (i && i === _l)
                    break;
                if (hasSingleQuote) {
                    // the string already has a " => use multiline value
                    writeMultiline(builder, val);
                    return true;
                }
                hasDoubleQuote = true;
                escape = true;
                escapeKind = 0;
                break;
            case 39: // '
                // no need to escape quote if it's the last char and the length is > 1
                if (i && i === _l)
                    break;
                if (hasDoubleQuote) {
                    writeMultiline(builder, val);
                    return true;
                }
                hasSingleQuote = true;
                escape = true;
                escapeKind = 1;
                break;
        }
    }
    if (!escape && (fst === 35 /* # */ || fst === 36 /* $ */ || fst === 59 /* ; */ || fst === 91 /* [ */ || fst === 93 /* ] */ || fst === 95 /* _ */)) {
        escape = true;
    }
    if (escape) {
        StringBuilder.writeSafe(builder, escapeKind ? '"' : '\'');
        StringBuilder.writeSafe(builder, val);
        StringBuilder.writeSafe(builder, escapeKind ? '" ' : '\' ');
    }
    else {
        StringBuilder.writeSafe(builder, val);
        StringBuilder.writeSafe(builder, ' ');
    }
    return false;
}
function writeMultiline(builder, val) {
    StringBuilder.writeSafe(builder, '\n;' + val);
    StringBuilder.writeSafe(builder, '\n;\n');
}
