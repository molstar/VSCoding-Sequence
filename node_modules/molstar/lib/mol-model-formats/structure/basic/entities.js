/**
 * Copyright (c) 2017-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Column, Table } from '../../../mol-data/db';
import { EntitySubtype } from '../../../mol-model/structure/model/properties/common';
import { getEntityType, getEntitySubtype } from '../../../mol-model/structure/model/types';
import { BasicSchema } from './schema';
export function getEntityData(data) {
    let entityData;
    if (!data.entity.id.isDefined) {
        const entityIds = new Set();
        const ids = [];
        const types = [];
        const { label_entity_id, label_comp_id } = data.atom_site;
        for (let i = 0, il = data.atom_site._rowCount; i < il; i++) {
            const entityId = label_entity_id.value(i);
            if (!entityIds.has(entityId)) {
                ids.push(entityId);
                types.push(getEntityType(label_comp_id.value(i)));
                entityIds.add(entityId);
            }
        }
        const { entity_id: sphere_entity_id } = data.ihm_sphere_obj_site;
        for (let i = 0, il = data.ihm_sphere_obj_site._rowCount; i < il; i++) {
            const entityId = sphere_entity_id.value(i);
            if (!entityIds.has(entityId)) {
                ids.push(entityId);
                types.push('polymer');
                entityIds.add(entityId);
            }
        }
        const { entity_id: gaussian_entity_id } = data.ihm_gaussian_obj_site;
        for (let i = 0, il = data.ihm_gaussian_obj_site._rowCount; i < il; i++) {
            const entityId = gaussian_entity_id.value(i);
            if (!entityIds.has(entityId)) {
                ids.push(entityId);
                types.push('polymer');
                entityIds.add(entityId);
            }
        }
        entityData = Table.ofPartialColumns(BasicSchema.entity, {
            id: Column.ofArray({ array: ids, schema: BasicSchema.entity.id }),
            type: Column.ofArray({ array: types, schema: BasicSchema.entity.type }),
        }, ids.length);
    }
    else {
        entityData = data.entity;
    }
    const getEntityIndex = Column.createIndexer(entityData.id);
    //
    const subtypes = new Array(entityData._rowCount);
    subtypes.fill('other');
    const entityIds = new Set();
    let assignSubtype = false;
    if (data.entity_poly && data.entity_poly.type.isDefined) {
        const { entity_id, type, _rowCount } = data.entity_poly;
        for (let i = 0; i < _rowCount; ++i) {
            const entityId = entity_id.value(i);
            subtypes[getEntityIndex(entityId)] = type.value(i);
            entityIds.add(entityId);
        }
    }
    else {
        assignSubtype = true;
    }
    if (data.pdbx_entity_branch && data.pdbx_entity_branch.entity_id.isDefined) {
        const { entity_id, type, _rowCount } = data.pdbx_entity_branch;
        for (let i = 0; i < _rowCount; ++i) {
            const entityId = entity_id.value(i);
            subtypes[getEntityIndex(entityId)] = type.value(i);
            entityIds.add(entityId);
        }
    }
    else {
        assignSubtype = true;
    }
    if (entityIds.size < subtypes.length) {
        // still unassigned subtypes, need to derive from component id/type
        assignSubtype = true;
    }
    if (assignSubtype) {
        const chemCompType = new Map();
        if (data.chem_comp) {
            const { id, type } = data.chem_comp;
            for (let i = 0, il = data.chem_comp._rowCount; i < il; i++) {
                chemCompType.set(id.value(i), type.value(i));
            }
        }
        if (data.atom_site) {
            const { label_entity_id, label_comp_id } = data.atom_site;
            for (let i = 0, il = data.atom_site._rowCount; i < il; i++) {
                const entityId = label_entity_id.value(i);
                if (!entityIds.has(entityId)) {
                    const compId = label_comp_id.value(i);
                    const compType = chemCompType.get(compId) || 'other';
                    subtypes[getEntityIndex(entityId)] = getEntitySubtype(compId, compType);
                    entityIds.add(entityId);
                }
            }
        }
        // TODO how to handle coarse?
    }
    const subtypeColumn = Column.ofArray({ array: subtypes, schema: EntitySubtype });
    return {
        data: entityData,
        subtype: subtypeColumn,
        getEntityIndex
    };
}
export function getEntitiesWithPRD(data, entities, structAsymMap) {
    var _a;
    if (!data.pdbx_molecule || !data.pdbx_molecule.prd_id.isDefined) {
        return entities;
    }
    const prdIds = new Array(entities.data._rowCount);
    prdIds.fill('');
    const { asym_id, prd_id, _rowCount } = data.pdbx_molecule;
    for (let i = 0; i < _rowCount; ++i) {
        const asymId = asym_id.value(i);
        const entityId = (_a = structAsymMap.get(asymId)) === null || _a === void 0 ? void 0 : _a.entity_id;
        if (entityId !== undefined) {
            prdIds[entities.getEntityIndex(entityId)] = prd_id.value(i);
        }
    }
    const prdIdColumn = Column.ofArray({ array: prdIds, schema: Column.Schema.str });
    return {
        ...entities,
        prd_id: prdIdColumn
    };
}
