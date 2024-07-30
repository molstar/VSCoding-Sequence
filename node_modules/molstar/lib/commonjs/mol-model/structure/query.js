"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureQuery = exports.StructureSelection = exports.Queries = void 0;
const tslib_1 = require("tslib");
const selection_1 = require("./query/selection");
Object.defineProperty(exports, "StructureSelection", { enumerable: true, get: function () { return selection_1.StructureSelection; } });
const query_1 = require("./query/query");
Object.defineProperty(exports, "StructureQuery", { enumerable: true, get: function () { return query_1.StructureQuery; } });
tslib_1.__exportStar(require("./query/context"), exports);
const generators = tslib_1.__importStar(require("./query/queries/generators"));
const modifiers = tslib_1.__importStar(require("./query/queries/modifiers"));
const filters = tslib_1.__importStar(require("./query/queries/filters"));
const combinators = tslib_1.__importStar(require("./query/queries/combinators"));
const internal = tslib_1.__importStar(require("./query/queries/internal"));
const atomset = tslib_1.__importStar(require("./query/queries/atom-set"));
const predicates_1 = require("./query/predicates");
exports.Queries = {
    generators,
    filters,
    modifiers,
    combinators,
    pred: predicates_1.Predicates,
    internal,
    atomset
};
