"use strict";
/**
 * Copyright (c) 2017-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMissingResidues = getMissingResidues;
exports.getChemicalComponentMap = getChemicalComponentMap;
exports.getSaccharideComponentMap = getSaccharideComponentMap;
exports.getStructAsymMap = getStructAsymMap;
const db_1 = require("../../../mol-data/db");
const types_1 = require("../../../mol-model/structure/model/types");
const constants_1 = require("../../../mol-model/structure/structure/carbohydrates/constants");
const memoize_1 = require("../../../mol-util/memoize");
function getMissingResidues(data) {
    const map = new Map();
    const getKey = (model_num, asym_id, seq_id) => {
        return `${model_num}|${asym_id}|${seq_id}`;
    };
    const c = data.pdbx_unobs_or_zero_occ_residues;
    for (let i = 0, il = c._rowCount; i < il; ++i) {
        const key = getKey(c.PDB_model_num.value(i), c.label_asym_id.value(i), c.label_seq_id.value(i));
        map.set(key, { polymer_flag: c.polymer_flag.value(i), occupancy_flag: c.occupancy_flag.value(i) });
    }
    return {
        has: (model_num, asym_id, seq_id) => {
            return map.has(getKey(model_num, asym_id, seq_id));
        },
        get: (model_num, asym_id, seq_id) => {
            return map.get(getKey(model_num, asym_id, seq_id));
        },
        size: map.size
    };
}
function getChemicalComponentMap(data) {
    const map = new Map();
    if (data.chem_comp._rowCount > 0) {
        const { id } = data.chem_comp;
        for (let i = 0, il = id.rowCount; i < il; ++i) {
            map.set(id.value(i), db_1.Table.getRow(data.chem_comp, i));
        }
    }
    else {
        const uniqueNames = getUniqueComponentNames(data);
        uniqueNames.forEach(n => {
            map.set(n, (0, types_1.getDefaultChemicalComponent)(n));
        });
    }
    return map;
}
function getSaccharideComponentMap(data) {
    const map = new Map();
    if (data.pdbx_chem_comp_identifier._rowCount > 0) {
        // note that `pdbx_chem_comp_identifier` does not contain
        // a 'SNFG CARBOHYDRATE SYMBOL' entry for 'Unknown' saccharide components
        // so we always need to check `chem_comp` for those
        const { comp_id, type, identifier } = data.pdbx_chem_comp_identifier;
        for (let i = 0, il = comp_id.rowCount; i < il; ++i) {
            if (type.value(i) === 'SNFG CARBOHYDRATE SYMBOL' ||
                type.value(i) === 'SNFG CARB SYMBOL' // legacy, to be removed from mmCIF dictionary
            ) {
                const snfgName = identifier.value(i);
                const saccharideComp = constants_1.SaccharidesSnfgMap.get(snfgName);
                if (saccharideComp) {
                    map.set(comp_id.value(i), saccharideComp);
                }
                else {
                    console.warn(`Unknown SNFG name '${snfgName}'`);
                }
            }
        }
    }
    if (data.chem_comp._rowCount > 0) {
        const { id, type } = data.chem_comp;
        for (let i = 0, il = id.rowCount; i < il; ++i) {
            const _id = id.value(i);
            if (map.has(_id))
                continue;
            const _type = type.value(i);
            if (constants_1.SaccharideCompIdMap.has(_id)) {
                map.set(_id, constants_1.SaccharideCompIdMap.get(_id));
            }
            else if ((0, types_1.getMoleculeType)(_type, _id) === 9 /* MoleculeType.Saccharide */) {
                map.set(_id, constants_1.UnknownSaccharideComponent);
            }
        }
    }
    else {
        const uniqueNames = getUniqueComponentNames(data);
        constants_1.SaccharideCompIdMap.forEach((v, k) => {
            if (!map.has(k) && uniqueNames.has(k))
                map.set(k, v);
        });
    }
    return map;
}
const getUniqueComponentNames = (0, memoize_1.memoize1)((data) => {
    const uniqueNames = new Set();
    const { label_comp_id, auth_comp_id } = data.atom_site;
    const comp_id = label_comp_id.isDefined ? label_comp_id : auth_comp_id;
    for (let i = 0, il = comp_id.rowCount; i < il; ++i) {
        uniqueNames.add(comp_id.value(i));
    }
    return uniqueNames;
});
function getStructAsymMap(atomic, data) {
    const map = new Map();
    const { auth_asym_id, label_asym_id, label_entity_id } = atomic.chains;
    for (let i = 0, _i = atomic.chains._rowCount; i < _i; i++) {
        const id = label_asym_id.value(i);
        map.set(id, { id, auth_id: auth_asym_id.value(i), entity_id: label_entity_id.value(i) });
    }
    // to get asym mapping for coarse/ihm data
    if (data === null || data === void 0 ? void 0 : data.struct_asym._rowCount) {
        const { id, entity_id } = data.struct_asym;
        for (let i = 0, il = id.rowCount; i < il; ++i) {
            const _id = id.value(i);
            if (!map.has(_id)) {
                map.set(_id, {
                    id: _id,
                    auth_id: '',
                    entity_id: entity_id.value(i)
                });
            }
        }
    }
    return map;
}
