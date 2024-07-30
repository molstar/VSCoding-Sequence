"use strict";
/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Jason Pattle <jpattle@exscientia.co.uk>
 * @author Panagiotis Tourlas <panagiot_tourlov@hotmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSdf = parseSdf;
const db_1 = require("../../../mol-data/db");
const parser_1 = require("../mol/parser");
const mol_task_1 = require("../../../mol-task");
const result_1 = require("../result");
const tokenizer_1 = require("../common/text/tokenizer");
const token_1 = require("../common/text/column/token");
const parser_v3_util_1 = require("./parser-v3-util");
const delimiter = '$$$$';
function handleDataItems(tokenizer) {
    const dataHeader = tokenizer_1.TokenBuilder.create(tokenizer.data, 32);
    const data = tokenizer_1.TokenBuilder.create(tokenizer.data, 32);
    while (tokenizer.position < tokenizer.length) {
        const line = tokenizer_1.Tokenizer.readLine(tokenizer);
        if (line.startsWith(delimiter))
            break;
        if (!line)
            continue;
        if (line.startsWith('> ')) {
            tokenizer_1.TokenBuilder.add(dataHeader, tokenizer.tokenStart + 2, tokenizer.tokenEnd);
            tokenizer_1.Tokenizer.markLine(tokenizer);
            const start = tokenizer.tokenStart;
            let end = tokenizer.tokenEnd;
            let added = false;
            while (tokenizer.position < tokenizer.length) {
                const line2 = tokenizer_1.Tokenizer.readLine(tokenizer);
                if (!line2 || line2.startsWith(delimiter) || line2.startsWith('> ')) {
                    tokenizer_1.TokenBuilder.add(data, start, end);
                    added = true;
                    break;
                }
                end = tokenizer.tokenEnd;
            }
            if (!added) {
                tokenizer_1.TokenBuilder.add(data, start, end);
            }
        }
    }
    return {
        dataHeader: (0, token_1.TokenColumnProvider)(dataHeader)(db_1.Column.Schema.str),
        data: (0, token_1.TokenColumnProvider)(data)(db_1.Column.Schema.str)
    };
}
function handleCountsV2(countsAndVersion) {
    return {
        atomCount: +countsAndVersion.substr(0, 3),
        bondCount: +countsAndVersion.substr(3, 3)
    };
}
function handleMolFile(tokenizer) {
    const title = tokenizer_1.Tokenizer.readLine(tokenizer).trim();
    const program = tokenizer_1.Tokenizer.readLine(tokenizer).trim();
    const comment = tokenizer_1.Tokenizer.readLine(tokenizer).trim();
    const countsAndVersion = tokenizer_1.Tokenizer.readLine(tokenizer);
    const molIsV3 = (0, parser_v3_util_1.isV3)(countsAndVersion);
    const { atomCount, bondCount } = molIsV3 ? (0, parser_v3_util_1.handleCountsV3)(tokenizer) : handleCountsV2(countsAndVersion);
    if (Number.isNaN(atomCount) || Number.isNaN(bondCount)) {
        // try to skip to next molecule
        while (tokenizer.position < tokenizer.length) {
            const line = tokenizer_1.Tokenizer.readLine(tokenizer);
            if (line.startsWith(delimiter))
                break;
        }
        return;
    }
    /* No support for formal charge parsing in V3000 molfiles at the moment,
    so all charges default to 0.*/
    const nullFormalCharges = {
        atomIdx: db_1.Column.ofConst(0, atomCount, db_1.Column.Schema.int),
        charge: db_1.Column.ofConst(0, atomCount, db_1.Column.Schema.int)
    };
    const atoms = molIsV3 ? (0, parser_v3_util_1.handleAtomsV3)(tokenizer, atomCount) : (0, parser_1.handleAtoms)(tokenizer, atomCount);
    const bonds = molIsV3 ? (0, parser_v3_util_1.handleBondsV3)(tokenizer, bondCount) : (0, parser_1.handleBonds)(tokenizer, bondCount);
    const formalCharges = molIsV3 ? nullFormalCharges : (0, parser_1.handlePropertiesBlock)(tokenizer);
    const dataItems = handleDataItems(tokenizer);
    return {
        molFile: { title, program, comment, atoms, bonds, formalCharges },
        dataItems
    };
}
function parseInternal(data) {
    const tokenizer = (0, tokenizer_1.Tokenizer)(data);
    const compounds = [];
    while (tokenizer.position < tokenizer.length) {
        const c = handleMolFile(tokenizer);
        if (c)
            compounds.push(c);
    }
    return result_1.ReaderResult.success({ compounds });
}
function parseSdf(data) {
    return mol_task_1.Task.create('Parse Sdf', async () => {
        return parseInternal(data);
    });
}
