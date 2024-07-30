/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Koya Sakuma <koya.sakuma.work@gmail.com>
 *
 * Adapted from MolQL src/transpile.ts
 */
import { _transpiler } from './transpilers/all';
const transpiler = _transpiler;
export function parse(lang, str) {
    try {
        const query = transpiler[lang](str);
        return query;
    }
    catch (e) {
        console.error(e.message);
        throw e;
    }
}
