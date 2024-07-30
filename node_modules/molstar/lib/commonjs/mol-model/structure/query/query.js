"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureQuery = void 0;
const context_1 = require("./context");
var StructureQuery;
(function (StructureQuery) {
    function run(query, structure, options) {
        return query(new context_1.QueryContext(structure, options));
    }
    StructureQuery.run = run;
})(StructureQuery || (exports.StructureQuery = StructureQuery = {}));
