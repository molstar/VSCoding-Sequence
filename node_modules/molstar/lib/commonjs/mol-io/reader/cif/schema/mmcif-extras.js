"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mmCIF_chemComp_schema = exports.mmCIF_chemCompBond_schema = exports.mmCIF_residueId_schema = void 0;
const mmcif_1 = require("./mmcif");
const db_1 = require("../../../../mol-data/db");
exports.mmCIF_residueId_schema = {
    label_comp_id: mmcif_1.mmCIF_Schema.atom_site.label_comp_id,
    label_seq_id: mmcif_1.mmCIF_Schema.atom_site.label_seq_id,
    pdbx_PDB_ins_code: mmcif_1.mmCIF_Schema.atom_site.pdbx_PDB_ins_code,
    label_asym_id: mmcif_1.mmCIF_Schema.atom_site.label_asym_id,
    label_entity_id: mmcif_1.mmCIF_Schema.atom_site.label_entity_id,
    auth_comp_id: mmcif_1.mmCIF_Schema.atom_site.auth_atom_id,
    auth_seq_id: mmcif_1.mmCIF_Schema.atom_site.auth_seq_id,
    auth_asym_id: mmcif_1.mmCIF_Schema.atom_site.auth_asym_id
};
exports.mmCIF_chemCompBond_schema = {
    ...mmcif_1.mmCIF_Schema.chem_comp_bond,
    /** Indicates if the bond entry was taken from the protonation variant dictionary */
    molstar_protonation_variant: db_1.Column.Schema.Str()
};
/** Has `type` extended with 'ION' and 'LIPID' */
exports.mmCIF_chemComp_schema = {
    ...mmcif_1.mmCIF_Schema.chem_comp,
    type: db_1.Column.Schema.Aliased(db_1.Column.Schema.str)
};
