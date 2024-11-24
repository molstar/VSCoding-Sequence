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
exports.parseDx = parseDx;
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const mol_task_1 = require("../../../mol-task");
const number_parser_1 = require("../common/text/number-parser");
const tokenizer_1 = require("../common/text/tokenizer");
const result_1 = require("../result");
const utf8_1 = require("../../common/utf8");
function readHeader(tokenizer) {
    const header = { h: (0, linear_algebra_1.Vec3)() };
    let headerByteCount = 0;
    let deltaLineCount = 0;
    const reWhitespace = /\s+/g;
    while (true) {
        const line = tokenizer_1.Tokenizer.readLine(tokenizer);
        let ls;
        if (line.startsWith('object 1')) {
            ls = line.split(reWhitespace);
            header.dim = linear_algebra_1.Vec3.create(parseInt(ls[5]), parseInt(ls[6]), parseInt(ls[7]));
        }
        else if (line.startsWith('origin')) {
            ls = line.split(reWhitespace);
            header.min = linear_algebra_1.Vec3.create(parseFloat(ls[1]), parseFloat(ls[2]), parseFloat(ls[3]));
        }
        else if (line.startsWith('delta')) {
            ls = line.split(reWhitespace);
            if (deltaLineCount === 0) {
                header.h[0] = parseFloat(ls[1]);
            }
            else if (deltaLineCount === 1) {
                header.h[1] = parseFloat(ls[2]);
            }
            else if (deltaLineCount === 2) {
                header.h[2] = parseFloat(ls[3]);
            }
            deltaLineCount += 1;
        }
        else if (line.startsWith('object 3')) {
            headerByteCount += line.length + 1;
            break;
        }
        headerByteCount += line.length + 1;
    }
    return { header: header, headerByteCount };
}
function readValuesText(ctx, tokenizer, header) {
    const N = header.dim[0] * header.dim[1] * header.dim[2];
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
async function parseText(taskCtx, data, name) {
    await taskCtx.update('Reading header...');
    const tokenizer = (0, tokenizer_1.Tokenizer)(data);
    const { header } = readHeader(tokenizer);
    await taskCtx.update('Reading values...');
    const values = await readValuesText(taskCtx, tokenizer, header);
    return result_1.ReaderResult.success({ header, values, name });
}
async function parseBinary(taskCtx, data, name) {
    await taskCtx.update('Reading header...');
    const headerString = (0, utf8_1.utf8Read)(data, 0, 1000);
    const tokenizer = (0, tokenizer_1.Tokenizer)(headerString);
    const { header, headerByteCount } = readHeader(tokenizer);
    await taskCtx.update('Reading values...');
    const size = header.dim[0] * header.dim[1] * header.dim[2];
    const dv = new DataView(data.buffer, data.byteOffset + headerByteCount);
    const values = new Float64Array(size);
    for (let i = 0; i < size; i++) {
        values[i] = dv.getFloat64(i * 8, true);
    }
    // TODO: why doesnt this work? throw "attempting to construct out-of-bounds TypedArray"
    // const values = new Float64Array(data.buffer, data.byteOffset + headerByteCount, header.dim[0] * header.dim[1] * header.dim[2]);
    return result_1.ReaderResult.success({ header, values, name });
}
function parseDx(data, name) {
    return mol_task_1.Task.create('Parse DX', taskCtx => {
        if (typeof data === 'string')
            return parseText(taskCtx, data, name);
        return parseBinary(taskCtx, data, name);
    });
}
