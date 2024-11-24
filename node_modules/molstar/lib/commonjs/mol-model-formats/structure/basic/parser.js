"use strict";
/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createModels = createModels;
const db_1 = require("../../../mol-data/db");
const uuid_1 = require("../../../mol-util/uuid");
const model_1 = require("../../../mol-model/structure/model/model");
const custom_property_1 = require("../../../mol-model/custom-property");
const atomic_1 = require("./atomic");
const coarse_1 = require("./coarse");
const sequence_1 = require("./sequence");
const sort_1 = require("./sort");
const atomic_ranges_1 = require("../../../mol-model/structure/model/properties/utils/atomic-ranges");
const properties_1 = require("./properties");
const entities_1 = require("./entities");
const util_1 = require("./util");
const trajectory_1 = require("../../../mol-model/structure/trajectory");
async function createModels(data, format, ctx) {
    const properties = getCommonProperties(data, format);
    const models = data.ihm_model_list._rowCount > 0
        ? await readIntegrative(ctx, data, properties, format)
        : await readStandard(ctx, data, properties, format);
    for (let i = 0; i < models.length; i++) {
        model_1.Model.TrajectoryInfo.set(models[i], { index: i, size: models.length });
    }
    return new trajectory_1.ArrayTrajectory(models);
}
function getCommonProperties(data, format) {
    return {
        missingResidues: (0, properties_1.getMissingResidues)(data),
        chemicalComponentMap: (0, properties_1.getChemicalComponentMap)(data),
        saccharideComponentMap: (0, properties_1.getSaccharideComponentMap)(data)
    };
}
/** Standard atomic model */
function createStandardModel(data, atom_site, sourceIndex, entities, properties, format, previous) {
    const atomic = (0, atomic_1.getAtomicHierarchyAndConformation)(atom_site, sourceIndex, entities, properties.chemicalComponentMap, format, previous);
    const modelNum = atom_site.pdbx_PDB_model_num.value(0);
    if (previous && atomic.sameAsPrevious) {
        return {
            ...previous,
            id: uuid_1.UUID.create22(),
            modelNum,
            atomicConformation: atomic.conformation,
            _dynamicPropertyData: Object.create(null)
        };
    }
    const coarse = coarse_1.EmptyCoarse;
    const sequence = (0, sequence_1.getSequence)(data, entities, atomic.hierarchy, coarse.hierarchy);
    const atomicRanges = (0, atomic_ranges_1.getAtomicRanges)(atomic.hierarchy, entities, atomic.conformation, sequence);
    const structAsymMap = (0, properties_1.getStructAsymMap)(atomic.hierarchy);
    const entry = data.entry.id.valueKind(0) === 0 /* Column.ValueKinds.Present */
        ? data.entry.id.value(0) : format.name;
    const label = [];
    if (entry)
        label.push(entry);
    if (data.struct.title.valueKind(0) === 0 /* Column.ValueKinds.Present */)
        label.push(data.struct.title.value(0));
    return {
        id: uuid_1.UUID.create22(),
        entryId: entry,
        label: label.join(' | '),
        entry,
        sourceData: format,
        modelNum,
        parent: undefined,
        entities: (0, entities_1.getEntitiesWithPRD)(data, entities, structAsymMap),
        sequence,
        atomicHierarchy: atomic.hierarchy,
        atomicConformation: atomic.conformation,
        atomicRanges,
        atomicChainOperatorMappinng: atomic.chainOperatorMapping,
        coarseHierarchy: coarse.hierarchy,
        coarseConformation: coarse.conformation,
        properties: {
            ...properties,
            structAsymMap
        },
        customProperties: new custom_property_1.CustomProperties(),
        _staticPropertyData: Object.create(null),
        _dynamicPropertyData: Object.create(null)
    };
}
/** Integrative model with atomic/coarse parts */
function createIntegrativeModel(data, ihm, properties, format) {
    const atomic = (0, atomic_1.getAtomicHierarchyAndConformation)(ihm.atom_site, ihm.atom_site_sourceIndex, ihm.entities, properties.chemicalComponentMap, format);
    const coarse = (0, coarse_1.getCoarse)(ihm, properties.chemicalComponentMap);
    const sequence = (0, sequence_1.getSequence)(data, ihm.entities, atomic.hierarchy, coarse.hierarchy);
    const atomicRanges = (0, atomic_ranges_1.getAtomicRanges)(atomic.hierarchy, ihm.entities, atomic.conformation, sequence);
    const entry = data.entry.id.valueKind(0) === 0 /* Column.ValueKinds.Present */
        ? data.entry.id.value(0) : format.name;
    const label = [];
    if (entry)
        label.push(entry);
    if (data.struct.title.valueKind(0) === 0 /* Column.ValueKinds.Present */)
        label.push(data.struct.title.value(0));
    if (ihm.model_name)
        label.push(ihm.model_name);
    if (ihm.model_group_name)
        label.push(ihm.model_group_name);
    const structAsymMap = (0, properties_1.getStructAsymMap)(atomic.hierarchy, data);
    return {
        id: uuid_1.UUID.create22(),
        entryId: entry,
        label: label.join(' | '),
        entry,
        sourceData: format,
        modelNum: ihm.model_id,
        parent: undefined,
        entities: (0, entities_1.getEntitiesWithPRD)(data, ihm.entities, structAsymMap),
        sequence,
        atomicHierarchy: atomic.hierarchy,
        atomicConformation: atomic.conformation,
        atomicRanges,
        atomicChainOperatorMappinng: atomic.chainOperatorMapping,
        coarseHierarchy: coarse.hierarchy,
        coarseConformation: coarse.conformation,
        properties: {
            ...properties,
            structAsymMap
        },
        customProperties: new custom_property_1.CustomProperties(),
        _staticPropertyData: Object.create(null),
        _dynamicPropertyData: Object.create(null)
    };
}
function findModelEnd(num, startIndex) {
    const rowCount = num.rowCount;
    if (!num.isDefined)
        return rowCount;
    let endIndex = startIndex + 1;
    while (endIndex < rowCount && num.areValuesEqual(startIndex, endIndex))
        endIndex++;
    return endIndex;
}
async function readStandard(ctx, data, properties, format) {
    const models = [];
    if (data.atom_site) {
        const atomCount = data.atom_site.id.rowCount;
        const entities = (0, entities_1.getEntityData)(data);
        let modelStart = 0;
        while (modelStart < atomCount) {
            const modelEnd = findModelEnd(data.atom_site.pdbx_PDB_model_num, modelStart);
            const { atom_site, sourceIndex } = await (0, sort_1.sortAtomSite)(ctx, data.atom_site, modelStart, modelEnd);
            const model = createStandardModel(data, atom_site, sourceIndex, entities, properties, format, models.length > 0 ? models[models.length - 1] : void 0);
            models.push(model);
            modelStart = modelEnd;
        }
    }
    return models;
}
function splitTable(table, col) {
    const ret = new Map();
    const rowCount = table._rowCount;
    let modelStart = 0;
    while (modelStart < rowCount) {
        const modelEnd = findModelEnd(col, modelStart);
        const id = col.value(modelStart);
        ret.set(id, {
            table: db_1.Table.window(table, table._schema, modelStart, modelEnd),
            start: modelStart,
            end: modelEnd
        });
        modelStart = modelEnd;
    }
    return ret;
}
async function readIntegrative(ctx, data, properties, format) {
    const entities = (0, entities_1.getEntityData)(data);
    // when `atom_site.ihm_model_id` is undefined fall back to `atom_site.pdbx_PDB_model_num`
    const atom_sites_modelColumn = data.atom_site.ihm_model_id.isDefined
        ? data.atom_site.ihm_model_id : data.atom_site.pdbx_PDB_model_num;
    const atom_sites = splitTable(data.atom_site, atom_sites_modelColumn);
    // TODO: will coarse IHM records require sorting or will we trust it?
    // ==> Probably implement a sort as as well and store the sourceIndex same as with atomSite
    // If the sorting is implemented, updated mol-model/structure/properties: atom.sourceIndex
    const sphere_sites = splitTable(data.ihm_sphere_obj_site, data.ihm_sphere_obj_site.model_id);
    const gauss_sites = splitTable(data.ihm_gaussian_obj_site, data.ihm_gaussian_obj_site.model_id);
    const models = [];
    if (data.ihm_model_list) {
        const { model_id, model_name } = data.ihm_model_list;
        for (let i = 0; i < data.ihm_model_list._rowCount; i++) {
            const id = model_id.value(i);
            let atom_site, atom_site_sourceIndex;
            if (atom_sites.has(id)) {
                const e = atom_sites.get(id);
                // need to sort `data.atom_site` as `e.start` and `e.end` are indices into that
                const { atom_site: sorted, sourceIndex } = await (0, sort_1.sortAtomSite)(ctx, data.atom_site, e.start, e.end);
                atom_site = sorted;
                atom_site_sourceIndex = sourceIndex;
            }
            else {
                atom_site = db_1.Table.window(data.atom_site, data.atom_site._schema, 0, 0);
                atom_site_sourceIndex = db_1.Column.ofIntArray([]);
            }
            const ihm = {
                model_id: id,
                model_name: model_name.value(i),
                model_group_name: (0, util_1.getModelGroupName)(id, data),
                entities,
                atom_site,
                atom_site_sourceIndex,
                ihm_sphere_obj_site: sphere_sites.has(id) ? sphere_sites.get(id).table : db_1.Table.window(data.ihm_sphere_obj_site, data.ihm_sphere_obj_site._schema, 0, 0),
                ihm_gaussian_obj_site: gauss_sites.has(id) ? gauss_sites.get(id).table : db_1.Table.window(data.ihm_gaussian_obj_site, data.ihm_gaussian_obj_site._schema, 0, 0)
            };
            const model = createIntegrativeModel(data, ihm, properties, format);
            models.push(model);
        }
    }
    return models;
}
