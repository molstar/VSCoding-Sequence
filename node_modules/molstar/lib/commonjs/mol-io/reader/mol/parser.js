"use strict";
/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Panagiotis Tourlas <panagiot_tourlov@hotmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formalChargeMapper = formalChargeMapper;
exports.handleAtoms = handleAtoms;
exports.handleBonds = handleBonds;
exports.handleFormalCharges = handleFormalCharges;
exports.handlePropertiesBlock = handlePropertiesBlock;
exports.parseMol = parseMol;
const db_1 = require("../../../mol-data/db");
const mol_task_1 = require("../../../mol-task");
const token_1 = require("../common/text/column/token");
const tokenizer_1 = require("../common/text/tokenizer");
const result_1 = require("../result");
/*
    The atom lines in a .mol file have the following structure:

    xxxxx.xxxxyyyyy.yyyyzzzzz.zzzz aaaddcccssshhhbbbvvvHHHrrriiimmmnnneee
    ---------------------------------------------------------------------

    Below is a breakdown of each component and its start/end indices:

    xxxxx.xxxx  (X COORDINATE, 1-10)
    yyyyy.yyyy  (Y COORDINATE, 10-20)
    zzzzz.zzzz  (Z COORDINATE, 20-30)
    _           (30 IS EMPTY)
    aaa         (ATOM SYMBOL, 31-34)
    dd          (MASS DIFF, 34-36)
    ccc         (FORMAL CHARGE, 36-39)
    sss         (ATOM STEREO PARITY, 39-42)
    hhh         (HYDROGEN COUNT+1, 42-45)
    bbb         (STEREO CARE BOX, 45-48)
    vvv         (VALENCE, 48-51)
    HHH         (H0 DESIGNATOR, 51-54)
    rrr         (UNUSED, 54-57)
    iii         (UNUSED, 57-60)
    mmm         (ATOM-ATOM MAPPING NUMBER, 60-63)
    nnn         (INVERSION/RETENTION FLAG, 63-66)
    eee         (EXACT CHANGE FLAG, 66-69)
*/
/**
 * @param key - The value found at the atom block.
 * @returns The actual formal charge based on the mapping.
 */
