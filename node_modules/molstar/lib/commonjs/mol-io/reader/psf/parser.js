"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePsf = parsePsf;
const mol_task_1 = require("../../../mol-task");
const tokenizer_1 = require("../common/text/tokenizer");
const result_1 = require("../result");
const token_1 = require("../common/text/column/token");
const db_1 = require("../../../mol-data/db");
const { readLine, skipWhitespace, eatValue, eatLine, markStart } = tokenizer_1.Tokenizer;
const reWhitespace = /\s+/;
const reTitle = /(^\*|REMARK)*/;
function State(tokenizer, runtimeCtx) {
    return {
        tokenizer,
        runtimeCtx,
    };
}
async function handleAtoms(state, count) {
    const { tokenizer } = state;
    const atomId = tokenizer_1.TokenBuilder.create(tokenizer.data, count * 2);
    const segmentName = tokenizer_1.TokenBuilder.create(tokenizer.data, count * 2);
    const residueId = tokenizer_1.TokenBuilder.create(tokenizer.data, count * 2);
    const residueName = tokenizer_1.TokenBuilder.create(tokenizer.data, count * 2);
    const atomName = tokenizer_1.TokenBuilder.create(tokenizer.data, count * 2);
    const atomType = tokenizer_1.TokenBuilder.create(tokenizer.data, count * 2);
    const charge = tokenizer_1.TokenBuilder.create(tokenizer.data, count * 2);
    const mass = tokenizer_1.TokenBuilder.create(tokenizer.data, count * 2);
    const { position } = tokenizer;
    const line = readLine(tokenizer).trim();
    tokenizer.position = position;
    // LAMMPS full
    // AtomID ResID AtomName AtomType Charge Mass Unused0
    const isLammpsFull = line.split(reWhitespace).length === 7;
    const n = isLammpsFull ? 6 : 8;
    const { length } = tokenizer;
    let linesAlreadyRead = 0;
    await (0, mol_task_1.chunkedSubtask)(state.runtimeCtx, 100000, void 0, chunkSize => {
        const linesToRead = Math.min(count - linesAlreadyRead, chunkSize);
        for (let i = 0; i < linesToRead; ++i) {
            for (let j = 0; j < n; ++j) {
                skipWhitespace(tokenizer);
                markStart(tokenizer);
                eatValue(tokenizer);
                if (isLammpsFull) {
                    switch (j) {
                        case 0:
                            tokenizer_1.TokenBuilder.addUnchecked(atomId, tokenizer.tokenStart, tokenizer.tokenEnd);
                            break;
                        case 1:
                            tokenizer_1.TokenBuilder.addUnchecked(residueId, tokenizer.tokenStart, tokenizer.tokenEnd);
                            break;
                        case 2:
                            tokenizer_1.TokenBuilder.addUnchecked(atomName, tokenizer.tokenStart, tokenizer.tokenEnd);
                            break;
                        case 3:
                            tokenizer_1.TokenBuilder.addUnchecked(atomType, tokenizer.tokenStart, tokenizer.tokenEnd);
                            break;
                        case 4:
                            tokenizer_1.TokenBuilder.addUnchecked(charge, tokenizer.tokenStart, tokenizer.tokenEnd);
                            break;
                        case 5:
                            tokenizer_1.TokenBuilder.addUnchecked(mass, tokenizer.tokenStart, tokenizer.tokenEnd);
                            break;
                    }
                }
                else {
                    switch (j) {
                        case 0:
                            tokenizer_1.TokenBuilder.addUnchecked(atomId, tokenizer.tokenStart, tokenizer.tokenEnd);
                            break;
                        case 1:
                            tokenizer_1.TokenBuilder.addUnchecked(segmentName, tokenizer.tokenStart, tokenizer.tokenEnd);
                            break;
                        case 2:
                            tokenizer_1.TokenBuilder.addUnchecked(residueId, tokenizer.tokenStart, tokenizer.tokenEnd);
                            break;
                        case 3:
                            tokenizer_1.TokenBuilder.addUnchecked(residueName, tokenizer.tokenStart, tokenizer.tokenEnd);
                            break;
                        case 4:
                            tokenizer_1.TokenBuilder.addUnchecked(atomName, tokenizer.tokenStart, tokenizer.tokenEnd);
                            break;
                        case 5:
                            tokenizer_1.TokenBuilder.addUnchecked(atomType, tokenizer.tokenStart, tokenizer.tokenEnd);
                            break;
                        case 6:
                            tokenizer_1.TokenBuilder.addUnchecked(charge, tokenizer.tokenStart, tokenizer.tokenEnd);
                            break;
                        case 7:
                            tokenizer_1.TokenBuilder.addUnchecked(mass, tokenizer.tokenStart, tokenizer.tokenEnd);
                            break;
                    }
                }
            }
            // ignore any extra columns
            eatLine(tokenizer);
            markStart(tokenizer);
        }
        linesAlreadyRead += linesToRead;
        return linesToRead;
    }, ctx => ctx.update({ message: 'Parsing...', current: tokenizer.position, max: length }));
    return {
        count,
        atomId: (0, token_1.TokenColumnProvider)(atomId)(db_1.Column.Schema.int),
        segmentName: isLammpsFull
            ? (0, token_1.TokenColumnProvider)(residueId)(db_1.Column.Schema.str)
            : (0, token_1.TokenColumnProvider)(segmentName)(db_1.Column.Schema.str),
        residueId: (0, token_1.TokenColumnProvider)(residueId)(db_1.Column.Schema.int),
        residueName: isLammpsFull
            ? (0, token_1.TokenColumnProvider)(residueId)(db_1.Column.Schema.str)
            : (0, token_1.TokenColumnProvider)(residueName)(db_1.Column.Schema.str),
        atomName: (0, token_1.TokenColumnProvider)(atomName)(db_1.Column.Schema.str),
        atomType: (0, token_1.TokenColumnProvider)(atomType)(db_1.Column.Schema.str),
        charge: (0, token_1.TokenColumnProvider)(charge)(db_1.Column.Schema.float),
        mass: (0, token_1.TokenColumnProvider)(mass)(db_1.Column.Schema.float)
    };
}
async function handleBonds(state, count) {
    const { tokenizer } = state;
    const atomIdA = tokenizer_1.TokenBuilder.create(tokenizer.data, count * 2);
    const atomIdB = tokenizer_1.TokenBuilder.create(tokenizer.data, count * 2);
    const { length } = tokenizer;
    let bondsAlreadyRead = 0;
    await (0, mol_task_1.chunkedSubtask)(state.runtimeCtx, 10, void 0, chunkSize => {
        const bondsToRead = Math.min(count - bondsAlreadyRead, chunkSize);
        for (let i = 0; i < bondsToRead; ++i) {
            for (let j = 0; j < 2; ++j) {
                skipWhitespace(tokenizer);
                markStart(tokenizer);
                eatValue(tokenizer);
                switch (j) {
                    case 0:
                        tokenizer_1.TokenBuilder.addUnchecked(atomIdA, tokenizer.tokenStart, tokenizer.tokenEnd);
                        break;
                    case 1:
                        tokenizer_1.TokenBuilder.addUnchecked(atomIdB, tokenizer.tokenStart, tokenizer.tokenEnd);
                        break;
                }
            }
        }
        bondsAlreadyRead += bondsToRead;
        return bondsToRead;
    }, ctx => ctx.update({ message: 'Parsing...', current: tokenizer.position, max: length }));
    return {
        count,
        atomIdA: (0, token_1.TokenColumnProvider)(atomIdA)(db_1.Column.Schema.int),
        atomIdB: (0, token_1.TokenColumnProvider)(atomIdB)(db_1.Column.Schema.int),
    };
}
function parseTitle(state, count) {
    const title = [];
    for (let i = 0; i < count; ++i) {
        const line = readLine(state.tokenizer);
        title.push(line.replace(reTitle, '').trim());
    }
    return title;
}
async function parseInternal(data, ctx) {
    const tokenizer = (0, tokenizer_1.Tokenizer)(data);
    const state = State(tokenizer, ctx);
    let title = undefined;
    let atoms = undefined;
    let bonds = undefined;
    const id = readLine(state.tokenizer).trim();
    while (tokenizer.tokenEnd < tokenizer.length) {
        const line = readLine(state.tokenizer).trim();
        if (line.includes('!NTITLE')) {
            const numTitle = parseInt(line.split(reWhitespace)[0]);
            title = parseTitle(state, numTitle);
        }
        else if (line.includes('!NATOM')) {
            const numAtoms = parseInt(line.split(reWhitespace)[0]);
            atoms = await handleAtoms(state, numAtoms);
        }
        else if (line.includes('!NBOND')) {
            const numBonds = parseInt(line.split(reWhitespace)[0]);
            bonds = await handleBonds(state, numBonds);
            break; // TODO: don't break when the below are implemented
        }
        else if (line.includes('!NTHETA')) {
            // TODO
        }
        else if (line.includes('!NPHI')) {
            // TODO
        }
        else if (line.includes('!NIMPHI')) {
            // TODO
        }
        else if (line.includes('!NDON')) {
            // TODO
        }
        else if (line.includes('!NACC')) {
            // TODO
        }
        else if (line.includes('!NNB')) {
            // TODO
        }
        else if (line.includes('!NGRP NST2')) {
            // TODO
        }
        else if (line.includes('!MOLNT')) {
            // TODO
        }
        else if (line.includes('!NUMLP NUMLPH')) {
            // TODO
        }
        else if (line.includes('!NCRTERM')) {
            // TODO
        }
    }
    if (title === undefined) {
        title = [];
    }
    if (atoms === undefined) {
        return result_1.ReaderResult.error('no atoms data');
    }
    if (bonds === undefined) {
        return result_1.ReaderResult.error('no bonds data');
    }
    const result = {
        id,
        title,
        atoms,
        bonds
    };
    return result_1.ReaderResult.success(result);
}
function parsePsf(data) {
    return mol_task_1.Task.create('Parse PSF', async (ctx) => {
        return await parseInternal(data, ctx);
    });
}
