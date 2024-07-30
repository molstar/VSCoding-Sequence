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
import { StructureSelection } from '../selection';
import { getCurrentStructureProperties } from './filters';
export function atomCount(ctx) {
    return ctx.currentStructure.elementCount;
}
export function countQuery(query) {
    return (ctx) => {
        const sel = query(ctx);
        return StructureSelection.structureCount(sel);
    };
}
export function propertySet(prop) {
    return (ctx) => {
        const set = new Set();
        return getCurrentStructureProperties(ctx, prop, set);
    };
}
