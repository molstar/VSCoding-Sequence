"use strict";
/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 *
 * Adapted from MolQL project
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports._transpiler = void 0;
const parser_1 = require("./jmol/parser");
const parser_2 = require("./pymol/parser");
const parser_3 = require("./vmd/parser");
exports._transpiler = {
    pymol: parser_2.transpiler,
    vmd: parser_3.transpiler,
    jmol: parser_1.transpiler,
};
