"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTriCount = getTriCount;
exports.getTriIndices = getTriIndices;
const tables_1 = require("../../../mol-geo/util/marching-cubes/tables");
const util_1 = require("../../../mol-gl/renderable/util");
let TriCount;
function getTriCount() {
    if (TriCount !== undefined)
        return TriCount;
    TriCount = (0, util_1.createTextureImage)(16 * 16, 1, Uint8Array);
    const { array } = TriCount;
    for (let i = 0, il = tables_1.TriTable.length; i < il; ++i) {
        array[i] = tables_1.TriTable[i].length / 3;
    }
    return TriCount;
}
let TriIndices;
function getTriIndices() {
    if (TriIndices !== undefined)
        return TriIndices;
    TriIndices = (0, util_1.createTextureImage)(64 * 64, 1, Uint8Array);
    const { array } = TriIndices;
    for (let i = 0, il = tables_1.TriTable.length; i < il; ++i) {
        for (let j = 0; j < 16; ++j) {
            if (j < tables_1.TriTable[i].length) {
                array[i * 16 + j] = tables_1.TriTable[i][j];
            }
            else {
                array[i * 16 + j] = 255;
            }
        }
    }
    return TriIndices;
}
