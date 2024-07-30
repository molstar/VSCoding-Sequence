"use strict";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sukolsak Sakshuwong <sukolsak@stanford.edu>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.asciiWrite = asciiWrite;
function asciiWrite(data, str) {
    for (let i = 0, il = str.length; i < il; ++i) {
        data[i] = str.charCodeAt(i);
    }
}
