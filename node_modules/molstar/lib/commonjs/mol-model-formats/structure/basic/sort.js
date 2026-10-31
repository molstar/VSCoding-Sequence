"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortAtomSite = sortAtomSite;
const util_1 = require("../../../mol-data/util");
const db_1 = require("../../../mol-data/db");
const array_1 = require("../../../mol-util/array");
async function sortAtomSite(ctx, atom_site, start, end) {
    const indices = (0, util_1.createRangeArray)(start, end - 1);
    const { label_entity_id, label_asym_id, label_seq_id } = atom_site;
    const entityBuckets = (0, util_1.makeBuckets)(indices, label_entity_id.value);
    if (ctx.shouldUpdate)
        await ctx.update();
    for (let ei = 0, _eI = entityBuckets.length - 1; ei < _eI; ei++) {
        const chainBuckets = (0, util_1.makeBuckets)(indices, label_asym_id.value, { start: entityBuckets[ei], end: entityBuckets[ei + 1] });
        for (let cI = 0, _cI = chainBuckets.length - 1; cI < _cI; cI++) {
            const aI = chainBuckets[cI];
            // are we in HETATM territory?
            if (label_seq_id.valueKind(aI) !== 0 /* Column.ValueKinds.Present */)
                continue;
            (0, util_1.makeBuckets)(indices, label_seq_id.value, { sort: true, start: aI, end: chainBuckets[cI + 1] });
            if (ctx.shouldUpdate)
                await ctx.update();
        }
        if (ctx.shouldUpdate)
            await ctx.update();
    }
    if ((0, array_1.arrayIsIdentity)(indices) && indices.length === atom_site._rowCount) {
        return { atom_site, sourceIndex: db_1.Column.ofIntArray(indices) };
    }
    return {
        atom_site: db_1.Table.view(atom_site, atom_site._schema, indices),
        sourceIndex: db_1.Column.ofIntArray(indices)
    };
}
