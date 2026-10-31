/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
// import { Column } from 'mol-data/db'
import { TokenBuilder, Tokenizer } from '../common/text/tokenizer';
import * as Data from './data-model';
import { Field } from './field';
import { ReaderResult as Result } from '../result';
import { Task, chunkedSubtask, } from '../../../mol-task';
function State(data, runtimeCtx, opts) {
    const tokenizer = Tokenizer(data);
    return {
        data,
        tokenizer,
        tokenType: 2 /* CsvTokenType.End */,
        runtimeCtx,
        tokens: [],
        fieldCount: 0,
        recordCount: 0,
        columnCount: 0,
        columnNames: [],
        quoteCharCode: opts.quote.charCodeAt(0),
        commentCharCode: opts.comment.charCodeAt(0),
        delimiterCharCode: opts.delimiter.charCodeAt(0),
        noColumnNamesRecord: opts.noColumnNames
    };
}
/**
 * Eat everything until a delimiter or newline occurs.
 * Ignores whitespace at the end of the value, i.e. trim right.
 * Returns true when a newline occurs after the value.
 */
function eatValue(state, delimiterCharCode) {
    while (state.position < state.length) {
        const c = state.data.charCodeAt(state.position);
        ++state.position;
        switch (c) {
            case 10: // \n
            case 13: // \r
                return true;
            case delimiterCharCode:
                return;
            case 9: // \t
            case 32: // ' '
                break;
            default:
                ++state.tokenEnd;
                break;
        }
    }
}
/**
 * Eats a quoted value. Can contain a newline.
 * Returns true when a newline occurs after the quoted value.
 *
 * Embedded quotes are represented by a pair of double quotes:
 * - ""xx"" => "xx"
 */
function eatQuoted(state, quoteCharCode, delimiterCharCode) {
    ++state.position;
    while (state.position < state.length) {
        const c = state.data.charCodeAt(state.position);
        if (c === quoteCharCode) {
            const next = state.data.charCodeAt(state.position + 1);
            if (next !== quoteCharCode) {
                // get rid of the quotes.
                state.tokenStart++;
                state.tokenEnd = state.position;
                ++state.position;
                return skipEmpty(state, delimiterCharCode);
            }
        }
        ++state.position;
    }
    state.tokenEnd = state.position;
}
/**
 * Skips empty chars.
 * Returns true when the current char is a newline.
 */
function skipEmpty(state, delimiterCharCode) {
    while (state.position < state.length) {
        const c = state.data.charCodeAt(state.position);
        if (c !== 9 && c !== 32 && c !== delimiterCharCode) { // \t or ' '
            return c === 10 || c === 13; // \n or \r
        }
        ++state.position;
    }
}
function skipWhitespace(state) {
    let prev = -1;
    while (state.position < state.length) {
        const c = state.data.charCodeAt(state.position);
        switch (c) {
            case 9: // '\t'
            case 32: // ' '
                prev = c;
                ++state.position;
                break;
            case 10: // \n
                // handle \r\n
                if (prev !== 13) {
                    ++state.lineNumber;
                }
                prev = c;
                ++state.position;
                break;
            case 13: // \r
                prev = c;
                ++state.position;
                ++state.lineNumber;
                break;
            default:
                return;
        }
    }
}
function skipLine(state) {
    while (state.position < state.length) {
        const c = state.data.charCodeAt(state.position);
        if (c === 10 || c === 13)
            return; // \n or \r
        ++state.position;
    }
}
/**
 * Move to the next token.
 * Returns true when the current char is a newline, i.e. indicating a full record.
 */
function moveNextInternal(state) {
    const tokenizer = state.tokenizer;
    skipWhitespace(tokenizer);
    if (tokenizer.position >= tokenizer.length) {
        state.tokenType = 2 /* CsvTokenType.End */;
        return false;
    }
    tokenizer.tokenStart = tokenizer.position;
    tokenizer.tokenEnd = tokenizer.position;
    const c = state.data.charCodeAt(tokenizer.position);
    switch (c) {
        case state.commentCharCode:
            state.tokenType = 1 /* CsvTokenType.Comment */;
            skipLine(tokenizer);
            break;
        case state.quoteCharCode:
            state.tokenType = 0 /* CsvTokenType.Value */;
            return eatQuoted(tokenizer, state.quoteCharCode, state.delimiterCharCode);
        default:
            state.tokenType = 0 /* CsvTokenType.Value */;
            return eatValue(tokenizer, state.delimiterCharCode);
    }
}
/**
 * Moves to the next non-comment token/line.
 * Returns true when the current char is a newline, i.e. indicating a full record.
 */
function moveNext(state) {
    let newRecord = moveNextInternal(state);
    while (state.tokenType === 1 /* CsvTokenType.Comment */) {
        newRecord = moveNextInternal(state);
    }
    return newRecord;
}
function readRecordsChunk(chunkSize, state) {
    if (state.tokenType === 2 /* CsvTokenType.End */)
        return 0;
    let counter = 0;
    let newRecord;
    const { tokens, tokenizer } = state;
    while (state.tokenType === 0 /* CsvTokenType.Value */ && counter < chunkSize) {
        TokenBuilder.add(tokens[state.fieldCount % state.columnCount], tokenizer.tokenStart, tokenizer.tokenEnd);
        ++state.fieldCount;
        newRecord = moveNext(state);
        if (newRecord) {
            ++state.recordCount;
            ++counter;
        }
    }
    return counter;
}
function readRecordsChunks(state) {
    const newRecord = moveNext(state);
    if (newRecord)
        ++state.recordCount;
    return chunkedSubtask(state.runtimeCtx, 100000, state, readRecordsChunk, (ctx, state) => ctx.update({ message: 'Parsing...', current: state.tokenizer.position, max: state.data.length }));
}
function addColumn(state) {
    state.columnNames.push(Tokenizer.getTokenString(state.tokenizer));
    state.tokens.push(TokenBuilder.create(state.tokenizer.data, state.data.length / 80));
}
function init(state) {
    let newRecord = moveNext(state);
    while (!newRecord) {
        addColumn(state);
        newRecord = moveNext(state);
    }
    addColumn(state);
    state.columnCount = state.columnNames.length;
    if (state.noColumnNamesRecord) {
        state.columnNames.forEach((x, i, arr) => arr[i] = i + '');
        Tokenizer.reset(state.tokenizer);
    }
}
async function handleRecords(state) {
    init(state);
    await readRecordsChunks(state);
    const columns = Object.create(null);
    for (let i = 0; i < state.columnCount; ++i) {
        columns[state.columnNames[i]] = Field(state.tokens[i]);
    }
    return Data.CsvTable(state.recordCount, state.columnNames, columns);
}
async function parseInternal(data, ctx, opts) {
    const state = State(data, ctx, opts);
    ctx.update({ message: 'Parsing...', current: 0, max: data.length });
    const table = await handleRecords(state);
    const result = Data.CsvFile(table);
    return Result.success(result);
}
export function parseCsv(data, opts) {
    const completeOpts = Object.assign({}, { quote: '"', comment: '#', delimiter: ',', noColumnNames: false }, opts);
    return Task.create('Parse CSV', async (ctx) => {
        return await parseInternal(data, ctx, completeOpts);
    });
}
