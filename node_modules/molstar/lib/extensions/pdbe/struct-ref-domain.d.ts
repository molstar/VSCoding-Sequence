/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Column, Table } from '../../mol-data/db';
import { CifWriter } from '../../mol-io/writer/cif';
import { Model } from '../../mol-model/structure';
import { PropertyWrapper } from '../../mol-model-props/common/wrapper';
export declare namespace PDBeStructRefDomain {
    type Property = PropertyWrapper<Table<Schema['pdbe_struct_ref_domain']> | undefined>;
    function get(model: Model): Property | undefined;
    const Schema: {
        pdbe_struct_ref_domain: {
            id: Column.Schema.Int;
            db_name: Column.Schema.Str;
            db_code: Column.Schema.Str;
            identifier: Column.Schema.Str;
            name: Column.Schema.Str;
            label_entity_id: Column.Schema.Str;
            label_asym_id: Column.Schema.Str;
            beg_label_seq_id: Column.Schema.Int;
            beg_pdbx_PDB_ins_code: Column.Schema.Str;
            end_label_seq_id: Column.Schema.Int;
            end_pdbx_PDB_ins_code: Column.Schema.Str;
        };
    };
    type Schema = typeof Schema;
    const Descriptor: {
        name: string;
        cifExport: {
            prefix: string;
            context(ctx: import("../../mol-model/structure").CifExportContext): Property;
            categories: CifWriter.Category<Property>[];
        };
    };
    function attachFromCifOrApi(model: Model, params: {
        PDBe_apiSourceJson?: (model: Model) => Promise<any>;
    }): Promise<boolean>;
}
