"use strict";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseXyz = parseXyz;
const db_1 = require("../../../mol-data/db");
const mol_task_1 = require("../../../mol-task");
const tokenizer_1 = require("../common/text/tokenizer");
const result_1 = require("../result");
function handleMolecule(tokenizer) {
    let count = tokenizer.position >= tokenizer.data.length - 1 ? 0 : +tokenizer_1.Tokenizer.readLine(tokenizer);
    if (isNaN(count))
        count = 0;
    const comment = tokenizer_1.Tokenizer.readLine(tokenizer);
    const x = new Float64Array(count);
    const y = new Float64Array(count);
    const z = new Float64Array(count);
    const type_symbol = new Array(count);
    for (let i = 0; i < count; ++i) {
        const line = tokenizer_1.Tokenizer.readLineTrim(tokenizer);
        const fields = line.split(/\s+/g);
        type_symbol[i] = fields[0];
        x[i] = +fields[1];
        y[i] = +fields[2];
        z[i] = +fields[3];
    }
    return {
        count,
        comment,
        x: db_1.Column.ofFloatArray(x),
        y: db_1.Column.ofFloatArray(y),
        z: db_1.Column.ofFloatArray(z),
        type_symbol: db_1.Column.ofStringArray(type_symbol)
    };
}
function parseInternal(data) {
    const tokenizer = (0, tokenizer_1.Tokenizer)(data);
    const molecules = [];
    while (true) {
        const mol = handleMolecule(tokenizer);
        if (mol.count === 0)
            break;
        molecules.push(mol);
    }
    const result = { molecules };
    return result_1.ReaderResult.success(result);
}
function parseXyz(data) {
    return mol_task_1.Task.create('Parse Mol', async () => {
        return parseInternal(data);
    });
}
