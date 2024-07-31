"use strict";
/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicSchema = void 0;
exports.createBasic = createBasic;
const mmcif_1 = require("../../../mol-io/reader/cif/schema/mmcif");
const db_1 = require("../../../mol-data/db");
const mmcif_extras_1 = require("../../../mol-io/reader/cif/schema/mmcif-extras");
const util_1 = require("./util");
exports.BasicSchema = {
    entry: mmcif_1.mmCIF_Schema.entry,
    struct: mmcif_1.mmCIF_Schema.struct,
    struct_asym: mmcif_1.mmCIF_Schema.struct_asym,
    ihm_model_list: mmcif_1.mmCIF_Schema.ihm_model_list,
    ihm_model_group: mmcif_1.mmCIF_Schema.ihm_model_group,
    ihm_model_group_link: mmcif_1.mmCIF_Schema.ihm_model_group_link,
    entity: mmcif_1.mmCIF_Schema.entity,
    entity_poly: mmcif_1.mmCIF_Schema.entity_poly,
    entity_poly_seq: mmcif_1.mmCIF_Schema.entity_poly_seq,
    pdbx_entity_branch: mmcif_1.mmCIF_Schema.pdbx_entity_branch,
    chem_comp: mmcif_extras_1.mmCIF_chemComp_schema,
    pdbx_chem_comp_identifier: mmcif_1.mmCIF_Schema.pdbx_chem_comp_identifier,
    atom_site: mmcif_1.mmCIF_Schema.atom_site,
    ihm_sphere_obj_site: mmcif_1.mmCIF_Schema.ihm_sphere_obj_site,
    ihm_gaussian_obj_site: mmcif_1.mmCIF_Schema.ihm_gaussian_obj_site,
    pdbx_unobs_or_zero_occ_residues: mmcif_1.mmCIF_Schema.pdbx_unobs_or_zero_occ_residues,
    pdbx_molecule: mmcif_1.mmCIF_Schema.pdbx_molecule,
};
function createBasic(data, normalize = false) {
    const basic = Object.create(null);
    for (const name of Object.keys(exports.BasicSchema)) {
        if (name in data) {
            basic[name] = data[name];
        }
        else {
            basic[name] = db_1.Table.ofUndefinedColumns(exports.BasicSchema[name], 0);
        }
    }
    if (normalize) {
        basic.atom_site = (0, util_1.getNormalizedAtomSite)(basic.atom_site);
    }
    return basic;
}
