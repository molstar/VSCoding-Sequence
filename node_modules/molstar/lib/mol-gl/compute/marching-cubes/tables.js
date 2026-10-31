/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { TriTable, } from '../../../mol-geo/util/marching-cubes/tables';
import { createTextureImage } from '../../../mol-gl/renderable/util';
let TriCount;
export function getTriCount() {
    if (TriCount !== undefined)
        return TriCount;
    TriCount = createTextureImage(16 * 16, 1, Uint8Array);
    const { array } = TriCount;
    for (let i = 0, il = TriTable.length; i < il; ++i) {
        array[i] = TriTable[i].length / 3;
    }
    return TriCount;
}
let TriIndices;
export function getTriIndices() {
    if (TriIndices !== undefined)
        return TriIndices;
    TriIndices = createTextureImage(64 * 64, 1, Uint8Array);
    const { array } = TriIndices;
    for (let i = 0, il = TriTable.length; i < il; ++i) {
        for (let j = 0; j < 16; ++j) {
            if (j < TriTable[i].length) {
                array[i * 16 + j] = TriTable[i][j];
            }
            else {
                array[i * 16 + j] = 255;
            }
        }
    }
    return TriIndices;
}