function formalChargeMapper(key) {
    switch (key) {
        case 7: return -3;
        case 6: return -2;
        case 5: return -1;
        case 0: return 0;
        case 3: return 1;
        case 2: return 2;
        case 1: return 3;
        case 4: return 0;
        default:
            console.error(`Value ${key} is outside the 0-7 range, defaulting to 0.`);
            return 0;
    }
}
function handleAtoms(tokenizer, count) {
    const x = tokenizer_1.TokenBuilder.create(tokenizer.data, count * 2);
    const y = tokenizer_1.TokenBuilder.create(tokenizer.data, count * 2);
    const z = tokenizer_1.TokenBuilder.create(tokenizer.data, count * 2);
    const type_symbol = tokenizer_1.TokenBuilder.create(tokenizer.data, count * 2);
    const formal_charge = tokenizer_1.TokenBuilder.create(tokenizer.data, count * 2);
    for (let i = 0; i < count; ++i) {
        tokenizer_1.Tokenizer.markLine(tokenizer);
        const { tokenStart: s, position } = tokenizer;
        tokenizer_1.Tokenizer.trim(tokenizer, s, s + 10);
        tokenizer_1.TokenBuilder.addUnchecked(x, tokenizer.tokenStart, tokenizer.tokenEnd);
        tokenizer_1.Tokenizer.trim(tokenizer, s + 10, s + 20);
        tokenizer_1.TokenBuilder.addUnchecked(y, tokenizer.tokenStart, tokenizer.tokenEnd);
        tokenizer_1.Tokenizer.trim(tokenizer, s + 20, s + 30);
        tokenizer_1.TokenBuilder.addUnchecked(z, tokenizer.tokenStart, tokenizer.tokenEnd);
        tokenizer_1.Tokenizer.trim(tokenizer, s + 31, s + 34);
        tokenizer_1.TokenBuilder.addUnchecked(type_symbol, tokenizer.tokenStart, tokenizer.tokenEnd);
        tokenizer_1.Tokenizer.trim(tokenizer, s + 36, s + 39);
        tokenizer_1.TokenBuilder.addUnchecked(formal_charge, tokenizer.tokenStart, tokenizer.tokenEnd);
        tokenizer.position = position;
    }
    return {
        count,
        x: (0, token_1.TokenColumnProvider)(x)(db_1.Column.Schema.float),
        y: (0, token_1.TokenColumnProvider)(y)(db_1.Column.Schema.float),
        z: (0, token_1.TokenColumnProvider)(z)(db_1.Column.Schema.float),
        type_symbol: (0, token_1.TokenColumnProvider)(type_symbol)(db_1.Column.Schema.str),
        formal_charge: (0, token_1.TokenColumnProvider)(formal_charge)(db_1.Column.Schema.int)
    };
}
function handleBonds(tokenizer, count) {
    const atomIdxA = tokenizer_1.TokenBuilder.create(tokenizer.data, count * 2);
    const atomIdxB = tokenizer_1.TokenBuilder.create(tokenizer.data, count * 2);
    const order = tokenizer_1.TokenBuilder.create(tokenizer.data, count * 2);
    for (let i = 0; i < count; ++i) {
        tokenizer_1.Tokenizer.markLine(tokenizer);
        const { tokenStart: s, position } = tokenizer;
        tokenizer_1.Tokenizer.trim(tokenizer, s, s + 3);
        tokenizer_1.TokenBuilder.addUnchecked(atomIdxA, tokenizer.tokenStart, tokenizer.tokenEnd);
        tokenizer_1.Tokenizer.trim(tokenizer, s + 3, s + 6);
        tokenizer_1.TokenBuilder.addUnchecked(atomIdxB, tokenizer.tokenStart, tokenizer.tokenEnd);
        tokenizer_1.Tokenizer.trim(tokenizer, s + 6, s + 9);
        tokenizer_1.TokenBuilder.addUnchecked(order, tokenizer.tokenStart, tokenizer.tokenEnd);
        tokenizer.position = position;
    }
    return {
        count,
        atomIdxA: (0, token_1.TokenColumnProvider)(atomIdxA)(db_1.Column.Schema.int),
        atomIdxB: (0, token_1.TokenColumnProvider)(atomIdxB)(db_1.Column.Schema.int),
        order: (0, token_1.TokenColumnProvider)(order)(db_1.Column.Schema.int)
    };
}
function handleFormalCharges(tokenizer, lineStart, formalCharges) {
    tokenizer_1.Tokenizer.trim(tokenizer, lineStart + 6, lineStart + 9);
    const numOfCharges = parseInt(tokenizer_1.Tokenizer.getTokenString(tokenizer));
    for (let i = 0; i < numOfCharges; ++i) {
        /*
        M  CHG  3   1  -1   2   0   2  -1
                |   |   |   |   |
                |   |   |   |   |__charge2 (etc.)
                |   |   |   |
                |   |   |   |__atomIdx2
                |   |   |
                |   |   |__charge1
                |   |
                |   |__atomIdx1 (cursor at position 12)
                |
                |___numOfCharges
        */
        const offset = 9 + (i * 8);
        tokenizer_1.Tokenizer.trim(tokenizer, lineStart + offset, lineStart + offset + 4);
        const _atomIdx = tokenizer_1.Tokenizer.getTokenString(tokenizer);
        formalCharges.atomIdx.push(+_atomIdx);
        tokenizer_1.Tokenizer.trim(tokenizer, lineStart + offset + 4, lineStart + offset + 8);
        const _charge = tokenizer_1.Tokenizer.getTokenString(tokenizer);
        formalCharges.charge.push(+_charge);
    }
    /* Once the line is read, move to the next one. */
    tokenizer_1.Tokenizer.eatLine(tokenizer);
}
/** Call an appropriate handler based on the property type.
 * (For now it only calls the formal charge handler, additional handlers can
 * be added for other properties.)
 */
function handlePropertiesBlock(tokenizer) {
    const _atomIdx = [];
    const _charge = [];
    const _formalCharges = { atomIdx: _atomIdx, charge: _charge };
    while (tokenizer.position < tokenizer.length) {
        const { position: s } = tokenizer;
        tokenizer_1.Tokenizer.trim(tokenizer, s + 3, s + 6);
        const propertyType = tokenizer_1.Tokenizer.getTokenString(tokenizer);
        if (propertyType === 'END')
            break;
        tokenizer_1.Tokenizer.eatLine(tokenizer);
        switch (propertyType) {
            case 'CHG':
                handleFormalCharges(tokenizer, s, _formalCharges);
                break;
            default:
                break;
        }
    }
    const formalCharges = {
        atomIdx: db_1.Column.ofIntArray(_formalCharges.atomIdx),
        charge: db_1.Column.ofIntArray(_formalCharges.charge)
    };
    return formalCharges;
}
function parseInternal(data) {
    const tokenizer = (0, tokenizer_1.Tokenizer)(data);
    const title = tokenizer_1.Tokenizer.readLine(tokenizer).trim();
    const program = tokenizer_1.Tokenizer.readLine(tokenizer).trim();
    const comment = tokenizer_1.Tokenizer.readLine(tokenizer).trim();
    const counts = tokenizer_1.Tokenizer.readLine(tokenizer);
    const atomCount = +counts.substr(0, 3), bondCount = +counts.substr(3, 3);
    const atoms = handleAtoms(tokenizer, atomCount);
    const bonds = handleBonds(tokenizer, bondCount);
    const formalCharges = handlePropertiesBlock(tokenizer);
    const result = {
        title,
        program,
        comment,
        atoms,
        bonds,
        formalCharges,
    };
    return result_1.ReaderResult.success(result);
}
function parseMol(data) {
    return mol_task_1.Task.create('Parse Mol', async () => {
        return parseInternal(data);
    });
}
