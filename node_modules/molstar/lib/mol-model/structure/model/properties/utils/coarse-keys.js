/**
 * Copyright (c) 2017-2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { SortedRanges } from '../../../../../mol-data/int/sorted-ranges';
import { OrderedSet } from '../../../../../mol-data/int';
function getElementKey(map, key, counter) {
    if (map.has(key))
        return map.get(key);
    const ret = counter.index++;
    map.set(key, ret);
    return ret;
}
function getElementSubstructureKeyMap(map, key) {
    if (map.has(key))
        return map.get(key);
    const ret = new Map();
    map.set(key, ret);
    return ret;
}
function createLookUp(entities, chain, seq) {
    const getEntKey = entities.getEntityIndex;
    const findChainKey = (e, c) => {
        const eKey = getEntKey(e);
        if (eKey < 0)
            return -1;
        const cm = chain.get(eKey);
        if (!cm.has(c))
            return -1;
        return cm.get(c);
    };
    const findSequenceKey = (e, c, s) => {
        const eKey = getEntKey(e);
        if (eKey < 0)
            return -1;
        const cm = chain.get(eKey);
        if (cm === undefined)
            return -1;
        const cKey = cm.get(c);
        if (cKey === undefined)
            return -1;
        const sm = seq.get(cKey);
        const { elementIndices, seqRanges } = sm;
        const idx = SortedRanges.firstIntersectionIndex(seqRanges, OrderedSet.ofSingleton(s));
        return (idx !== -1 ? elementIndices[idx] : -1);
    };
    return { findChainKey, findSequenceKey };
}
function missingEntity(k) {
    throw new Error(`Missing entity entry for entity id '${k}'.`);
}
export function getCoarseKeys(data, entities) {
    const { entity_id, asym_id, seq_id_begin, seq_id_end, count, chainElementSegments } = data;
    const seqMaps = new Map();
    const chainMaps = new Map(), chainCounter = { index: 0 };
    const chainKey = new Int32Array(count);
    const entityKey = new Int32Array(count);
    const chainToEntity = new Int32Array(chainElementSegments.count);
    for (let i = 0; i < count; i++) {
        entityKey[i] = entities.getEntityIndex(entity_id.value(i));
        if (entityKey[i] < 0)
            missingEntity(entity_id.value(i));
    }
    for (let cI = 0; cI < chainElementSegments.count; cI++) {
        const start = chainElementSegments.offsets[cI];
        const end = chainElementSegments.offsets[cI + 1];
        const eK = entityKey[start];
        chainToEntity[cI] = eK;
        const map = getElementSubstructureKeyMap(chainMaps, eK);
        const key = getElementKey(map, asym_id.value(start), chainCounter);
        for (let i = start; i < end; i++)
            chainKey[i] = key;
        // create seq_id map for the ranges defined by seq_id_begin and seq_id_end
        const elementIndices = [];
        const seqRanges = [];
        for (let i = start; i < end; i++) {
            const seqStart = seq_id_begin.value(i);
            const seqEnd = seq_id_end.value(i);
            elementIndices.push(i);
            seqRanges.push(seqStart, seqEnd);
        }
        const seqMap = { elementIndices, seqRanges: SortedRanges.ofSortedRanges(seqRanges) };
        seqMaps.set(key, seqMap);
    }
    const { findChainKey, findSequenceKey } = createLookUp(entities, chainMaps, seqMaps);
    const getEntityFromChain = c => {
        return chainToEntity[c];
    };
    return { chainKey, entityKey, findSequenceKey, findChainKey, getEntityFromChain };
}
