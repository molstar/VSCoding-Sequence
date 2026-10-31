/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { mmCIF_Schema } from '../../../mol-io/reader/cif/schema/mmcif';
import { Table } from '../../../mol-data/db';
import { mmCIF_chemComp_schema } from '../../../mol-io/reader/cif/schema/mmcif-extras';
import { getNormalizedAtomSite } from './util';
export const BasicSchema = {
    entry: mmCIF_Schema.entry,
    struct: mmCIF_Schema.struct,
    struct_asym: mmCIF_Schema.struct_asym,
    ihm_model_list: mmCIF_Schema.ihm_model_list,
    ihm_model_group: mmCIF_Schema.ihm_model_group,
    ihm_model_group_link: mmCIF_Schema.ihm_model_group_link,
    entity: mmCIF_Schema.entity,
    entity_poly: mmCIF_Schema.entity_poly,
    entity_poly_seq: mmCIF_Schema.entity_poly_seq,
    pdbx_entity_branch: mmCIF_Schema.pdbx_entity_branch,
    chem_comp: mmCIF_chemComp_schema,
    pdbx_chem_comp_identifier: mmCIF_Schema.pdbx_chem_comp_identifier,
    atom_site: mmCIF_Schema.atom_site,
    ihm_sphere_obj_site: mmCIF_Schema.ihm_sphere_obj_site,
    ihm_gaussian_obj_site: mmCIF_Schema.ihm_gaussian_obj_site,
    pdbx_unobs_or_zero_occ_residues: mmCIF_Schema.pdbx_unobs_or_zero_occ_residues,
    pdbx_molecule: mmCIF_Schema.pdbx_molecule,
};
export function createBasic(data, normalize = false) {
    const basic = Object.create(null);
    for (const name of Object.keys(BasicSchema)) {
        if (name in data) {
            basic[name] = data[name];
        }
        else {
            basic[name] = Table.ofUndefinedColumns(BasicSchema[name], 0);
        }
    }
    if (normalize) {
        basic.atom_site = getNormalizedAtomSite(basic.atom_site);
    }
    return basic;
}
