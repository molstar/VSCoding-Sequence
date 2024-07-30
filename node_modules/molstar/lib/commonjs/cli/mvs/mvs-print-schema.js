#!/usr/bin/env node
"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 *
 * Command-line application for printing MolViewSpec tree schema
 * Build: npm run build
 * Run:   node lib/commonjs/cli/mvs/mvs-print-schema
 *        node lib/commonjs/cli/mvs/mvs-print-schema --markdown
 */
Object.defineProperty(exports, "__esModule", { value: true });
const argparse_1 = require("argparse");
const tree_schema_1 = require("../../extensions/mvs/tree/generic/tree-schema");
const mvs_defaults_1 = require("../../extensions/mvs/tree/mvs/mvs-defaults");
const mvs_tree_1 = require("../../extensions/mvs/tree/mvs/mvs-tree");
/** Return parsed command line arguments for `main` */
function parseArguments() {
    const parser = new argparse_1.ArgumentParser({ description: 'Command-line application for printing MolViewSpec tree schema.' });
    parser.add_argument('-m', '--markdown', { action: 'store_true', help: 'Print the schema as markdown instead of plain text.' });
    const args = parser.parse_args();
    return { ...args };
}
/** Main workflow for printing MolViewSpec tree schema. */
function main(args) {
    if (args.markdown) {
        console.log((0, tree_schema_1.treeSchemaToMarkdown)(mvs_tree_1.MVSTreeSchema, mvs_defaults_1.MVSDefaults));
    }
    else {
        console.log((0, tree_schema_1.treeSchemaToString)(mvs_tree_1.MVSTreeSchema, mvs_defaults_1.MVSDefaults));
    }
}
main(parseArguments());
