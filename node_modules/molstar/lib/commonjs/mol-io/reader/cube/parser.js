"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted from NGL.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCube = parseCube;
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const tokenizer_1 = require("../common/text/tokenizer");
const db_1 = require("../../../mol-data/db");
const mol_task_1 = require("../../../mol-task");
const result_1 = require("../result");
const number_parser_1 = require("../common/text/number-parser");
const bohrToAngstromFactor = 0.529177210859;
function readHeader(tokenizer) {
    const headerLines = tokenizer_1.Tokenizer.readLines(tokenizer, 6);
    const h = (k, l) => {
        const field = +headerLines[k].trim().split(/\s+/g)[l];
        return Number.isNaN(field) ? 0 : field;
    };
    const basis = (i) => {
        const n = h(i + 2, 0);
        const s = bohrToAngstromFactor;
        return [Math.abs(n), linear_algebra_1.Vec3.create(h(i + 2, 1) * s, h(i + 2, 2) * s, h(i + 2, 3) * s), n];
    };
    const comment1 = headerLines[0].trim();
    const comment2 = headerLines[1].trim();
    const [atomCount, origin, rawAtomCount] = basis(0);
    const [NVX, basisX] = basis(1);
    const [NVY, basisY] = basis(2);
    const [NVZ, basisZ] = basis(3);
    const atoms = readAtoms(tokenizer, atomCount, bohrToAngstromFactor);
    const dataSetIds = [];
    if (rawAtomCount >= 0) {
        let nVal = h(2, 4);
        if (nVal === 0)
            nVal = 1;
        for (let i = 0; i < nVal; i++)
            dataSetIds.push(i);
    }
    else {
        const counts = tokenizer_1.Tokenizer.readLine(tokenizer).trim().split(/\s+/g);
        for (let i = 0, _i = +counts[0]; i < _i; i++)
            dataSetIds.push(+counts[i + 1]);
    }
    const header = { orbitals: rawAtomCount < 0, comment1, comment2, atomCount, origin, dim: linear_algebra_1.Vec3.create(NVX, NVY, NVZ), basisX, basisY, basisZ, dataSetIds };
    return { header, atoms };
}
function readAtoms(tokenizer, count, scaleFactor) {
    const number = new Int32Array(count);
    const value = new Float64Array(count);
    const x = new Float32Array(count);
    const y = new Float32Array(count);
    const z = new Float32Array(count);
    for (let i = 0; i < count; i++) {
        const fields = tokenizer_1.Tokenizer.readLine(tokenizer).trim().split(/\s+/g);
        number[i] = +fields[0];
        value[i] = +fields[1];
        x[i] = +fields[2] * scaleFactor;
        y[i] = +fields[3] * scaleFactor;
        z[i] = +fields[4] * scaleFactor;
    }
    return {
        count,
        number: db_1.Column.ofArray({ array: number, schema: db_1.Column.Schema.int }),
        nuclearCharge: db_1.Column.ofArray({ array: value, schema: db_1.Column.Schema.float }),
        x: db_1.Column.ofArray({ array: x, schema: db_1.Column.Schema.float }),
        y: db_1.Column.ofArray({ array: y, schema: db_1.Column.Schema.float }),
        z: db_1.Column.ofArray({ array: z, schema: db_1.Column.Schema.float })
    };
}
function readValues(ctx, tokenizer, header) {
    const N = header.dim[0] * header.dim[1] * header.dim[2] * header.dataSetIds.length;
    const chunkSize = 100 * 100 * 100;
    const data = new Float64Array(N);
    let offset = 0;
    return (0, mol_task_1.chunkedSubtask)(ctx, chunkSize, data, (count, data) => {
        const max = Math.min(N, offset + count);
        for (let i = offset; i < max; i++) {
            tokenizer_1.Tokenizer.skipWhitespace(tokenizer);
            tokenizer.tokenStart = tokenizer.position;
            tokenizer_1.Tokenizer.eatValue(tokenizer);
            data[i] = (0, number_parser_1.parseFloat)(tokenizer.data, tokenizer.tokenStart, tokenizer.tokenEnd);
        }
        offset = max;
        return max === N ? 0 : chunkSize;
    }, (ctx, _, i) => ctx.update({ current: Math.min(i, N), max: N }));
}
function parseCube(data, name) {
    return mol_task_1.Task.create('Parse Cube', async (taskCtx) => {
        await taskCtx.update('Reading header...');
        const tokenizer = (0, tokenizer_1.Tokenizer)(data);
        const { header, atoms } = readHeader(tokenizer);
        const values = await readValues(taskCtx, tokenizer, header);
        return result_1.ReaderResult.success({ header, atoms, values, name });
    });
}
