/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Column } from '../../../../mol-data/db';
export declare const mmCIF_residueId_schema: {
    label_comp_id: Column.Schema.Str;
    label_seq_id: Column.Schema.Int;
    pdbx_PDB_ins_code: Column.Schema.Str;
    label_asym_id: Column.Schema.Str;
    label_entity_id: Column.Schema.Str;
    auth_comp_id: Column.Schema.Str;
    auth_seq_id: Column.Schema.Int;
    auth_asym_id: Column.Schema.Str;
};
export declare const mmCIF_chemCompBond_schema: {
    /** Indicates if the bond entry was taken from the protonation variant dictionary */
    molstar_protonation_variant: Column.Schema.Str;
    atom_id_1: Column.Schema.Str;
    atom_id_2: Column.Schema.Str;
    comp_id: Column.Schema.Str;
    value_order: Column.Schema.Aliased<"sing" | "doub" | "trip" | "quad" | "arom" | "poly" | "delo" | "pi">;
    pdbx_ordinal: Column.Schema.Int;
    pdbx_stereo_config: Column.Schema.Aliased<"z" | "n" | "e">;
    pdbx_aromatic_flag: Column.Schema.Aliased<"y" | "n">;
};
/** Has `type` extended with 'ION' and 'LIPID' */
export declare const mmCIF_chemComp_schema: {
    type: Column.Schema.Aliased<"other" | "d-peptide linking" | "l-peptide linking" | "d-peptide nh3 amino terminus" | "l-peptide nh3 amino terminus" | "d-peptide cooh carboxy terminus" | "l-peptide cooh carboxy terminus" | "dna linking" | "rna linking" | "l-rna linking" | "l-dna linking" | "dna oh 5 prime terminus" | "rna oh 5 prime terminus" | "dna oh 3 prime terminus" | "rna oh 3 prime terminus" | "d-saccharide, beta linking" | "d-saccharide, alpha linking" | "l-saccharide, beta linking" | "l-saccharide, alpha linking" | "l-saccharide" | "d-saccharide" | "saccharide" | "non-polymer" | "peptide linking" | "peptide-like" | "l-gamma-peptide, c-delta linking" | "d-gamma-peptide, c-delta linking" | "l-beta-peptide, c-gamma linking" | "d-beta-peptide, c-gamma linking" | "ion" | "lipid">;
    formula: Column.Schema.Str;
    formula_weight: Column.Schema.Float;
    id: Column.Schema.Str;
    mon_nstd_flag: Column.Schema.Aliased<"y" | "yes" | "no" | "n">;
    name: Column.Schema.Str;
    pdbx_synonyms: Column.Schema.List<string>;
};
export type mmCIF_chemComp_schema = typeof mmCIF_chemComp_schema;
