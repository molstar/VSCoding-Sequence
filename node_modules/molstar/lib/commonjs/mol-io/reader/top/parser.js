"use strict";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTop = parseTop;
const mol_task_1 = require("../../../mol-task");
const tokenizer_1 = require("../common/text/tokenizer");
const result_1 = require("../result");
const token_1 = require("../common/text/column/token");
const db_1 = require("../../../mol-data/db");
// https://manual.gromacs.org/2021-current/reference-manual/file-formats.html#top
const AtomsSchema = {
    nr: db_1.Column.Schema.Int(),
    type: db_1.Column.Schema.Str(),
    resnr: db_1.Column.Schema.Int(),
    residu: db_1.Column.Schema.Str(),
    atom: db_1.Column.Schema.Str(),
    cgnr: db_1.Column.Schema.Int(),
    charge: db_1.Column.Schema.Float(),
    mass: db_1.Column.Schema.Float(),
};
const BondsSchema = {
    ai: db_1.Column.Schema.Int(),
    aj: db_1.Column.Schema.Int(),
};
const MoleculesSchema = {
    compound: db_1.Column.Schema.Str(),
    molCount: db_1.Column.Schema.Int(),
};
const { readLine, markLine, skipWhitespace, markStart, eatValue, eatLine } = tokenizer_1.Tokenizer;
function State(tokenizer, runtimeCtx) {
    return {
        tokenizer,
        runtimeCtx,
    };
}
const reField = /\[ (.+) \]/;
const reWhitespace = /\s+/;
function handleMoleculetype(state) {
    const { tokenizer } = state;
    let molName = undefined;
    while (tokenizer.tokenEnd < tokenizer.length) {
        skipWhitespace(tokenizer);
        const c = tokenizer.data[tokenizer.position];
        if (c === '[')
            break;
        if (c === ';' || c === '*') {
            markLine(tokenizer);
            continue;
        }
        if (molName !== undefined)
            throw new Error('more than one molName');
        const line = readLine(tokenizer);
        molName = line.split(reWhitespace)[0];
    }
    if (molName === undefined)
        throw new Error('missing molName');
    return molName;
}
function handleAtoms(state) {
    const { tokenizer } = state;
    const nr = tokenizer_1.TokenBuilder.create(tokenizer.data, 64);
    const type = tokenizer_1.TokenBuilder.create(tokenizer.data, 64);
    const resnr = tokenizer_1.TokenBuilder.create(tokenizer.data, 64);
    const residu = tokenizer_1.TokenBuilder.create(tokenizer.data, 64);
    const atom = tokenizer_1.TokenBuilder.create(tokenizer.data, 64);
    const cgnr = tokenizer_1.TokenBuilder.create(tokenizer.data, 64);
    const charge = tokenizer_1.TokenBuilder.create(tokenizer.data, 64);
    const mass = tokenizer_1.TokenBuilder.create(tokenizer.data, 64);
    while (tokenizer.tokenEnd < tokenizer.length) {
        skipWhitespace(tokenizer);
        const c = tokenizer.data[tokenizer.position];
        if (c === '[')
            break;
        if (c === ';' || c === '*') {
            markLine(tokenizer);
            continue;
        }
        for (let j = 0; j < 8; ++j) {
            skipWhitespace(tokenizer);
            markStart(tokenizer);
            eatValue(tokenizer);
            switch (j) {
                case 0:
                    tokenizer_1.TokenBuilder.add(nr, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
                case 1:
                    tokenizer_1.TokenBuilder.add(type, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
                case 2:
                    tokenizer_1.TokenBuilder.add(resnr, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
                case 3:
                    tokenizer_1.TokenBuilder.add(residu, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
                case 4:
                    tokenizer_1.TokenBuilder.add(atom, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
                case 5:
                    tokenizer_1.TokenBuilder.add(cgnr, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
                case 6:
                    tokenizer_1.TokenBuilder.add(charge, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
                case 7:
                    tokenizer_1.TokenBuilder.add(mass, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
            }
        }
        // ignore any extra columns
        markLine(tokenizer);
    }
    return db_1.Table.ofColumns(AtomsSchema, {
        nr: (0, token_1.TokenColumnProvider)(nr)(db_1.Column.Schema.int),
        type: (0, token_1.TokenColumnProvider)(type)(db_1.Column.Schema.str),
        resnr: (0, token_1.TokenColumnProvider)(resnr)(db_1.Column.Schema.int),
        residu: (0, token_1.TokenColumnProvider)(residu)(db_1.Column.Schema.str),
        atom: (0, token_1.TokenColumnProvider)(atom)(db_1.Column.Schema.str),
        cgnr: (0, token_1.TokenColumnProvider)(cgnr)(db_1.Column.Schema.int),
        charge: (0, token_1.TokenColumnProvider)(charge)(db_1.Column.Schema.float),
        mass: (0, token_1.TokenColumnProvider)(mass)(db_1.Column.Schema.float),
    });
}
function handleBonds(state) {
    const { tokenizer } = state;
    const ai = tokenizer_1.TokenBuilder.create(tokenizer.data, 64);
    const aj = tokenizer_1.TokenBuilder.create(tokenizer.data, 64);
    while (tokenizer.tokenEnd < tokenizer.length) {
        skipWhitespace(tokenizer);
        const c = tokenizer.data[tokenizer.position];
        if (c === '[')
            break;
        if (c === ';' || c === '*') {
            markLine(tokenizer);
            continue;
        }
        for (let j = 0; j < 2; ++j) {
            skipWhitespace(tokenizer);
            markStart(tokenizer);
            eatValue(tokenizer);
            switch (j) {
                case 0:
                    tokenizer_1.TokenBuilder.add(ai, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
                case 1:
                    tokenizer_1.TokenBuilder.add(aj, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
            }
        }
        // ignore any extra columns
        markLine(tokenizer);
    }
    return db_1.Table.ofColumns(BondsSchema, {
        ai: (0, token_1.TokenColumnProvider)(ai)(db_1.Column.Schema.int),
        aj: (0, token_1.TokenColumnProvider)(aj)(db_1.Column.Schema.int),
    });
}
function handleSystem(state) {
    const { tokenizer } = state;
    let system = undefined;
    while (tokenizer.tokenEnd < tokenizer.length) {
        skipWhitespace(tokenizer);
        const c = tokenizer.data[tokenizer.position];
        if (c === '[')
            break;
        if (c === ';' || c === '*') {
            markLine(tokenizer);
            continue;
        }
        if (system !== undefined)
            throw new Error('more than one system');
        system = readLine(tokenizer).trim();
    }
    if (system === undefined)
        throw new Error('missing system');
    return system;
}
function handleMolecules(state) {
    const { tokenizer } = state;
    const compound = tokenizer_1.TokenBuilder.create(tokenizer.data, 64);
    const molCount = tokenizer_1.TokenBuilder.create(tokenizer.data, 64);
    while (tokenizer.tokenEnd < tokenizer.length) {
        skipWhitespace(tokenizer);
        if (tokenizer.position >= tokenizer.length)
            break;
        const c = tokenizer.data[tokenizer.position];
        if (c === '[')
            break;
        if (c === ';' || c === '*') {
            markLine(tokenizer);
            continue;
        }
        for (let j = 0; j < 2; ++j) {
            skipWhitespace(tokenizer);
            markStart(tokenizer);
            eatValue(tokenizer);
            switch (j) {
                case 0:
                    tokenizer_1.TokenBuilder.add(compound, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
                case 1:
                    tokenizer_1.TokenBuilder.add(molCount, tokenizer.tokenStart, tokenizer.tokenEnd);
                    break;
            }
        }
        // ignore any extra columns
        eatLine(tokenizer);
        markStart(tokenizer);
    }
    return db_1.Table.ofColumns(MoleculesSchema, {
        compound: (0, token_1.TokenColumnProvider)(compound)(db_1.Column.Schema.str),
        molCount: (0, token_1.TokenColumnProvider)(molCount)(db_1.Column.Schema.int),
    });
}
async function parseInternal(data, ctx) {
    const t = (0, tokenizer_1.Tokenizer)(data);
    const state = State(t, ctx);
    const result = Object.create(null);
    let prevPosition = 0;
    result.compounds = {};
    let currentCompound = {};
    let currentMolName = '';
    function addMol() {
        if (currentMolName && currentCompound.atoms) {
            result.compounds[currentMolName] = currentCompound;
            currentCompound = {};
            currentMolName = '';
        }
    }
    while (t.tokenEnd < t.length) {
        if (t.position - prevPosition > 100000 && ctx.shouldUpdate) {
            prevPosition = t.position;
            await ctx.update({ current: t.position, max: t.length });
        }
        const line = readLine(state.tokenizer).trim();
        if (!line || line[0] === '*' || line[0] === ';') {
            continue;
        }
        if (line.startsWith('#include')) {
            throw new Error('#include statements not allowed');
        }
        if (line.startsWith('[')) {
            const fieldMatch = line.match(reField);
            if (fieldMatch === null)
                throw new Error('expected field name');
            const fieldName = fieldMatch[1];
            if (fieldName === 'moleculetype') {
                addMol();
                currentMolName = handleMoleculetype(state);
            }
            else if (fieldName === 'atoms') {
                currentCompound.atoms = handleAtoms(state);
            }
            else if (fieldName === 'bonds') {
                currentCompound.bonds = handleBonds(state);
            }
            else if (fieldName === 'system') {
                result.system = handleSystem(state);
            }
            else if (fieldName === 'molecules') {
                addMol(); // add the last compound
                result.molecules = handleMolecules(state);
            }
            else {
                while (t.tokenEnd < t.length) {
                    if (t.data[t.position] === '[')
                        break;
                    markLine(t);
                }
            }
        }
    }
    return result_1.ReaderResult.success(result);
}
function parseTop(data) {
    return mol_task_1.Task.create('Parse TOP', async (ctx) => {
        return await parseInternal(data, ctx);
    });
}
