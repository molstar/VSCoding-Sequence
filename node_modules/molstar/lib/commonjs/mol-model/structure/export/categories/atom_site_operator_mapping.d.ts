/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { CifExportContext } from '../mmcif';
import { CifExportCategoryInfo } from '../../structure';
import { Column } from '../../../../mol-data/db';
export declare function atom_site_operator_mapping(ctx: CifExportContext): CifExportCategoryInfo | undefined;
export declare const AtomSiteOperatorMappingCategoryName = "molstar_atom_site_operator_mapping";
export declare const AtomSiteOperatorMappingSchema: {
    molstar_atom_site_operator_mapping: {
        label_asym_id: Column.Schema.Str;
        auth_asym_id: Column.Schema.Str;
        operator_name: Column.Schema.Str;
        suffix: Column.Schema.Str;
        assembly_id: Column.Schema.Str;
        assembly_operator_id: Column.Schema.Int;
        symmetry_operator_index: Column.Schema.Int;
        symmetry_hkl: Column.Schema.Tensor;
        ncs_id: Column.Schema.Int;
    };
};
