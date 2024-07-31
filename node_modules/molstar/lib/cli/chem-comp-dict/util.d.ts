/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Database } from '../../mol-data/db';
export declare function ensureAvailable(path: string, url: string, forceDownload?: boolean): Promise<void>;
export declare function ensureDataAvailable(options: DataOptions): Promise<void>;
export declare function readFileAsCollection<S extends Database.Schema>(path: string, schema: S): Promise<import("../../mol-data/db").DatabaseCollection<S>>;
export declare function readCCD(): Promise<import("../../mol-data/db").DatabaseCollection<{
    chem_comp: {
        formula: import("../../mol-data/db").Column.Schema.Str;
        formula_weight: import("../../mol-data/db").Column.Schema.Float;
        id: import("../../mol-data/db").Column.Schema.Str;
        mon_nstd_parent_comp_id: import("../../mol-data/db").Column.Schema.List<string>;
        name: import("../../mol-data/db").Column.Schema.Str;
        one_letter_code: import("../../mol-data/db").Column.Schema.Str;
        three_letter_code: import("../../mol-data/db").Column.Schema.Str;
        type: import("../../mol-data/db").Column.Schema.Aliased<"other" | "d-peptide linking" | "l-peptide linking" | "d-peptide nh3 amino terminus" | "l-peptide nh3 amino terminus" | "d-peptide cooh carboxy terminus" | "l-peptide cooh carboxy terminus" | "dna linking" | "rna linking" | "l-rna linking" | "l-dna linking" | "dna oh 5 prime terminus" | "rna oh 5 prime terminus" | "dna oh 3 prime terminus" | "rna oh 3 prime terminus" | "d-saccharide, beta linking" | "d-saccharide, alpha linking" | "l-saccharide, beta linking" | "l-saccharide, alpha linking" | "l-saccharide" | "d-saccharide" | "saccharide" | "non-polymer" | "peptide linking" | "peptide-like" | "l-gamma-peptide, c-delta linking" | "d-gamma-peptide, c-delta linking" | "l-beta-peptide, c-gamma linking" | "d-beta-peptide, c-gamma linking">;
        pdbx_synonyms: import("../../mol-data/db").Column.Schema.List<string>;
        pdbx_type: import("../../mol-data/db").Column.Schema.Str;
        pdbx_ambiguous_flag: import("../../mol-data/db").Column.Schema.Str;
        pdbx_replaced_by: import("../../mol-data/db").Column.Schema.Str;
        pdbx_replaces: import("../../mol-data/db").Column.Schema.Str;
        pdbx_formal_charge: import("../../mol-data/db").Column.Schema.Int;
        pdbx_model_coordinates_details: import("../../mol-data/db").Column.Schema.Str;
        pdbx_model_coordinates_db_code: import("../../mol-data/db").Column.Schema.Str;
        pdbx_ideal_coordinates_details: import("../../mol-data/db").Column.Schema.Str;
        pdbx_ideal_coordinates_missing_flag: import("../../mol-data/db").Column.Schema.Aliased<"y" | "n">;
        pdbx_model_coordinates_missing_flag: import("../../mol-data/db").Column.Schema.Aliased<"y" | "n">;
        pdbx_initial_date: import("../../mol-data/db").Column.Schema.Str;
        pdbx_modified_date: import("../../mol-data/db").Column.Schema.Str;
        pdbx_release_status: import("../../mol-data/db").Column.Schema.Aliased<"REL" | "HOLD" | "HPUB" | "OBS" | "DEL" | "REF_ONLY">;
        pdbx_processing_site: import("../../mol-data/db").Column.Schema.Aliased<"RCSB" | "PDBE" | "PDBJ" | "PDBC" | "EBI">;
    };
    chem_comp_atom: {
        alt_atom_id: import("../../mol-data/db").Column.Schema.Str;
        atom_id: import("../../mol-data/db").Column.Schema.Str;
        charge: import("../../mol-data/db").Column.Schema.Int;
        model_Cartn_x: import("../../mol-data/db").Column.Schema.Coordinate;
        model_Cartn_y: import("../../mol-data/db").Column.Schema.Coordinate;
        model_Cartn_z: import("../../mol-data/db").Column.Schema.Coordinate;
        comp_id: import("../../mol-data/db").Column.Schema.Str;
        type_symbol: import("../../mol-data/db").Column.Schema.Str;
        pdbx_align: import("../../mol-data/db").Column.Schema.Int;
        pdbx_ordinal: import("../../mol-data/db").Column.Schema.Int;
        pdbx_model_Cartn_x_ideal: import("../../mol-data/db").Column.Schema.Coordinate;
        pdbx_model_Cartn_y_ideal: import("../../mol-data/db").Column.Schema.Coordinate;
        pdbx_model_Cartn_z_ideal: import("../../mol-data/db").Column.Schema.Coordinate;
        pdbx_stereo_config: import("../../mol-data/db").Column.Schema.Aliased<"s" | "r" | "n">;
        pdbx_aromatic_flag: import("../../mol-data/db").Column.Schema.Aliased<"y" | "n">;
        pdbx_leaving_atom_flag: import("../../mol-data/db").Column.Schema.Aliased<"y" | "n">;
    };
    chem_comp_bond: {
        atom_id_1: import("../../mol-data/db").Column.Schema.Str;
        atom_id_2: import("../../mol-data/db").Column.Schema.Str;
        comp_id: import("../../mol-data/db").Column.Schema.Str;
        value_order: import("../../mol-data/db").Column.Schema.Aliased<"sing" | "doub" | "trip" | "quad" | "arom" | "poly" | "delo" | "pi">;
        pdbx_ordinal: import("../../mol-data/db").Column.Schema.Int;
        pdbx_stereo_config: import("../../mol-data/db").Column.Schema.Aliased<"z" | "n" | "e">;
        pdbx_aromatic_flag: import("../../mol-data/db").Column.Schema.Aliased<"y" | "n">;
    };
    pdbx_chem_comp_descriptor: {
        comp_id: import("../../mol-data/db").Column.Schema.Str;
        descriptor: import("../../mol-data/db").Column.Schema.Str;
        type: import("../../mol-data/db").Column.Schema.Aliased<"smiles_cannonical" | "smiles_canonical" | "smiles" | "inchi" | "inchi_main" | "inchi_main_formula" | "inchi_main_connect" | "inchi_main_hatom" | "inchi_charge" | "inchi_stereo" | "inchi_isotope" | "inchi_fixedh" | "inchi_reconnect" | "inchikey">;
        program: import("../../mol-data/db").Column.Schema.Str;
        program_version: import("../../mol-data/db").Column.Schema.Str;
    };
    pdbx_chem_comp_identifier: {
        comp_id: import("../../mol-data/db").Column.Schema.Str;
        identifier: import("../../mol-data/db").Column.Schema.Str;
        type: import("../../mol-data/db").Column.Schema.Aliased<"COMMON NAME" | "SYSTEMATIC NAME" | "CAS REGISTRY NUMBER" | "PUBCHEM Identifier" | "MDL Identifier" | "SYNONYM" | "CONDENSED IUPAC CARB SYMBOL" | "IUPAC CARB SYMBOL" | "SNFG CARB SYMBOL" | "CONDENSED IUPAC CARBOHYDRATE SYMBOL" | "IUPAC CARBOHYDRATE SYMBOL" | "SNFG CARBOHYDRATE SYMBOL">;
        program: import("../../mol-data/db").Column.Schema.Str;
        program_version: import("../../mol-data/db").Column.Schema.Str;
    };
}>>;
export declare function readPVCD(): Promise<import("../../mol-data/db").DatabaseCollection<{
    chem_comp: {
        formula: import("../../mol-data/db").Column.Schema.Str;
        formula_weight: import("../../mol-data/db").Column.Schema.Float;
        id: import("../../mol-data/db").Column.Schema.Str;
        mon_nstd_parent_comp_id: import("../../mol-data/db").Column.Schema.List<string>;
        name: import("../../mol-data/db").Column.Schema.Str;
        one_letter_code: import("../../mol-data/db").Column.Schema.Str;
        three_letter_code: import("../../mol-data/db").Column.Schema.Str;
        type: import("../../mol-data/db").Column.Schema.Aliased<"other" | "d-peptide linking" | "l-peptide linking" | "d-peptide nh3 amino terminus" | "l-peptide nh3 amino terminus" | "d-peptide cooh carboxy terminus" | "l-peptide cooh carboxy terminus" | "dna linking" | "rna linking" | "l-rna linking" | "l-dna linking" | "dna oh 5 prime terminus" | "rna oh 5 prime terminus" | "dna oh 3 prime terminus" | "rna oh 3 prime terminus" | "d-saccharide, beta linking" | "d-saccharide, alpha linking" | "l-saccharide, beta linking" | "l-saccharide, alpha linking" | "l-saccharide" | "d-saccharide" | "saccharide" | "non-polymer" | "peptide linking" | "peptide-like" | "l-gamma-peptide, c-delta linking" | "d-gamma-peptide, c-delta linking" | "l-beta-peptide, c-gamma linking" | "d-beta-peptide, c-gamma linking">;
        pdbx_synonyms: import("../../mol-data/db").Column.Schema.List<string>;
        pdbx_type: import("../../mol-data/db").Column.Schema.Str;
        pdbx_ambiguous_flag: import("../../mol-data/db").Column.Schema.Str;
        pdbx_replaced_by: import("../../mol-data/db").Column.Schema.Str;
        pdbx_replaces: import("../../mol-data/db").Column.Schema.Str;
        pdbx_formal_charge: import("../../mol-data/db").Column.Schema.Int;
        pdbx_model_coordinates_details: import("../../mol-data/db").Column.Schema.Str;
        pdbx_model_coordinates_db_code: import("../../mol-data/db").Column.Schema.Str;
        pdbx_ideal_coordinates_details: import("../../mol-data/db").Column.Schema.Str;
        pdbx_ideal_coordinates_missing_flag: import("../../mol-data/db").Column.Schema.Aliased<"y" | "n">;
        pdbx_model_coordinates_missing_flag: import("../../mol-data/db").Column.Schema.Aliased<"y" | "n">;
        pdbx_initial_date: import("../../mol-data/db").Column.Schema.Str;
        pdbx_modified_date: import("../../mol-data/db").Column.Schema.Str;
        pdbx_release_status: import("../../mol-data/db").Column.Schema.Aliased<"REL" | "HOLD" | "HPUB" | "OBS" | "DEL" | "REF_ONLY">;
        pdbx_processing_site: import("../../mol-data/db").Column.Schema.Aliased<"RCSB" | "PDBE" | "PDBJ" | "PDBC" | "EBI">;
    };
    chem_comp_atom: {
        alt_atom_id: import("../../mol-data/db").Column.Schema.Str;
        atom_id: import("../../mol-data/db").Column.Schema.Str;
        charge: import("../../mol-data/db").Column.Schema.Int;
        model_Cartn_x: import("../../mol-data/db").Column.Schema.Coordinate;
        model_Cartn_y: import("../../mol-data/db").Column.Schema.Coordinate;
        model_Cartn_z: import("../../mol-data/db").Column.Schema.Coordinate;
        comp_id: import("../../mol-data/db").Column.Schema.Str;
        type_symbol: import("../../mol-data/db").Column.Schema.Str;
        pdbx_align: import("../../mol-data/db").Column.Schema.Int;
        pdbx_ordinal: import("../../mol-data/db").Column.Schema.Int;
        pdbx_model_Cartn_x_ideal: import("../../mol-data/db").Column.Schema.Coordinate;
        pdbx_model_Cartn_y_ideal: import("../../mol-data/db").Column.Schema.Coordinate;
        pdbx_model_Cartn_z_ideal: import("../../mol-data/db").Column.Schema.Coordinate;
        pdbx_stereo_config: import("../../mol-data/db").Column.Schema.Aliased<"s" | "r" | "n">;
        pdbx_aromatic_flag: import("../../mol-data/db").Column.Schema.Aliased<"y" | "n">;
        pdbx_leaving_atom_flag: import("../../mol-data/db").Column.Schema.Aliased<"y" | "n">;
    };
    chem_comp_bond: {
        atom_id_1: import("../../mol-data/db").Column.Schema.Str;
        atom_id_2: import("../../mol-data/db").Column.Schema.Str;
        comp_id: import("../../mol-data/db").Column.Schema.Str;
        value_order: import("../../mol-data/db").Column.Schema.Aliased<"sing" | "doub" | "trip" | "quad" | "arom" | "poly" | "delo" | "pi">;
        pdbx_ordinal: import("../../mol-data/db").Column.Schema.Int;
        pdbx_stereo_config: import("../../mol-data/db").Column.Schema.Aliased<"z" | "n" | "e">;
        pdbx_aromatic_flag: import("../../mol-data/db").Column.Schema.Aliased<"y" | "n">;
    };
    pdbx_chem_comp_descriptor: {
        comp_id: import("../../mol-data/db").Column.Schema.Str;
        descriptor: import("../../mol-data/db").Column.Schema.Str;
        type: import("../../mol-data/db").Column.Schema.Aliased<"smiles_cannonical" | "smiles_canonical" | "smiles" | "inchi" | "inchi_main" | "inchi_main_formula" | "inchi_main_connect" | "inchi_main_hatom" | "inchi_charge" | "inchi_stereo" | "inchi_isotope" | "inchi_fixedh" | "inchi_reconnect" | "inchikey">;
        program: import("../../mol-data/db").Column.Schema.Str;
        program_version: import("../../mol-data/db").Column.Schema.Str;
    };
    pdbx_chem_comp_identifier: {
        comp_id: import("../../mol-data/db").Column.Schema.Str;
        identifier: import("../../mol-data/db").Column.Schema.Str;
        type: import("../../mol-data/db").Column.Schema.Aliased<"COMMON NAME" | "SYSTEMATIC NAME" | "CAS REGISTRY NUMBER" | "PUBCHEM Identifier" | "MDL Identifier" | "SYNONYM" | "CONDENSED IUPAC CARB SYMBOL" | "IUPAC CARB SYMBOL" | "SNFG CARB SYMBOL" | "CONDENSED IUPAC CARBOHYDRATE SYMBOL" | "IUPAC CARBOHYDRATE SYMBOL" | "SNFG CARBOHYDRATE SYMBOL">;
        program: import("../../mol-data/db").Column.Schema.Str;
        program_version: import("../../mol-data/db").Column.Schema.Str;
    };
}>>;
export declare function getEncodedCif(name: string, database: Database<Database.Schema>, binary?: boolean): string | Uint8Array;
export type DataOptions = {
    ccdUrl?: string;
    pvcdUrl?: string;
    forceDownload?: boolean;
};
export declare const DefaultDataOptions: DataOptions;
