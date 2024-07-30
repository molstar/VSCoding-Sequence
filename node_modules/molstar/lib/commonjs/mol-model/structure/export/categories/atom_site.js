"use strict";
/**
 * Copyright (c) 2017-2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports._atom_site = void 0;
exports.residueIdFields = residueIdFields;
exports.chainIdFields = chainIdFields;
exports.entityIdFields = entityIdFields;
exports.atomIdFields = atomIdFields;
const cif_1 = require("../../../../mol-io/writer/cif");
const mmcif_1 = require("../../../../mol-model-formats/structure/mmcif");
const sifts_mapping_1 = require("../../../../mol-model-props/sequence/sifts-mapping");
const structure_1 = require("../../structure");
var CifField = cif_1.CifWriter.Field;
var E = cif_1.CifWriter.Encodings;
function atom_site_label_asym_id(e) {
    const l = structure_1.StructureProperties.chain.label_asym_id(e);
    const suffix = e.unit.conformation.operator.suffix;
    if (!suffix)
        return l;
    return l + suffix;
}
function atom_site_auth_asym_id(e) {
    const l = structure_1.StructureProperties.chain.auth_asym_id(e);
    const suffix = e.unit.conformation.operator.suffix;
    if (!suffix)
        return l;
    return l + suffix;
}
const atom_site_pdbx_label_index = {
    shouldInclude(s) {
        var _a;
        return !!((_a = s.atom_site) === null || _a === void 0 ? void 0 : _a.pdbx_label_index.isDefined);
    },
    value(e, d) {
        const srcIndex = d.sourceIndex.value(e.element);
        return d.atom_site.pdbx_label_index.value(srcIndex);
    },
};
const SIFTS = {
    shouldInclude(s) {
        return sifts_mapping_1.SIFTSMapping.isAvailable(s.structure.models[0]);
    },
    pdbx_sifts_xref_db_name: {
        value(e, d) {
            const srcIndex = d.sourceIndex.value(e.element);
            return d.atom_site.pdbx_sifts_xref_db_name.value(srcIndex);
        },
        valueKind(e, d) {
            const srcIndex = d.sourceIndex.value(e.element);
            return d.atom_site.pdbx_sifts_xref_db_name.valueKind(srcIndex);
        },
    },
    pdbx_sifts_xref_db_acc: {
        value(e, d) {
            const srcIndex = d.sourceIndex.value(e.element);
            return d.atom_site.pdbx_sifts_xref_db_acc.value(srcIndex);
        },
        valueKind(e, d) {
            const srcIndex = d.sourceIndex.value(e.element);
            return d.atom_site.pdbx_sifts_xref_db_acc.valueKind(srcIndex);
        },
    },
    pdbx_sifts_xref_db_num: {
        value(e, d) {
            const srcIndex = d.sourceIndex.value(e.element);
            return d.atom_site.pdbx_sifts_xref_db_num.value(srcIndex);
        },
        valueKind(e, d) {
            const srcIndex = d.sourceIndex.value(e.element);
            return d.atom_site.pdbx_sifts_xref_db_num.valueKind(srcIndex);
        },
    },
    pdbx_sifts_xref_db_res: {
        value(e, d) {
            const srcIndex = d.sourceIndex.value(e.element);
            return d.atom_site.pdbx_sifts_xref_db_res.value(srcIndex);
        },
        valueKind(e, d) {
            const srcIndex = d.sourceIndex.value(e.element);
            return d.atom_site.pdbx_sifts_xref_db_res.valueKind(srcIndex);
        },
    }
};
const atom_site_fields = () => cif_1.CifWriter.fields()
    .str('group_PDB', structure_1.StructureProperties.residue.group_PDB)
    .index('id')
    .str('type_symbol', structure_1.StructureProperties.atom.type_symbol)
    .str('label_atom_id', structure_1.StructureProperties.atom.label_atom_id)
    .str('label_comp_id', structure_1.StructureProperties.atom.label_comp_id)
    .int('label_seq_id', structure_1.StructureProperties.residue.label_seq_id, {
    encoder: E.deltaRLE,
    valueKind: (k, d) => {
        const m = k.unit.model;
        return m.atomicHierarchy.residues.label_seq_id.valueKind(m.atomicHierarchy.residueAtomSegments.index[k.element]);
    }
})
    .str('label_alt_id', structure_1.StructureProperties.atom.label_alt_id)
    .str('pdbx_PDB_ins_code', structure_1.StructureProperties.residue.pdbx_PDB_ins_code)
    .str('label_asym_id', atom_site_label_asym_id)
    .str('label_entity_id', structure_1.StructureProperties.chain.label_entity_id)
    .float('Cartn_x', structure_1.StructureProperties.atom.x, { digitCount: 3, encoder: E.fixedPoint3 })
    .float('Cartn_y', structure_1.StructureProperties.atom.y, { digitCount: 3, encoder: E.fixedPoint3 })
    .float('Cartn_z', structure_1.StructureProperties.atom.z, { digitCount: 3, encoder: E.fixedPoint3 })
    .float('occupancy', structure_1.StructureProperties.atom.occupancy, { digitCount: 2, encoder: E.fixedPoint2 })
    .float('B_iso_or_equiv', structure_1.StructureProperties.atom.B_iso_or_equiv, { digitCount: 2, encoder: E.fixedPoint2 })
    .int('pdbx_formal_charge', structure_1.StructureProperties.atom.pdbx_formal_charge, {
    encoder: E.deltaRLE,
    valueKind: (k, d) => k.unit.model.atomicHierarchy.atoms.pdbx_formal_charge.valueKind(k.element)
})
    .str('auth_atom_id', structure_1.StructureProperties.atom.auth_atom_id)
    .str('auth_comp_id', structure_1.StructureProperties.atom.auth_comp_id)
    .int('auth_seq_id', structure_1.StructureProperties.residue.auth_seq_id, { encoder: E.deltaRLE })
    .str('auth_asym_id', atom_site_auth_asym_id)
    .int('pdbx_PDB_model_num', structure_1.StructureProperties.unit.model_num, { encoder: E.deltaRLE })
    .int('pdbx_label_index', atom_site_pdbx_label_index.value, { shouldInclude: atom_site_pdbx_label_index.shouldInclude })
    // SIFTS
    .str('pdbx_sifts_xref_db_name', SIFTS.pdbx_sifts_xref_db_name.value, { shouldInclude: SIFTS.shouldInclude, valueKind: SIFTS.pdbx_sifts_xref_db_name.valueKind })
    .str('pdbx_sifts_xref_db_acc', SIFTS.pdbx_sifts_xref_db_acc.value, { shouldInclude: SIFTS.shouldInclude, valueKind: SIFTS.pdbx_sifts_xref_db_acc.valueKind })
    .str('pdbx_sifts_xref_db_num', SIFTS.pdbx_sifts_xref_db_num.value, { shouldInclude: SIFTS.shouldInclude, valueKind: SIFTS.pdbx_sifts_xref_db_num.valueKind })
    .str('pdbx_sifts_xref_db_res', SIFTS.pdbx_sifts_xref_db_res.value, { shouldInclude: SIFTS.shouldInclude, valueKind: SIFTS.pdbx_sifts_xref_db_res.valueKind })
    // .str('operator_name', P.unit.operator_name, {
    //     shouldInclude: structure => structure.units.some(u => !u.conformation.operator.isIdentity)
    // })
    .getFields();
exports._atom_site = {
    name: 'atom_site',
    instance({ structures }) {
        return {
            fields: atom_site_fields(),
            source: structures.map(s => ({
                data: {
                    structure: s,
                    sourceIndex: s.model.atomicHierarchy.atomSourceIndex,
                    atom_site: mmcif_1.MmcifFormat.is(s.model.sourceData) ? s.model.sourceData.data.db.atom_site : void 0
                },
                rowCount: s.elementCount,
                keys: () => s.elementLocations()
            }))
        };
    }
};
function prepostfixed(prefix, name) {
    if (prefix)
        return `${prefix}_${name}`;
    return name;
}
function prefixedInsCode(prefix) {
    if (!prefix)
        return 'pdbx_PDB_ins_code';
    return `pdbx_${prefix}_PDB_ins_code`;
}
function mappedProp(loc, prop) {
    return (k, d) => prop(loc(k, d));
}
function addModelNum(fields, getLocation, options) {
    if (options && options.includeModelNum) {
        fields.int('pdbx_PDB_model_num', mappedProp(getLocation, structure_1.StructureProperties.unit.model_num));
    }
}
function residueIdFields(getLocation, options) {
    const prefix = options && options.prefix;
    const ret = cif_1.CifWriter.fields()
        .str(prepostfixed(prefix, `label_comp_id`), mappedProp(getLocation, structure_1.StructureProperties.atom.label_comp_id))
        .int(prepostfixed(prefix, `label_seq_id`), mappedProp(getLocation, structure_1.StructureProperties.residue.label_seq_id), {
        encoder: E.deltaRLE,
        valueKind: (k, d) => {
            const e = getLocation(k, d);
            const m = e.unit.model;
            return m.atomicHierarchy.residues.label_seq_id.valueKind(m.atomicHierarchy.residueAtomSegments.index[e.element]);
        }
    })
        .str(prefixedInsCode(prefix), mappedProp(getLocation, structure_1.StructureProperties.residue.pdbx_PDB_ins_code))
        .str(prepostfixed(prefix, `label_asym_id`), mappedProp(getLocation, structure_1.StructureProperties.chain.label_asym_id))
        .str(prepostfixed(prefix, `label_entity_id`), mappedProp(getLocation, structure_1.StructureProperties.chain.label_entity_id))
        .str(prepostfixed(prefix, `auth_comp_id`), mappedProp(getLocation, structure_1.StructureProperties.atom.auth_comp_id))
        .int(prepostfixed(prefix, `auth_seq_id`), mappedProp(getLocation, structure_1.StructureProperties.residue.auth_seq_id), { encoder: E.deltaRLE })
        .str(prepostfixed(prefix, `auth_asym_id`), mappedProp(getLocation, structure_1.StructureProperties.chain.auth_asym_id));
    addModelNum(ret, getLocation, options);
    return ret.getFields();
}
function chainIdFields(getLocation, options) {
    const prefix = options && options.prefix;
    const ret = CifField.build()
        .str(prepostfixed(prefix, `label_asym_id`), mappedProp(getLocation, structure_1.StructureProperties.chain.label_asym_id))
        .str(prepostfixed(prefix, `label_entity_id`), mappedProp(getLocation, structure_1.StructureProperties.chain.label_entity_id))
        .str(prepostfixed(prefix, `auth_asym_id`), mappedProp(getLocation, structure_1.StructureProperties.chain.auth_asym_id));
    addModelNum(ret, getLocation, options);
    return ret.getFields();
}
function entityIdFields(getLocation, options) {
    const prefix = options && options.prefix;
    const ret = CifField.build()
        .str(prepostfixed(prefix, `label_entity_id`), mappedProp(getLocation, structure_1.StructureProperties.chain.label_entity_id));
    addModelNum(ret, getLocation, options);
    return ret.getFields();
}
function atomIdFields(getLocation, options) {
    const prefix = options && options.prefix;
    const ret = cif_1.CifWriter.fields()
        .str(prepostfixed(prefix, `label_atom_id`), mappedProp(getLocation, structure_1.StructureProperties.atom.label_atom_id))
        .str(prepostfixed(prefix, `label_comp_id`), mappedProp(getLocation, structure_1.StructureProperties.atom.label_comp_id))
        .int(prepostfixed(prefix, `label_seq_id`), mappedProp(getLocation, structure_1.StructureProperties.residue.label_seq_id), {
        encoder: E.deltaRLE,
        valueKind: (k, d) => {
            const e = getLocation(k, d);
            const m = e.unit.model;
            return m.atomicHierarchy.residues.label_seq_id.valueKind(m.atomicHierarchy.residueAtomSegments.index[e.element]);
        }
    })
        .str(prepostfixed(prefix, `label_alt_id`), mappedProp(getLocation, structure_1.StructureProperties.atom.label_alt_id))
        .str(prefixedInsCode(prefix), mappedProp(getLocation, structure_1.StructureProperties.residue.pdbx_PDB_ins_code))
        .str(prepostfixed(prefix, `label_asym_id`), mappedProp(getLocation, structure_1.StructureProperties.chain.label_asym_id))
        .str(prepostfixed(prefix, `label_entity_id`), mappedProp(getLocation, structure_1.StructureProperties.chain.label_entity_id))
        .str(prepostfixed(prefix, `auth_atom_id`), mappedProp(getLocation, structure_1.StructureProperties.atom.auth_atom_id))
        .str(prepostfixed(prefix, `auth_comp_id`), mappedProp(getLocation, structure_1.StructureProperties.atom.auth_comp_id))
        .int(prepostfixed(prefix, `auth_seq_id`), mappedProp(getLocation, structure_1.StructureProperties.residue.auth_seq_id), { encoder: E.deltaRLE })
        .str(prepostfixed(prefix, `auth_asym_id`), mappedProp(getLocation, structure_1.StructureProperties.chain.auth_asym_id));
    addModelNum(ret, getLocation, options);
    return ret.getFields();
}
