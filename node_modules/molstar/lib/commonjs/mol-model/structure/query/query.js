"use strict";
/**
 * Copyright (c) 2017-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureQuery = void 0;
const selection_1 = require("./selection");
const context_1 = require("./context");
var StructureQuery;
(function (StructureQuery) {
    function run(query, structure, options) {
        return query(new context_1.QueryContext(structure, options));
    }
    StructureQuery.run = run;
    function loci(query, structure, options) {
        const sel = query(new context_1.QueryContext(structure, options));
        return selection_1.StructureSelection.toLociWithSourceUnits(sel);
    }
    StructureQuery.loci = loci;
})(StructureQuery || (exports.StructureQuery = StructureQuery = {}));
