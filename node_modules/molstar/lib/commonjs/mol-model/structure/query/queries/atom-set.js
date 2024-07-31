"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Koya Sakuma
 * Adapted from MolQL implemtation of atom-set.ts
 *
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.atomCount = atomCount;
exports.countQuery = countQuery;
exports.propertySet = propertySet;
const selection_1 = require("../selection");
const filters_1 = require("./filters");
function atomCount(ctx) {
    return ctx.currentStructure.elementCount;
}
function countQuery(query) {
    return (ctx) => {
        const sel = query(ctx);
        return selection_1.StructureSelection.structureCount(sel);
    };
}
function propertySet(prop) {
    return (ctx) => {
        const set = new Set();
        return (0, filters_1.getCurrentStructureProperties)(ctx, prop, set);
    };
}
