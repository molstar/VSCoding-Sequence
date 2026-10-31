"use strict";
/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Zepei Xu <xuzepei19950617@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Eric E <etongfu@@outlook.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMol2 = parseMol2;
//               NOTES
// When want to created undefined string column, must use
// undefStr = UndefinedColumn(molecule.num_atoms, ColumnType.str)
// but not
// const undefPooledStr = UndefinedColumn(molecule.num_atoms, ColumnType.pooledStr);
// because latter actuall return a column of zeros
const db_1 = require("../../../mol-data/db");
const tokenizer_1 = require("../common/text/tokenizer");
const token_1 = require("../common/text/column/token");
const result_1 = require("../result");
const mol_task_1 = require("../../../mol-task");
const { skipWhitespace, eatValue, markLine, getTokenString, skipStrictWhitespace } = tokenizer_1.Tokenizer;
function createEmptyMolecule() {
    return {
        mol_name: '',
        num_atoms: 0,
        num_bonds: 0,
        num_subst: 0,
        num_feat: 0,
        num_sets: 0,
        mol_type: '',
        charge_type: '',
        status_bits: '',
        mol_comment: ''
    };
}
function State(tokenizer, runtimeCtx) {
    return {
        tokenizer,
        molecule: createEmptyMolecule(),
        runtimeCtx
    };
}
const reWhitespace = /\s+/g;
function handleMolecule(state) {
    const { tokenizer, molecule } = state;
    while (getTokenString(tokenizer) !== '@<TRIPOS>MOLECULE' && tokenizer.position < tokenizer.data.length) {
        markLine(tokenizer);
    }
    markLine(tokenizer);
    molecule.mol_name = getTokenString(tokenizer);
    markLine(tokenizer);
    const values = getTokenString(tokenizer).trim().split(reWhitespace);
    molecule.num_atoms = parseInt(values[0]);
    molecule.num_bonds = parseInt(values[1]);
    molecule.num_subst = parseInt(values[2]);
    molecule.num_feat = parseInt(values[3]);
    molecule.num_sets = parseInt(values[4]);
    markLine(tokenizer);
    const mol_type = getTokenString(tokenizer);
    if (mol_type.startsWith('@<TRIPOS>'))
        return;
    molecule.mol_type = mol_type;
    markLine(tokenizer);
    const charge_type = getTokenString(tokenizer);
    if (charge_type.startsWith('@<TRIPOS>'))
        return;
    molecule.charge_type = charge_type;
    markLine(tokenizer);
    const status_bits = getTokenString(tokenizer);
    if (status_bits.startsWith('@<TRIPOS>'))
        return;
    molecule.status_bits = status_bits;
    markLine(tokenizer);
    const mol_comment = getTokenString(tokenizer);
    if (mol_comment.startsWith('@<TRIPOS>'))
        return;
    molecule.mol_comment = mol_comment;
}
/**
 * Just read the columns and get the max count of columns for the **atoms** and **bonds**
 * @param linesToRead The total lines
 * @param tokenIndexColums
 * @param tokenizer
 * @description
 * !!!This function has side effects!!!
 * 1. Called inside of the `chunkedSubtask`
 * 2. It will change the parameters of the `tokenIndexColums` , `tokenizer` and `linesToRead`
 * @returns The max count of columns
 */
