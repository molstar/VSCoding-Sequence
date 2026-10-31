"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePDB = parsePDB;
const mol_task_1 = require("../../../mol-task");
const result_1 = require("../result");
const tokenizer_1 = require("../common/text/tokenizer");
function parsePDB(data, id, isPdbqt = false) {
    return mol_task_1.Task.create('Parse PDB', async (ctx) => result_1.ReaderResult.success({
        lines: await tokenizer_1.Tokenizer.readAllLinesAsync(data, ctx),
        id,
        isPdbqt
    }));
}
