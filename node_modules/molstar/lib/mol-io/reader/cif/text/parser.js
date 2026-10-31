/**
 * Copyright (c) 2017-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
/**
 * mmCIF parser.
 *
 * Trying to be as close to the specification http://www.iucr.org/resources/cif/spec/version1.1/cifsyntax
 *
 * Differences I'm aware of:
 * - Except keywords (data_, loop_, save_) everything is case sensitive.
 * - The tokens . and ? are treated the same as the values '.' and '?'.
 * - Ignores \ in the multiline values:
 *     ;abc\
 *     efg
 *     ;
 *   should have the value 'abcefg' but will have the value 'abc\\nefg' instead.
 *   Post processing of this is left to the consumer of the data.
 * - Similarly, things like punctuation (\', ..) are left to be processed by the user if needed.
 *
 */
import * as Data from '../data-model';
import { TokenBuilder, Tokenizer } from '../../common/text/tokenizer';
import { ReaderResult as Result } from '../../result';
import { Task, chunkedSubtask } from '../../../../mol-task';
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
/**
 * Eats an escaped value. Handles the "degenerate" cases as well.
 *
 * "Degenerate" cases:
 * - 'xx'x' => xx'x
 * - 'xxxNEWLINE => 'xxx
 *
 */
function eatEscaped(state, esc) {
    let next, c;
    ++state.position;
    while (state.position < state.length) {
        c = state.data.charCodeAt(state.position);
        if (c === esc) {
            next = state.data.charCodeAt(state.position + 1);
            switch (next) {
                case 9: // \t
                case 10: // \n
                case 13: // \r
                case 32: // ' '
                    // get rid of the quotes.
                    state.tokenStart++;
                    state.tokenEnd = state.position;
                    state.isEscaped = true;
                    ++state.position;
                    return;
                default:
                    if (next === void 0) { // = "end of stream"
                        // get rid of the quotes.
                        state.tokenStart++;
                        state.tokenEnd = state.position;
                        state.isEscaped = true;
                        ++state.position;
                        return;
                    }
                    ++state.position;
                    break;
            }
        }
        else {
            // handle 'xxxNEWLINE => 'xxx
            if (c === 10 || c === 13) {
                state.tokenEnd = state.position;
                return;
            }
            ++state.position;
        }
    }
    state.tokenEnd = state.position;
}
/**
 * Eats an escaped value "triple quote" (''') value.
 */
function eatTripleQuote(state) {
    // skip the '''
    state.position += 3;
    while (state.position < state.length) {
        if (state.data.charCodeAt(state.position) === 39 /* ' */ && isTripleQuoteAtPosition(state)) {
            // get rid of the quotes.
            state.tokenStart += 3;
            state.tokenEnd = state.position;
            state.isEscaped = true;
            state.position += 3;
            return;
        }
        ++state.position;
    }
    state.tokenEnd = state.position;
}
/**
 * Eats a multiline token of the form NL;....NL;
 */
function eatMultiline(state) {
    let prev = 59, pos = state.position + 1, c;
    while (pos < state.length) {
        c = state.data.charCodeAt(pos);
        if (c === 59 && (prev === 10 || prev === 13)) { // ;, \n \r
            state.position = pos + 1;
            // get rid of the ;
            state.tokenStart++;
            // remove trailing newlines
            pos--;
            c = state.data.charCodeAt(pos);
            while (c === 10 || c === 13) {
                pos--;
                c = state.data.charCodeAt(pos);
            }
            state.tokenEnd = pos + 1;
            state.isEscaped = true;
            return;
        }
        else {
            // handle line numbers
            if (c === 13) { // \r
                state.lineNumber++;
            }
            else if (c === 10 && prev !== 13) { // \r\n
                state.lineNumber++;
            }
            prev = c;
            ++pos;
        }
    }
    state.position = pos;
    return prev;
}
function eatImportGet(state) {
    // _import.get [{'save':orient_matrix  'file':templ_attr.cif}]
    // skipWhitespace(state)
    while (state.position < state.length) {
        switch (state.data.charCodeAt(state.position)) {
            case 93: // ]
                ++state.position;
                state.tokenEnd = state.position;
                state.isImportGet = false;
                return;
            default:
                ++state.position;
                break;
        }
    }
}
/**
 * Skips until \n or \r occurs -- therefore the newlines get handled by the "skipWhitespace" function.
 */
