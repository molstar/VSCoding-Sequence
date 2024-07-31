#!/usr/bin/env node
"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 *
 * Command-line application for validating MolViewSpec files
 * Build: npm run build
 * Run:   node lib/commonjs/cli/mvs/mvs-validate examples/mvs/1cbs.mvsj
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const argparse_1 = require("argparse");
const fs_1 = tslib_1.__importDefault(require("fs"));
const data_source_1 = require("../../mol-util/data-source");
const mvs_data_1 = require("../../extensions/mvs/mvs-data");
(0, data_source_1.setFSModule)(fs_1.default);
/** Return parsed command line arguments for `main` */
function parseArguments() {
    const parser = new argparse_1.ArgumentParser({ description: 'Command-line application for validating MolViewSpec files. Prints validation status (OK/FAILED) to stdout, detailed validation issues to stderr. Exits with a zero exit code if all input files are OK.' });
    parser.add_argument('input', { nargs: '+', help: 'Input file(s) in .mvsj format' });
    parser.add_argument('--no-extra', { action: 'store_true', help: 'Treat presence of extra node params as an issue.' });
    const args = parser.parse_args();
    return { ...args };
}
/** Main workflow for validating MolViewSpec files. Returns the number of failed input files. */
function main(args) {
    let nFailed = 0;
    for (const input of args.input) {
        const data = fs_1.default.readFileSync(input, { encoding: 'utf8' });
        const mvsData = mvs_data_1.MVSData.fromMVSJ(data);
        const issues = mvs_data_1.MVSData.validationIssues(mvsData, { noExtra: args.no_extra });
        const status = issues ? 'FAILED' : 'OK';
        console.log(`${status.padEnd(6)} ${input}`);
        if (issues) {
            nFailed++;
            for (const issue of issues) {
                console.error(issue);
            }
        }
    }
    return nFailed;
}
const nFailed = main(parseArguments());
if (nFailed > 0) {
    process.exitCode = 1;
}
