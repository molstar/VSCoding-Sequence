"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePly = parsePly;
const result_1 = require("../result");
const mol_task_1 = require("../../../mol-task");
const schema_1 = require("./schema");
const tokenizer_1 = require("../common/text/tokenizer");
const db_1 = require("../../../mol-data/db");
const token_1 = require("../common/text/column/token");
function State(data, runtimeCtx) {
    const tokenizer = (0, tokenizer_1.Tokenizer)(data);
    return {
        data,
        tokenizer,
        runtimeCtx,
        comments: [],
        elementSpecs: [],
        elements: []
    };
}
function markHeader(tokenizer) {
    const endHeaderIndex = tokenizer.data.indexOf('end_header', tokenizer.position);
    if (endHeaderIndex === -1)
        throw new Error(`no 'end_header' record found`);
    // TODO set `tokenizer.lineNumber` correctly
    tokenizer.tokenStart = tokenizer.position;
    tokenizer.tokenEnd = endHeaderIndex;
    tokenizer.position = endHeaderIndex;
    tokenizer_1.Tokenizer.eatLine(tokenizer);
}
function parseHeader(state) {
    const { tokenizer, comments, elementSpecs } = state;
    markHeader(tokenizer);
    const headerLines = tokenizer_1.Tokenizer.getTokenString(tokenizer).split(/\r?\n/);
    if (headerLines[0] !== 'ply')
        throw new Error(`data not starting with 'ply'`);
    if (headerLines[1] !== 'format ascii 1.0')
        throw new Error(`format not 'ascii 1.0'`);
    let currentName;
    let currentCount;
    let currentProperties;
    function addCurrentElementSchema() {
        if (currentName !== undefined && currentCount !== undefined && currentProperties !== undefined) {
            let isList = false;
            for (let i = 0, il = currentProperties.length; i < il; ++i) {
                const p = currentProperties[i];
                if (p.kind === 'list') {
                    isList = true;
                    break;
                }
            }
            if (isList && currentProperties.length !== 1) {
                // TODO handle lists with appended properties
                //      currently only the list part will be accessible
            }
            if (isList) {
                elementSpecs.push({
                    kind: 'list',
                    name: currentName,
                    count: currentCount,
                    property: currentProperties[0]
                });
            }
            else {
                elementSpecs.push({
                    kind: 'table',
                    name: currentName,
                    count: currentCount,
                    properties: currentProperties
                });
            }
        }
    }
    for (let i = 2, il = headerLines.length; i < il; ++i) {
        const l = headerLines[i];
        const ls = l.split(' ');
        if (l.startsWith('comment')) {
            comments.push(l.substr(8));
        }
        else if (l.startsWith('element')) {
            addCurrentElementSchema();
            currentProperties = [];
            currentName = ls[1];
            currentCount = parseInt(ls[2]);
        }
        else if (l.startsWith('property')) {
            if (currentProperties === undefined)
                throw new Error(`properties outside of element`);
            if (ls[1] === 'list') {
                currentProperties.push({
                    kind: 'list',
                    countType: (0, schema_1.PlyType)(ls[2]),
                    dataType: (0, schema_1.PlyType)(ls[3]),
                    name: ls[4]
                });
            }
            else {
                currentProperties.push({
                    kind: 'column',
                    type: (0, schema_1.PlyType)(ls[1]),
                    name: ls[2]
                });
            }
        }
        else if (l.startsWith('end_header')) {
            addCurrentElementSchema();
        }
        else {
            console.warn('unknown header line');
        }
    }
}
function parseElements(state) {
    const { elementSpecs } = state;
    for (let i = 0, il = elementSpecs.length; i < il; ++i) {
        const spec = elementSpecs[i];
        if (spec.kind === 'table')
            parseTableElement(state, spec);
        else if (spec.kind === 'list')
            parseListElement(state, spec);
    }
}
function getColumnSchema(type) {
    switch (type) {
        case 'char':
        case 'uchar':
        case 'int8':
        case 'uint8':
        case 'short':
        case 'ushort':
        case 'int16':
        case 'uint16':
        case 'int':
        case 'uint':
        case 'int32':
        case 'uint32':
            return db_1.Column.Schema.int;
        case 'float':
        case 'double':
        case 'float32':
        case 'float64':
            return db_1.Column.Schema.float;
    }
}
function parseTableElement(state, spec) {
    const { elements, tokenizer } = state;
    const { count, properties } = spec;
    const propertyCount = properties.length;
    const propertyNames = [];
    const propertyTypes = [];
    const propertyTokens = [];
    const propertyColumns = new Map();
    for (let i = 0, il = propertyCount; i < il; ++i) {
        const tokens = tokenizer_1.TokenBuilder.create(tokenizer.data, count * 2);
        propertyTokens.push(tokens);
    }
    for (let i = 0, il = count; i < il; ++i) {
        for (let j = 0, jl = propertyCount; j < jl; ++j) {
            tokenizer_1.Tokenizer.skipWhitespace(tokenizer);
            tokenizer_1.Tokenizer.markStart(tokenizer);
            tokenizer_1.Tokenizer.eatValue(tokenizer);
            tokenizer_1.TokenBuilder.addUnchecked(propertyTokens[j], tokenizer.tokenStart, tokenizer.tokenEnd);
        }
    }
    for (let i = 0, il = propertyCount; i < il; ++i) {
        const { type, name } = properties[i];
        const column = (0, token_1.TokenColumn)(propertyTokens[i], getColumnSchema(type));
        propertyNames.push(name);
        propertyTypes.push(type);
        propertyColumns.set(name, column);
    }
    elements.push({
        kind: 'table',
        rowCount: count,
        propertyNames,
        propertyTypes,
        getProperty: (name) => propertyColumns.get(name)
    });
}
function parseListElement(state, spec) {
    const { elements, tokenizer } = state;
    const { count, property } = spec;
    // initial tokens size assumes triangle index data
    const tokens = tokenizer_1.TokenBuilder.create(tokenizer.data, count * 2 * 3);
    const offsets = new Uint32Array(count + 1);
    let entryCount = 0;
    for (let i = 0, il = count; i < il; ++i) {
        tokenizer_1.Tokenizer.skipWhitespace(tokenizer);
        tokenizer_1.Tokenizer.markStart(tokenizer);
        while (tokenizer_1.Tokenizer.skipWhitespace(tokenizer) !== 10) {
            ++entryCount;
            tokenizer_1.Tokenizer.markStart(tokenizer);
            tokenizer_1.Tokenizer.eatValue(tokenizer);
            tokenizer_1.TokenBuilder.addToken(tokens, tokenizer);
        }
        offsets[i + 1] = entryCount;
    }
    /** holds row value entries transiently */
    const listValue = {
        entries: [],
        count: 0
    };
    const column = (0, token_1.TokenColumn)(tokens, getColumnSchema(property.dataType));
    elements.push({
        kind: 'list',
        rowCount: count,
        name: property.name,
        type: property.dataType,
        value: (row) => {
            const offset = offsets[row] + 1;
            const count = column.value(offset - 1);
            for (let i = offset, il = offset + count; i < il; ++i) {
                listValue.entries[i - offset] = column.value(i);
            }
            listValue.count = count;
            return listValue;
        }
    });
}
async function parseInternal(data, ctx) {
    const state = State(data, ctx);
    ctx.update({ message: 'Parsing...', current: 0, max: data.length });
    parseHeader(state);
    parseElements(state);
    const { elements, elementSpecs, comments } = state;
    const elementNames = elementSpecs.map(s => s.name);
    const result = (0, schema_1.PlyFile)(elements, elementNames, comments);
    return result_1.ReaderResult.success(result);
}
function parsePly(data) {
    return mol_task_1.Task.create('Parse PLY', async (ctx) => {
        return await parseInternal(data, ctx);
    });
}
