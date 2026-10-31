/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { StructureSequence } from '../../../mol-model/structure/model/properties/sequence';
import { Column } from '../../../mol-data/db';
import { Sequence } from '../../../mol-model/sequence';
export function getSequence(data, entities, atomicHierarchy, coarseHierarchy) {
    if (!data.entity_poly_seq || !data.entity_poly_seq._rowCount) {
        return StructureSequence.fromHierarchy(entities, atomicHierarchy, coarseHierarchy);
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
        const compId = Column.window(mon_id, start, i);
        const seqId = Column.window(num, start, i);
        const entityKey = entities.getEntityIndex(id);
        byEntityKey[entityKey] = {
            entityId: id,
            sequence: Sequence.ofResidueNames(compId, seqId)
        };
        sequences.push(byEntityKey[entityKey]);
    }
    return { byEntityKey, sequences };
}
