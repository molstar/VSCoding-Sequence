"use strict";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Koya Sakuma <koya.sakuma.work@gmail.com>
 *
 * Adapted from MolQL src/transpile.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = parse;
const all_1 = require("./transpilers/all");
const transpiler = all_1._transpiler;
function parse(lang, str) {
    try {
        const query = transpiler[lang](str);
        return query;
    }
    catch (e) {
        console.error(e.message);
        throw e;
    }
}