function _readColumnsAndGetMaxCount(linesToRead, tokenIndexColums, tokenizer) {
    let maxColumnCount = 0;
    for (let i = 0; i < linesToRead; i++) {
        let tokenIndex = 0;
        skipWhitespace(tokenizer);
        while (true) {
            skipStrictWhitespace(tokenizer);
            tokenizer.tokenStart = tokenizer.position;
            eatValue(tokenizer);
            if (tokenizer.tokenStart === tokenizer.tokenEnd)
                break;
            const col = tokenIndexColums[tokenIndex++];
            if (!col)
                continue;
            tokenizer_1.TokenBuilder.addUnchecked(col, tokenizer.tokenStart, tokenizer.tokenEnd);
        }
        if (tokenIndex > maxColumnCount)
            maxColumnCount = tokenIndex;
        for (let cI = tokenIndex; cI < tokenIndexColums.length; cI++) {
            tokenizer_1.TokenBuilder.addUnchecked(tokenIndexColums[cI], 0, 0);
        }
    }
    return maxColumnCount + 1;
}
async function handleAtoms(state) {
    const { tokenizer, molecule } = state;
    // skip empty lines and '@<TRIPOS>ATOM'
    while (getTokenString(tokenizer) !== '@<TRIPOS>ATOM' && tokenizer.position < tokenizer.data.length) {
        markLine(tokenizer);
    }
    const initialTokenizerPosition = tokenizer.position;
    const initialTokenizerLineNumber = tokenizer.lineNumber;
    // columns
    const atom_idTokens = tokenizer_1.TokenBuilder.create(tokenizer.data, molecule.num_atoms * 2);
    const atom_nameTokens = tokenizer_1.TokenBuilder.create(tokenizer.data, molecule.num_atoms * 2);
    const xTokens = tokenizer_1.TokenBuilder.create(tokenizer.data, molecule.num_atoms * 2);
    const yTokens = tokenizer_1.TokenBuilder.create(tokenizer.data, molecule.num_atoms * 2);
    const zTokens = tokenizer_1.TokenBuilder.create(tokenizer.data, molecule.num_atoms * 2);
    const atom_typeTokens = tokenizer_1.TokenBuilder.create(tokenizer.data, molecule.num_atoms * 2);
    const subst_idTokens = tokenizer_1.TokenBuilder.create(tokenizer.data, molecule.num_atoms * 2);
    const subst_nameTokens = tokenizer_1.TokenBuilder.create(tokenizer.data, molecule.num_atoms * 2);
    const chargeTokens = tokenizer_1.TokenBuilder.create(tokenizer.data, molecule.num_atoms * 2);
    const status_bitTokens = tokenizer_1.TokenBuilder.create(tokenizer.data, molecule.num_atoms * 2);
    const undefFloat = db_1.Column.Undefined(molecule.num_atoms, db_1.Column.Schema.float);
    const undefInt = db_1.Column.Undefined(molecule.num_atoms, db_1.Column.Schema.int);
    const undefStr = db_1.Column.Undefined(molecule.num_atoms, db_1.Column.Schema.str);
    tokenizer.position = initialTokenizerPosition;
    tokenizer.lineNumber = initialTokenizerLineNumber;
    let maxColumnCount = 0;
    const tokenIndexToColumn = [
        atom_idTokens,
        atom_nameTokens,
        xTokens,
        yTokens,
        zTokens,
        atom_typeTokens,
        subst_idTokens,
        subst_nameTokens,
        chargeTokens,
        status_bitTokens
    ];
    const { length } = tokenizer;
    let linesAlreadyRead = 0;
    await (0, mol_task_1.chunkedSubtask)(state.runtimeCtx, 100000, void 0, chunkSize => {
        const linesToRead = Math.min(molecule.num_atoms - linesAlreadyRead, chunkSize);
        maxColumnCount = _readColumnsAndGetMaxCount(linesToRead, tokenIndexToColumn, tokenizer);
        linesAlreadyRead += linesToRead;
        return linesToRead;
    }, ctx => ctx.update({ message: 'Parsing...', current: tokenizer.position, max: length }));
    const ret = {
        count: molecule.num_atoms,
        atom_id: (0, token_1.TokenColumnProvider)(atom_idTokens)(db_1.Column.Schema.int),
        atom_name: (0, token_1.TokenColumnProvider)(atom_nameTokens)(db_1.Column.Schema.str),
        x: (0, token_1.TokenColumnProvider)(xTokens)(db_1.Column.Schema.float),
        y: (0, token_1.TokenColumnProvider)(yTokens)(db_1.Column.Schema.float),
        z: (0, token_1.TokenColumnProvider)(zTokens)(db_1.Column.Schema.float),
        atom_type: maxColumnCount > 5 ? (0, token_1.TokenColumnProvider)(atom_typeTokens)(db_1.Column.Schema.str) : undefStr,
        subst_id: maxColumnCount > 6 ? (0, token_1.TokenColumnProvider)(subst_idTokens)(db_1.Column.Schema.int) : undefInt,
        subst_name: maxColumnCount > 7 ? (0, token_1.TokenColumnProvider)(subst_nameTokens)(db_1.Column.Schema.str) : undefStr,
        charge: maxColumnCount > 8 ? (0, token_1.TokenColumnProvider)(chargeTokens)(db_1.Column.Schema.float) : undefFloat,
        status_bit: maxColumnCount > 9 ? (0, token_1.TokenColumnProvider)(status_bitTokens)(db_1.Column.Schema.str) : undefStr,
    };
    return ret;
}
async function handleBonds(state) {
    const { tokenizer, molecule } = state;
    while (getTokenString(tokenizer) !== '@<TRIPOS>BOND' && tokenizer.position < tokenizer.data.length) {
        markLine(tokenizer);
    }
    const initialTokenizerPosition = tokenizer.position;
    const initialTokenizerLineNumber = tokenizer.lineNumber;
    // columns
    const bond_idTokens = tokenizer_1.TokenBuilder.create(tokenizer.data, molecule.num_bonds * 2);
    const origin_bond_idTokens = tokenizer_1.TokenBuilder.create(tokenizer.data, molecule.num_bonds * 2);
    const target_bond_idTokens = tokenizer_1.TokenBuilder.create(tokenizer.data, molecule.num_bonds * 2);
    const bondTypeTokens = tokenizer_1.TokenBuilder.create(tokenizer.data, molecule.num_bonds * 2);
    const status_bitTokens = tokenizer_1.TokenBuilder.create(tokenizer.data, molecule.num_bonds * 2);
    tokenizer.position = initialTokenizerPosition;
    tokenizer.lineNumber = initialTokenizerLineNumber;
    let maxColumnCount = 0;
    const tokenIndexToColumn = [
        bond_idTokens,
        origin_bond_idTokens,
        target_bond_idTokens,
        bondTypeTokens,
        status_bitTokens
    ];
    const { length } = tokenizer;
    let linesAlreadyRead = 0;
    await (0, mol_task_1.chunkedSubtask)(state.runtimeCtx, 100000, void 0, chunkSize => {
        const linesToRead = Math.min(molecule.num_bonds - linesAlreadyRead, chunkSize);
        maxColumnCount = _readColumnsAndGetMaxCount(linesToRead, tokenIndexToColumn, tokenizer);
        linesAlreadyRead += linesToRead;
        return linesToRead;
    }, ctx => ctx.update({ message: 'Parsing...', current: tokenizer.position, max: length }));
    const ret = {
        count: molecule.num_bonds,
        bond_id: (0, token_1.TokenColumnProvider)(bond_idTokens)(db_1.Column.Schema.int),
        origin_atom_id: (0, token_1.TokenColumnProvider)(origin_bond_idTokens)(db_1.Column.Schema.int),
        target_atom_id: (0, token_1.TokenColumnProvider)(target_bond_idTokens)(db_1.Column.Schema.int),
        bond_type: (0, token_1.TokenColumnProvider)(bondTypeTokens)(db_1.Column.Schema.str),
        status_bits: maxColumnCount > 4
            ? (0, token_1.TokenColumnProvider)(status_bitTokens)(db_1.Column.Schema.str)
            : db_1.Column.Undefined(molecule.num_bonds, db_1.Column.Schema.str),
    };
    return ret;
}
function handleCrysin(state) {
    const { tokenizer } = state;
    while (tokenizer.position < tokenizer.data.length) {
        const l = getTokenString(tokenizer);
        if (l === '@<TRIPOS>MOLECULE') {
            return;
        }
        else if (l === '@<TRIPOS>CRYSIN') {
            break;
        }
        else {
            markLine(tokenizer);
        }
    }
    if (tokenizer.position >= tokenizer.data.length)
        return;
    markLine(tokenizer);
    const values = getTokenString(tokenizer).trim().split(reWhitespace);
    return {
        a: parseFloat(values[0]),
        b: parseFloat(values[1]),
        c: parseFloat(values[2]),
        alpha: parseFloat(values[3]),
        beta: parseFloat(values[4]),
        gamma: parseFloat(values[5]),
        spaceGroup: parseInt(values[6], 10),
        setting: parseInt(values[7], 10),
    };
}
async function parseInternal(ctx, data, name) {
    const tokenizer = (0, tokenizer_1.Tokenizer)(data);
    ctx.update({ message: 'Parsing...', current: 0, max: data.length });
    const structures = [];
    while (tokenizer.position < data.length) {
        const state = State(tokenizer, ctx);
        handleMolecule(state);
        const atoms = await handleAtoms(state);
        const bonds = await handleBonds(state);
        const crysin = handleCrysin(state);
        structures.push({ molecule: state.molecule, atoms, bonds, crysin });
        skipWhitespace(tokenizer);
        while (getTokenString(tokenizer) !== '@<TRIPOS>MOLECULE' && tokenizer.position < tokenizer.data.length) {
            markLine(tokenizer);
        }
    }
    const result = { name, structures };
    return result_1.ReaderResult.success(result);
}
function parseMol2(data, name) {
    return mol_task_1.Task.create('Parse MOL2', async (ctx) => {
        return await parseInternal(ctx, data, name);
    });
}
