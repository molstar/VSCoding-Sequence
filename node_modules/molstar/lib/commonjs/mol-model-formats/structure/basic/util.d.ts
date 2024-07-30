/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { AtomSite, BasicData } from './schema';
import { Column, Table } from '../../../mol-data/db';
export declare function getModelGroupName(model_id: number, data: BasicData): string;
/** Fix possibly missing auth_/label_ columns */
export declare function getNormalizedAtomSite(atom_site: AtomSite): Table<{
    auth_asym_id: Column.Schema.Str;
    auth_atom_id: Column.Schema.Str;
    auth_comp_id: Column.Schema.Str;
    auth_seq_id: Column.Schema.Int;
    B_iso_or_equiv: Column.Schema.Float;
    Cartn_x: Column.Schema.Coordinate;
    Cartn_y: Column.Schema.Coordinate;
    Cartn_z: Column.Schema.Coordinate;
    group_PDB: Column.Schema.Aliased<"ATOM" | "HETATM">;
    id: Column.Schema.Int;
    label_alt_id: Column.Schema.Str;
    label_asym_id: Column.Schema.Str;
    label_atom_id: Column.Schema.Str;
    label_comp_id: Column.Schema.Str;
    label_entity_id: Column.Schema.Str;
    label_seq_id: Column.Schema.Int;
    occupancy: Column.Schema.Float;
    type_symbol: Column.Schema.Str;
    pdbx_PDB_ins_code: Column.Schema.Str;
    pdbx_PDB_model_num: Column.Schema.Int;
    pdbx_formal_charge: Column.Schema.Int;
    pdbx_label_index: Column.Schema.Int;
    pdbx_sifts_xref_db_name: Column.Schema.Str;
    pdbx_sifts_xref_db_acc: Column.Schema.Str;
    pdbx_sifts_xref_db_num: Column.Schema.Str;
    pdbx_sifts_xref_db_res: Column.Schema.Str;
    ihm_model_id: Column.Schema.Int;
}>;
