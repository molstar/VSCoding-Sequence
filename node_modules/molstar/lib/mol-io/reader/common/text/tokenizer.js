/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * mostly from https://github.com/dsehnal/CIFTools.js
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { chunkedSubtask } from '../../../../mol-task';
export { Tokenizer };
function Tokenizer(data) {
    return {
        data,
        position: 0,
        length: data.length,
        lineNumber: 1,
        tokenStart: 0,
        tokenEnd: 0
    };
}
(function (Tokenizer) {
    function getTokenString(state) {
        return state.data.substring(state.tokenStart, state.tokenEnd);
    }
    Tokenizer.getTokenString = getTokenString;
    /** Resets the state */
    function reset(state) {
        state.position = 0;
        state.lineNumber = 1;
        state.tokenStart = 0;
        state.tokenEnd = 0;
    }
    Tokenizer.reset = reset;
    /**
     * Eat everything until a newline occurs.
     */
    function eatLine(state) {
        const { data } = state;
        while (state.position < state.length) {
            switch (data.charCodeAt(state.position)) {
                case 10: // \n
                    state.tokenEnd = state.position;
                    ++state.position;
                    ++state.lineNumber;
                    return true;
                case 13: // \r
                    state.tokenEnd = state.position;
                    ++state.position;
                    ++state.lineNumber;
                    if (data.charCodeAt(state.position) === 10) {
                        ++state.position;
                    }
                    return true;
                default:
                    ++state.position;
                    break;
            }
        }
        state.tokenEnd = state.position;
        return state.tokenStart !== state.tokenEnd;
    }
    Tokenizer.eatLine = eatLine;
    /** Sets the current token start to the current position */
    function markStart(state) {
        state.tokenStart = state.position;
    }
    Tokenizer.markStart = markStart;
    /** Sets the current token start to current position and moves to the next line. */
    function markLine(state) {
        state.tokenStart = state.position;
        return eatLine(state);
    }
    Tokenizer.markLine = markLine;
    /** Advance the state and return line as string. */
    function readLine(state) {
        markLine(state);
        return getTokenString(state);
    }
    Tokenizer.readLine = readLine;
    /** Advance the state and return trimmed line as string. */
    function readLineTrim(state) {
        markLine(state);
        const position = state.position;
        trim(state, state.tokenStart, state.tokenEnd);
        state.position = position;
        return getTokenString(state);
    }
    Tokenizer.readLineTrim = readLineTrim;
    function readLinesChunk(state, count, tokens) {
        let read = 0;
        for (let i = 0; i < count; i++) {
            if (!markLine(state))
                return read;
            TokenBuilder.addUnchecked(tokens, state.tokenStart, state.tokenEnd);
            read++;
        }
        return read;
    }
    /** Advance the state by the given number of lines and return them*/
    function markLines(state, count) {
        const lineTokens = TokenBuilder.create(state.data, count * 2);
        readLinesChunk(state, count, lineTokens);
        return lineTokens;
    }
    Tokenizer.markLines = markLines;
    /** Advance the state by the given number of lines and return them */
    function readLines(state, count) {
        const ret = [];
        for (let i = 0; i < count; i++) {
            ret.push(Tokenizer.readLine(state));
        }
        return ret;
    }
    Tokenizer.readLines = readLines;
    /** Advance the state by the given number of lines and return line starts/ends as tokens. */
    async function readLinesAsync(state, count, ctx, initialLineCount = 100000) {
        const lineTokens = TokenBuilder.create(state.data, count * 2);
        let linesAlreadyRead = 0;
        await chunkedSubtask(ctx, initialLineCount, state, (chunkSize, state) => {
            const linesToRead = Math.min(count - linesAlreadyRead, chunkSize);
            readLinesChunk(state, linesToRead, lineTokens);
            linesAlreadyRead += linesToRead;
            return linesToRead;
        }, (ctx, state) => ctx.update({ message: 'Parsing...', current: state.position, max: state.length }));
        return lineTokens;
    }
    Tokenizer.readLinesAsync = readLinesAsync;
    function readAllLines(data) {
        const state = Tokenizer(data);
        const tokens = TokenBuilder.create(state.data, Math.max(data.length / 80, 2));
        while (markLine(state)) {
            TokenBuilder.add(tokens, state.tokenStart, state.tokenEnd);
        }
        return tokens;
    }
    Tokenizer.readAllLines = readAllLines;
    function readLinesChunkChecked(state, count, tokens) {
        let read = 0;
        for (let i = 0; i < count; i++) {
            if (!markLine(state))
                return read;
            TokenBuilder.add(tokens, state.tokenStart, state.tokenEnd);
            read++;
        }
        return read;
    }
    async function readAllLinesAsync(data, ctx, chunkSize = 100000) {
        const state = Tokenizer(data);
        const tokens = TokenBuilder.create(state.data, Math.max(data.length / 80, 2));
        await chunkedSubtask(ctx, chunkSize, state, (chunkSize, state) => {
            readLinesChunkChecked(state, chunkSize, tokens);
            return state.position < state.length ? chunkSize : 0;
        }, (ctx, state) => ctx.update({ message: 'Parsing...', current: state.position, max: state.length }));
        return tokens;
    }
    Tokenizer.readAllLinesAsync = readAllLinesAsync;
    /**
     * Eat everything until a whitespace/newline occurs.
     */
    function eatValue(state) {
        while (state.position < state.length) {
            switch (state.data.charCodeAt(state.position)) {
                case 9: // \t
                case 10: // \n
                case 13: // \r
                case 32: // ' '
                    state.tokenEnd = state.position;
                    return;
                default:
                    ++state.position;
                    break;
            }
        }
        state.tokenEnd = state.position;
    }
    Tokenizer.eatValue = eatValue;
    /**
     * Skips all the whitespace - space, tab, newline, CR
     * Handles incrementing line count.
     */
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
                    return prev;
            }
        }
        return prev;
    }
    Tokenizer.skipWhitespace = skipWhitespace;
    /** Skips all the whitespace */
    function skipStrictWhitespace(state) {
        let prev = -1;
        while (state.position < state.length) {
            const c = state.data.charCodeAt(state.position);
            switch (c) {
                case 9: // '\t'
                case 32: // ' '
                    prev = c;
                    ++state.position;
                    break;
                default:
                    return prev;
            }
        }
        return prev;
    }
    Tokenizer.skipStrictWhitespace = skipStrictWhitespace;
    /** Trims spaces and tabs */
    function trim(state, start, end) {
        const { data } = state;
        let s = start, e = end - 1;
        let c = data.charCodeAt(s);
        while ((c === 9 || c === 32) && s <= e)
            c = data.charCodeAt(++s);
        c = data.charCodeAt(e);
        while ((c === 9 || c === 32) && e >= s)
            c = data.charCodeAt(--e);
        state.tokenStart = s;
        state.tokenEnd = e + 1;
        state.position = end;
        return state;
    }
    Tokenizer.trim = trim;
})(Tokenizer || (Tokenizer = {}));
export function trimStr(data, start, end) {
    let s = start, e = end - 1;
    let c = data.charCodeAt(s);
    while ((c === 9 || c === 32) && s <= e)
        c = data.charCodeAt(++s);
    c = data.charCodeAt(e);
    while ((c === 9 || c === 32) && e >= s)
        c = data.charCodeAt(--e);
    return data.substring(s, e + 1);
}
export var TokenBuilder;
(function (TokenBuilder) {
    function resize(builder) {
        // scale the size using golden ratio, because why not.
        const newBuffer = new Uint32Array((1.61 * builder.indices.length) | 0);
        newBuffer.set(builder.indices);
        builder.indices = newBuffer;
        builder.indicesLenMinus2 = (newBuffer.length - 2) | 0;
    }
    function add(tokens, start, end) {
        const builder = tokens;
        if (builder.offset > builder.indicesLenMinus2) {
            resize(builder);
        }
        builder.indices[builder.offset++] = start;
        builder.indices[builder.offset++] = end;
        tokens.count++;
    }
    TokenBuilder.add = add;
    function addToken(tokens, tokenizer) {
        add(tokens, tokenizer.tokenStart, tokenizer.tokenEnd);
    }
    TokenBuilder.addToken = addToken;
    function addUnchecked(tokens, start, end) {
        tokens.indices[tokens.offset++] = start;
        tokens.indices[tokens.offset++] = end;
        tokens.count++;
    }
    TokenBuilder.addUnchecked = addUnchecked;
    function create(data, size) {
        size = Math.max(10, size);
        return {
            data,
            indicesLenMinus2: (size - 2) | 0,
            count: 0,
            offset: 0,
            indices: new Uint32Array(size)
        };
    }
    TokenBuilder.create = create;
})(TokenBuilder || (TokenBuilder = {}));
