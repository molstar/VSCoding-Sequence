"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSequence = getSequence;
const sequence_1 = require("../../../mol-model/structure/model/properties/sequence");
const db_1 = require("../../../mol-data/db");
const sequence_2 = require("../../../mol-model/sequence");
function getSequence(data, entities, atomicHierarchy, coarseHierarchy) {
    if (!data.entity_poly_seq || !data.entity_poly_seq._rowCount) {
        return sequence_1.StructureSequence.fromHierarchy(entities, atomicHierarchy, coarseHierarchy);
    }
    const { entity_id, num, mon_id } = data.entity_poly_seq;
    const byEntityKey = {};
    const sequences = [];
    const count = entity_id.rowCount;
    let i = 0;
    while (i < count) {
        const start = i;
        while (i < count - 1 && entity_id.areValuesEqual(i, i + 1))
            i++;
        i++;
        const id = entity_id.value(start);
        const compId = db_1.Column.window(mon_id, start, i);
        const seqId = db_1.Column.window(num, start, i);
        const entityKey = entities.getEntityIndex(id);
        byEntityKey[entityKey] = {
            entityId: id,
            sequence: sequence_2.Sequence.ofResidueNames(compId, seqId)
        };
        sequences.push(byEntityKey[entityKey]);
    }
    return { byEntityKey, sequences };
}
