"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCifBinary = parseCifBinary;
const tslib_1 = require("tslib");
const Data = tslib_1.__importStar(require("../data-model"));
const field_1 = require("./field");
const result_1 = require("../../result");
const decode_1 = require("../../../common/msgpack/decode");
const mol_task_1 = require("../../../../mol-task");
function checkVersions(min, current) {
    for (let i = 0; i < 2; i++) {
        if (min[i] > current[i])
            return false;
    }
    return true;
}
function Category(data) {
    const map = Object.create(null);
    const cache = Object.create(null);
    for (const col of data.columns)
        map[col.name] = col;
    return {
        rowCount: data.rowCount,
        name: data.name.substr(1),
        fieldNames: data.columns.map(c => c.name),
        getField(name) {
            const col = map[name];
            if (!col)
                return void 0;
            if (!!cache[name])
                return cache[name];
            cache[name] = (0, field_1.Field)(col);
            return cache[name];
        }
    };
}
function parseCifBinary(data) {
    return mol_task_1.Task.create('Parse BinaryCIF', async (ctx) => {
        const minVersion = [0, 3];
        try {
            const unpacked = (0, decode_1.decodeMsgPack)(data);
            if (!checkVersions(minVersion, unpacked.version.match(/(\d)\.(\d)\.\d/).slice(1).map(v => +v))) {
                return result_1.ReaderResult.error(`Unsupported format version. Current ${unpacked.version}, required ${minVersion.join('.')}.`);
            }
            const file = Data.CifFile(unpacked.dataBlocks.map(block => {
                const cats = Object.create(null);
                for (const cat of block.categories)
                    cats[cat.name.substr(1)] = Category(cat);
                return Data.CifBlock(block.categories.map(c => c.name.substr(1)), cats, block.header);
            }));
            return result_1.ReaderResult.success(file);
        }
        catch (e) {
            return result_1.ReaderResult.error('' + e);
        }
    });
}
