/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Taken/adapted from DensityServer (https://github.com/dsehnal/DensityServer)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as fs from 'fs';
import * as path from 'path';
import { SimpleBuffer } from '../../../mol-io/common/simple-buffer';
export async function openRead(filename) {
    return new Promise((res, rej) => {
        fs.open(filename, 'r', async (err, file) => {
            if (err) {
                rej(err);
                return;
            }
            try {
                res(file);
            }
            catch (e) {
                fs.closeSync(file);
            }
        });
    });
}
function makeDir(path, root) {
    const dirs = path.split(/\/|\\/g), dir = dirs.shift();
    root = (root || '') + dir + '/';
    try {
        fs.mkdirSync(root);
    }
    catch (e) {
        if (!fs.statSync(root).isDirectory())
            throw new Error(e);
    }
    return !dirs.length || makeDir(dirs.join('/'), root);
}
export function exists(filename) {
    return fs.existsSync(filename);
}
export function createFile(filename) {
    return new Promise((res, rej) => {
        if (fs.existsSync(filename))
            fs.unlinkSync(filename);
        makeDir(path.dirname(filename));
        fs.open(filename, 'w', (err, file) => {
            if (err)
                rej(err);
            else
                res(file);
        });
    });
}
const smallBuffer = SimpleBuffer.fromBuffer(Buffer.alloc(8));
export async function writeInt(file, value, position) {
    smallBuffer.writeInt32LE(value, 0);
    await file.writeBuffer(position, smallBuffer, 4);
}
