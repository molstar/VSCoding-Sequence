"use strict";
/**
 * Copyright (c) 2021-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Jason Pattle <jpattle@exscientia.co.uk>
 * @author Panagiotis Tourlas <panagiot_tourlov@hotmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isV3 = isV3;
exports.handleCountsV3 = handleCountsV3;
exports.handleAtomsV3 = handleAtomsV3;
exports.handleBondsV3 = handleBondsV3;
const db_1 = require("../../../mol-data/db");
const tokenizer_1 = require("../common/text/tokenizer");
const token_1 = require("../common/text/column/token");
function isV3(versionLine) {
    return versionLine.trim().endsWith('V3000');
}
function handleCountsV3(tokenizer) {
    const atomCount = tokenizer_1.TokenBuilder.create(tokenizer.data, 1);
    const bondCount = tokenizer_1.TokenBuilder.create(tokenizer.data, 1);
    tokenizer_1.Tokenizer.eatLine(tokenizer); // BEGIN CTAB
    skipSingleValue(tokenizer); // M
    skipSingleValue(tokenizer); // V30
    skipSingleValue(tokenizer); // COUNTS
    addSingleValue(tokenizer, atomCount);
    addSingleValue(tokenizer, bondCount);
    tokenizer_1.Tokenizer.eatLine(tokenizer);
    return {
        atomCount: (0, token_1.TokenColumnProvider)(atomCount)(db_1.Column.Schema.int).value(0),
        bondCount: (0, token_1.TokenColumnProvider)(bondCount)(db_1.Column.Schema.int).value(0)
    };
}
function handleAtomsV3(tokenizer, atomCount) {
    const x = tokenizer_1.TokenBuilder.create(tokenizer.data, atomCount * 2);
    const y = tokenizer_1.TokenBuilder.create(tokenizer.data, atomCount * 2);
    const z = tokenizer_1.TokenBuilder.create(tokenizer.data, atomCount * 2);
    const type_symbol = tokenizer_1.TokenBuilder.create(tokenizer.data, atomCount * 2);
    for (let i = 0; i < atomCount; ++i) {
        tokenizer_1.Tokenizer.markLine(tokenizer);
        skipSingleValue(tokenizer); // M
        skipSingleValue(tokenizer); // V30
        skipSingleValue(tokenizer); // Index
        const { position } = tokenizer;
        addSingleValue(tokenizer, type_symbol);
        addSingleValue(tokenizer, x);
        addSingleValue(tokenizer, y);
        addSingleValue(tokenizer, z);
        tokenizer.position = position;
    }
    tokenizer_1.Tokenizer.eatLine(tokenizer); // Previous Line
    tokenizer_1.Tokenizer.eatLine(tokenizer); // END ATOM
    return {
        count: atomCount,
        x: (0, token_1.TokenColumnProvider)(x)(db_1.Column.Schema.float),
        y: (0, token_1.TokenColumnProvider)(y)(db_1.Column.Schema.float),
        z: (0, token_1.TokenColumnProvider)(z)(db_1.Column.Schema.float),
        type_symbol: (0, token_1.TokenColumnProvider)(type_symbol)(db_1.Column.Schema.str),
        /* No support for formal charge parsing in V3000 molfiles at the moment,
        so all charges default to 0.*/
        formal_charge: db_1.Column.ofConst(0, atomCount, db_1.Column.Schema.int)
    };
}
function handleBondsV3(tokenizer, bondCount) {
    const atomIdxA = tokenizer_1.TokenBuilder.create(tokenizer.data, bondCount * 2);
    const atomIdxB = tokenizer_1.TokenBuilder.create(tokenizer.data, bondCount * 2);
    const order = tokenizer_1.TokenBuilder.create(tokenizer.data, bondCount * 2);
    for (let i = 0; i < bondCount; ++i) {
        tokenizer_1.Tokenizer.markLine(tokenizer);
        skipSingleValue(tokenizer); // M
        skipSingleValue(tokenizer); // V30
        skipSingleValue(tokenizer); // Index
        const { position } = tokenizer;
        addSingleValue(tokenizer, order);
        addSingleValue(tokenizer, atomIdxA);
        addSingleValue(tokenizer, atomIdxB);
        tokenizer.position = position;
    }
    tokenizer_1.Tokenizer.eatLine(tokenizer); // Previous Line
    tokenizer_1.Tokenizer.eatLine(tokenizer); // END BOND
    return {
        count: bondCount,
        atomIdxA: (0, token_1.TokenColumnProvider)(atomIdxA)(db_1.Column.Schema.float),
        atomIdxB: (0, token_1.TokenColumnProvider)(atomIdxB)(db_1.Column.Schema.float),
        order: (0, token_1.TokenColumnProvider)(order)(db_1.Column.Schema.float),
    };
}
function skipSingleValue(tokenizer) {
    tokenizer_1.Tokenizer.skipWhitespace(tokenizer);
    tokenizer_1.Tokenizer.eatValue(tokenizer);
}
function addSingleValue(tokenizer, tokens) {
    const { position: valueStart } = tokenizer;
    tokenizer_1.Tokenizer.skipWhitespace(tokenizer);
    tokenizer_1.Tokenizer.eatValue(tokenizer);
    tokenizer_1.Tokenizer.trim(tokenizer, valueStart, tokenizer.position);
    tokenizer_1.TokenBuilder.addUnchecked(tokens, tokenizer.tokenStart, tokenizer.tokenEnd);
}