function skipCommentLine(state) {
    while (state.position < state.length) {
        const c = state.data.charCodeAt(state.position);
        if (c === 10 || c === 13) {
            return;
        }
        ++state.position;
    }
}
/**
 * Skips all the whitespace - space, tab, newline, CR
 * Handles incrementing line count.
 */
function skipWhitespace(state) {
    let prev = 10;
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
/**
 * Returns true if there are two consecutive ' in +1 and +2 positions.
 */
function isTripleQuoteAtPosition(state) {
    if (state.length - state.position < 2)
        return false;
    if (state.data.charCodeAt(state.position + 1) !== 39)
        return false; // '
    if (state.data.charCodeAt(state.position + 2) !== 39)
        return false; // '
    return true;
}
function isData(state) {
    // here we already assume the 5th char is _ and that the length >= 5
    // d/D
    let c = state.data.charCodeAt(state.tokenStart);
    if (c !== 68 && c !== 100)
        return false;
    // a/A
    c = state.data.charCodeAt(state.tokenStart + 1);
    if (c !== 65 && c !== 97)
        return false;
    // t/t
    c = state.data.charCodeAt(state.tokenStart + 2);
    if (c !== 84 && c !== 116)
        return false;
    // a/A
    c = state.data.charCodeAt(state.tokenStart + 3);
    if (c !== 65 && c !== 97)
        return false;
    return true;
}
function isSave(state) {
    // here we already assume the 5th char is _ and that the length >= 5
    // s/S
    let c = state.data.charCodeAt(state.tokenStart);
    if (c !== 83 && c !== 115)
        return false;
    // a/A
    c = state.data.charCodeAt(state.tokenStart + 1);
    if (c !== 65 && c !== 97)
        return false;
    // v/V
    c = state.data.charCodeAt(state.tokenStart + 2);
    if (c !== 86 && c !== 118)
        return false;
    // e/E
    c = state.data.charCodeAt(state.tokenStart + 3);
    if (c !== 69 && c !== 101)
        return false;
    return true;
}
function isLoop(state) {
    // here we already assume the 5th char is _ and that the length >= 5
    if (state.tokenEnd - state.tokenStart !== 5)
        return false;
    // l/L
    let c = state.data.charCodeAt(state.tokenStart);
    if (c !== 76 && c !== 108)
        return false;
    // o/O
    c = state.data.charCodeAt(state.tokenStart + 1);
    if (c !== 79 && c !== 111)
        return false;
    // o/O
    c = state.data.charCodeAt(state.tokenStart + 2);
    if (c !== 79 && c !== 111)
        return false;
    // p/P
    c = state.data.charCodeAt(state.tokenStart + 3);
    if (c !== 80 && c !== 112)
        return false;
    return true;
}
function isImportGet(state) {
    // _import.get [{'save':orient_matrix  'file':templ_attr.cif}]
    if (state.tokenEnd - state.tokenStart !== 11)
        return false;
    if (state.data.charCodeAt(state.tokenStart + 1) !== 105)
        return false; // i
    if (state.data.charCodeAt(state.tokenStart + 2) !== 109)
        return false; // m
    if (state.data.charCodeAt(state.tokenStart + 3) !== 112)
        return false; // p
    if (state.data.charCodeAt(state.tokenStart + 4) !== 111)
        return false; // o
    if (state.data.charCodeAt(state.tokenStart + 5) !== 114)
        return false; // r
    if (state.data.charCodeAt(state.tokenStart + 6) !== 116)
        return false; // t
    if (state.data.charCodeAt(state.tokenStart + 7) !== 46)
        return false; // .
    if (state.data.charCodeAt(state.tokenStart + 8) !== 103)
        return false; // g
    if (state.data.charCodeAt(state.tokenStart + 9) !== 101)
        return false; // e
    if (state.data.charCodeAt(state.tokenStart + 10) !== 116)
        return false; // t
    return true;
}
/**
 * Checks if the current token shares the namespace with string at <start,end).
 */
function isNamespace(state, start, end) {
    let i;
    const nsLen = end - start;
    const offset = state.tokenStart - start;
    const tokenLen = state.tokenEnd - state.tokenStart;
    if (tokenLen < nsLen)
        return false;
    for (i = start; i < end; ++i) {
        if (state.data.charCodeAt(i) !== state.data.charCodeAt(i + offset))
            return false;
    }
    if (nsLen === tokenLen)
        return true;
    if (state.data.charCodeAt(i + offset) === 46) { // .
        return true;
    }
    return false;
}
/**
 * Returns the index of '.' in the current token. If no '.' is present, returns currentTokenEnd.
 */
function getNamespaceEnd(state) {
    let i;
    for (i = state.tokenStart; i < state.tokenEnd; ++i) {
        if (state.data.charCodeAt(i) === 46)
            return i;
    }
    return i;
}
/**
 * Get the namespace string. endIndex is obtained by the getNamespaceEnd() function.
 */
function getNamespace(state, endIndex) {
    return state.data.substring(state.tokenStart, endIndex);
}
/**
 * Returns true if the current token contain no '.', otherwise returns false.
 */
function isFlatNamespace(state) {
    let i;
    for (i = state.tokenStart; i < state.tokenEnd; ++i) {
        if (state.data.charCodeAt(i) === 46)
            return false;
    }
    return true;
}
/**
 * String representation of the current token.
 */
function getTokenString(state) {
    return state.data.substring(state.tokenStart, state.tokenEnd);
}
/**
 * Move to the next token.
 */
function moveNextInternal(state) {
    const prev = skipWhitespace(state);
    if (state.position >= state.length) {
        state.tokenType = 6 /* CifTokenType.End */;
        return;
    }
    state.tokenStart = state.position;
    state.tokenEnd = state.position;
    state.isEscaped = false;
    const c = state.data.charCodeAt(state.position);
    switch (c) {
        case 35: // #, comment
            skipCommentLine(state);
            state.tokenType = 5 /* CifTokenType.Comment */;
            break;
        case 39: // ', escaped value
            if (isTripleQuoteAtPosition(state)) {
                eatTripleQuote(state);
                state.tokenType = 3 /* CifTokenType.Value */;
                break;
            }
        case 34: // ", escaped value
            eatEscaped(state, c);
            state.tokenType = 3 /* CifTokenType.Value */;
            break;
        case 59: // ;, possible multiline value
            // multiline value must start at the beginning of the line.
            if (prev === 10 || prev === 13) { // /n or /r
                eatMultiline(state);
            }
            else {
                eatValue(state);
            }
            state.tokenType = 3 /* CifTokenType.Value */;
            break;
        default:
            if (state.isImportGet) {
                eatImportGet(state);
            }
            else {
                eatValue(state);
            }
            // escaped is always Value
            if (state.isEscaped) {
                state.tokenType = 3 /* CifTokenType.Value */;
                // _ means column name, including _import.get
            }
            else if (state.data.charCodeAt(state.tokenStart) === 95) { // _
                if (state.inSaveFrame && isImportGet(state)) {
                    state.isImportGet = true;
                }
                state.tokenType = 4 /* CifTokenType.ColumnName */;
                // 5th char needs to be _ for data_, save_ or loop_
            }
            else if (state.tokenEnd - state.tokenStart >= 5 && state.data.charCodeAt(state.tokenStart + 4) === 95) {
                if (isData(state))
                    state.tokenType = 0 /* CifTokenType.Data */;
                else if (isSave(state))
                    state.tokenType = 1 /* CifTokenType.Save */;
                else if (isLoop(state))
                    state.tokenType = 2 /* CifTokenType.Loop */;
                else
                    state.tokenType = 3 /* CifTokenType.Value */;
                // all other tests failed, we are at Value token.
            }
            else {
                state.tokenType = 3 /* CifTokenType.Value */;
            }
            break;
    }
}
/**
 * Moves to the next non-comment token.
 */
function moveNext(state) {
    moveNextInternal(state);
    while (state.tokenType === 5 /* CifTokenType.Comment */)
        moveNextInternal(state);
}
function createTokenizer(data, runtimeCtx) {
    return {
        data,
        length: data.length,
        position: 0,
        tokenStart: 0,
        tokenEnd: 0,
        tokenType: 6 /* CifTokenType.End */,
        lineNumber: 1,
        isEscaped: false,
        isImportGet: false,
        inSaveFrame: false,
        runtimeCtx
    };
}
function FrameContext() {
    return { categoryNames: [], categoryData: Object.create(null) };
}
function CifCategories(categoryNames, categoryData) {
    const categories = Object.create(null);
    for (const name of categoryNames) {
        const d = categoryData[name];
        categories[name] = Data.CifCategory(d.name, d.rowCount, d.fieldNames, d.fields);
    }
    return categories;
}
function CifBlock(ctx, header, saveFrames) {
    return Data.CifBlock(ctx.categoryNames, CifCategories(ctx.categoryNames, ctx.categoryData), header, saveFrames);
}
function CifSaveFrame(ctx, header) {
    return Data.CifBlock(ctx.categoryNames, CifCategories(ctx.categoryNames, ctx.categoryData), header);
}
function addFields(ctx, name, rowCount, fieldNames, fields) {
    if (name in ctx.categoryData) {
        const cat = ctx.categoryData[name];
        cat.fieldNames.push(...fieldNames);
        Object.assign(cat.fields, fields);
    }
    else {
        ctx.categoryData[name] = { name, rowCount, fieldNames, fields };
        ctx.categoryNames.push(name);
    }
}
/**
 * Reads a category containing a single row.
 */
function handleSingle(tokenizer, ctx) {
    const nsStart = tokenizer.tokenStart, nsEnd = getNamespaceEnd(tokenizer);
    const name = getNamespace(tokenizer, nsEnd);
    const fields = Object.create(null);
    const fieldNames = [];
    let readingNames = true;
    while (readingNames) {
        if (tokenizer.tokenType !== 4 /* CifTokenType.ColumnName */ || !isNamespace(tokenizer, nsStart, nsEnd)) {
            readingNames = false;
            break;
        }
        const fieldName = getTokenString(tokenizer).substring(name.length + 1);
        moveNext(tokenizer);
        if (tokenizer.tokenType !== 3 /* CifTokenType.Value */) {
            return {
                hasError: true,
                errorLine: tokenizer.lineNumber,
                errorMessage: 'Expected value.'
            };
        }
        fields[fieldName] = Data.CifField.ofTokens({ data: tokenizer.data, indices: [tokenizer.tokenStart, tokenizer.tokenEnd], count: 1 });
        fieldNames[fieldNames.length] = fieldName;
        moveNext(tokenizer);
    }
    addFields(ctx, name.substr(1), 1, fieldNames, fields);
    return {
        hasError: false,
        errorLine: 0,
        errorMessage: ''
    };
}
function readLoopChunk(chunkSize, state) {
    const { tokenizer, tokens, fieldCount } = state;
    let tokenCount = state.tokenCount;
    let counter = 0;
    while (tokenizer.tokenType === 3 /* CifTokenType.Value */ && counter < chunkSize) {
        TokenBuilder.add(tokens[(tokenCount++) % fieldCount], tokenizer.tokenStart, tokenizer.tokenEnd);
        moveNext(tokenizer);
        counter++;
    }
    state.tokenCount = tokenCount;
    return counter;
}
function updateLoopChunk(ctx, state) {
    return ctx.update({ message: 'Parsing...', current: state.tokenizer.position, max: state.tokenizer.data.length });
}
// const readLoopChunks = ChunkedSubtask(1000000,
//     (size, state: LoopReadState) => readLoopChunk(state, size),
//     (ctx, state) => ctx.update({ message: 'Parsing...', current: state.tokenizer.position, max: state.tokenizer.data.length }));
/**
 * Reads a loop.
 */
async function handleLoop(tokenizer, ctx) {
    const loopLine = tokenizer.lineNumber;
    moveNext(tokenizer);
    const name = getNamespace(tokenizer, getNamespaceEnd(tokenizer));
    const isFlat = isFlatNamespace(tokenizer);
    const fieldNames = [];
    while (tokenizer.tokenType === 4 /* CifTokenType.ColumnName */) {
        fieldNames[fieldNames.length] = isFlat
            ? getTokenString(tokenizer)
            : getTokenString(tokenizer).substring(name.length + 1);
        moveNext(tokenizer);
    }
    const rowCountEstimate = name === '_atom_site' ? (tokenizer.data.length / 100) | 0 : 32;
    const tokens = [];
    const fieldCount = fieldNames.length;
    for (let i = 0; i < fieldCount; i++)
        tokens[i] = TokenBuilder.create(tokenizer.data, rowCountEstimate);
    const state = {
        fieldCount,
        tokenCount: 0,
        tokenizer,
        tokens
    };
    await chunkedSubtask(tokenizer.runtimeCtx, 1000000, state, readLoopChunk, updateLoopChunk);
    if (state.tokenCount % fieldCount !== 0) {
        return {
            hasError: true,
            errorLine: tokenizer.lineNumber,
            errorMessage: `The number of values for loop starting at line ${loopLine} is not a multiple of the number of columns.`
        };
    }
    const rowCount = (state.tokenCount / fieldCount) | 0;
    if (isFlat) {
        for (let i = 0; i < fieldCount; i++) {
            const fields = { '': Data.CifField.ofTokens(tokens[i]) };
            addFields(ctx, fieldNames[i].substr(1), rowCount, [''], fields);
        }
    }
    else {
        const fields = Object.create(null);
        for (let i = 0; i < fieldCount; i++) {
            fields[fieldNames[i]] = Data.CifField.ofTokens(tokens[i]);
        }
        addFields(ctx, name.substr(1), rowCount, fieldNames, fields);
    }
    return {
        hasError: false,
        errorLine: 0,
        errorMessage: ''
    };
}
/**
 * Creates an error result.
 */
function error(line, message) {
    return Result.error(message, line);
}
/**
 * Creates a data result.
 */
function result(data) {
    return Result.success(data);
}
/**
 * Parses an mmCIF file.
 *
 * @returns CifParserResult wrapper of the result.
 */
async function parseInternal(data, runtimeCtx) {
    const dataBlocks = [];
    const tokenizer = createTokenizer(data, runtimeCtx);
    let blockHeader = '';
    let blockCtx = FrameContext();
    // the next three initial values are never used in valid files
    let saveFrames = [];
    let saveCtx = FrameContext();
    const saveFrame = Data.CifSaveFrame(saveCtx.categoryNames, CifCategories(saveCtx.categoryNames, saveCtx.categoryData), '');
    let saveHeader = '';
    runtimeCtx.update({ message: 'Parsing...', current: 0, max: data.length });
    moveNext(tokenizer);
    while (tokenizer.tokenType !== 6 /* CifTokenType.End */) {
        const token = tokenizer.tokenType;
        // Data block
        if (token === 0 /* CifTokenType.Data */) {
            if (tokenizer.inSaveFrame) {
                return error(tokenizer.lineNumber, 'Unexpected data block inside a save frame.');
            }
            if (blockCtx.categoryNames.length > 0) {
                dataBlocks.push(CifBlock(blockCtx, blockHeader, saveFrames));
            }
            blockHeader = data.substring(tokenizer.tokenStart + 5, tokenizer.tokenEnd);
            blockCtx = FrameContext();
            saveFrames = [];
            moveNext(tokenizer);
            // Save frame
        }
        else if (token === 1 /* CifTokenType.Save */) {
            if (tokenizer.tokenEnd - tokenizer.tokenStart === 5) { // end of save frame
                if (saveCtx.categoryNames.length > 0) {
                    saveFrames[saveFrames.length] = CifSaveFrame(saveCtx, saveHeader);
                }
                tokenizer.inSaveFrame = false;
            }
            else { // start of save frame
                if (tokenizer.inSaveFrame) {
                    return error(tokenizer.lineNumber, 'Save frames cannot be nested.');
                }
                tokenizer.inSaveFrame = true;
                saveHeader = data.substring(tokenizer.tokenStart + 5, tokenizer.tokenEnd);
                saveCtx = FrameContext();
                // saveFrame = CifSaveFrame(saveCtx, saveHeader);
            }
            moveNext(tokenizer);
            // Loop
        }
        else if (token === 2 /* CifTokenType.Loop */) {
            const cat = await handleLoop(tokenizer, tokenizer.inSaveFrame ? saveCtx : blockCtx);
            if (cat.hasError) {
                return error(cat.errorLine, cat.errorMessage);
            }
            // Single row
        }
        else if (token === 4 /* CifTokenType.ColumnName */) {
            const cat = handleSingle(tokenizer, tokenizer.inSaveFrame ? saveCtx : blockCtx);
            if (cat.hasError) {
                return error(cat.errorLine, cat.errorMessage);
            }
            // Out of options
        }
        else {
            console.log(tokenizer.tokenType, Tokenizer.getTokenString(tokenizer));
            return error(tokenizer.lineNumber, 'Unexpected token. Expected data_, loop_, or data name.');
        }
    }
    // Check if the latest save frame was closed.
    if (tokenizer.inSaveFrame) {
        return error(tokenizer.lineNumber, `Unfinished save frame (${saveFrame.header}).`);
    }
    if (blockCtx.categoryNames.length > 0 || saveFrames.length > 0) {
        dataBlocks.push(CifBlock(blockCtx, blockHeader, saveFrames));
    }
    return result(Data.CifFile(dataBlocks));
}
export function parseCifText(data) {
    return Task.create('Parse CIF', async (ctx) => {
        return await parseInternal(data, ctx);
    });
}
