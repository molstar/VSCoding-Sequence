"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.openCif = openCif;
exports.downloadCif = downloadCif;
const tslib_1 = require("tslib");
const util = tslib_1.__importStar(require("util"));
const fs = tslib_1.__importStar(require("fs"));
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
require('util.promisify').shim();
const cif_1 = require("../../mol-io/reader/cif");
const mol_task_1 = require("../../mol-task");
const readFileAsync = util.promisify(fs.readFile);
async function readFile(path) {
    if (path.match(/\.bcif$/)) {
        const input = await readFileAsync(path);
        const data = new Uint8Array(input.byteLength);
        for (let i = 0; i < input.byteLength; i++)
            data[i] = input[i];
        return data;
    }
    else {
        return readFileAsync(path, 'utf8');
    }
}
async function parseCif(data) {
    const comp = cif_1.CIF.parse(data);
    const parsed = await comp.run(p => console.log(mol_task_1.Progress.format(p)), 250);
    if (parsed.isError)
        throw parsed;
    return parsed.result;
}
async function openCif(path) {
    const data = await readFile(path);
    return parseCif(data);
}
async function downloadCif(url, isBinary) {
    const data = await (0, node_fetch_1.default)(url);
    return parseCif(isBinary ? new Uint8Array(await data.arrayBuffer()) : await data.text());
}
