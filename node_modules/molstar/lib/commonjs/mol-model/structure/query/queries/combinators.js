"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.merge = merge;
exports.intersect = intersect;
const selection_1 = require("../selection");
const generators_1 = require("./generators");
const generic_1 = require("../../../../mol-data/generic");
const structure_1 = require("../../structure");
function merge(queries) {
    if (queries.length === 0) {
        return generators_1.none;
    }
    else if (queries.length === 1) {
        return queries[0];
    }
    return ctx => {
        const ret = selection_1.StructureSelection.UniqueBuilder(ctx.inputStructure);
        for (let i = 0; i < queries.length; i++) {
            selection_1.StructureSelection.forEach(queries[i](ctx), (s, j) => {
                ret.add(s);
                if (i % 100)
                    ctx.throwIfTimedOut();
            });
        }
        return ret.getSelection();
    };
}
function intersect(queries) {
    if (queries.length === 0) {
        return generators_1.none;
    }
    else if (queries.length === 1) {
        return queries[0];
    }
    return ctx => {
        const selections = [];
        for (let i = 0; i < queries.length; i++)
            selections.push(queries[i](ctx));
        let pivotIndex = 0, pivotLength = selection_1.StructureSelection.structureCount(selections[0]);
        for (let i = 1; i < selections.length; i++) {
            const len = selection_1.StructureSelection.structureCount(selections[i]);
            if (len < pivotLength) {
                pivotIndex = i;
                pivotLength = len;
            }
        }
        ctx.throwIfTimedOut();
        const pivotSet = (0, generic_1.HashSet)(s => s.hashCode, structure_1.Structure.areUnitIdsAndIndicesEqual);
        selection_1.StructureSelection.forEach(selections[pivotIndex], s => pivotSet.add(s));
        const ret = selection_1.StructureSelection.UniqueBuilder(ctx.inputStructure);
        for (let pI = 0; pI < selections.length; pI++) {
            if (pI === pivotIndex)
                continue;
            selection_1.StructureSelection.forEach(selections[pI], s => {
                if (pivotSet.has(s))
                    ret.add(s);
            });
            ctx.throwIfTimedOut();
        }
        return ret.getSelection();
    };
}
// TODO: distanceCluster
