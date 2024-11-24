/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { mmCIF_Schema } from '../../../mol-io/reader/cif/schema/mmcif';
import { Table } from '../../../mol-data/db';
import { mmCIF_chemComp_schema } from '../../../mol-io/reader/cif/schema/mmcif-extras';
export type Entry = Table<mmCIF_Schema['entry']>;
export type Struct = Table<mmCIF_Schema['struct']>;
export type StructAsym = Table<mmCIF_Schema['struct_asym']>;
export type IhmModelList = Table<mmCIF_Schema['ihm_model_list']>;
export type IhmModelGroup = Table<mmCIF_Schema['ihm_model_group']>;
export type IhmModelGroupLink = Table<mmCIF_Schema['ihm_model_group_link']>;
export type Entity = Table<mmCIF_Schema['entity']>;
export type EntityPoly = Table<mmCIF_Schema['entity_poly']>;
export type EntityPolySeq = Table<mmCIF_Schema['entity_poly_seq']>;
export type EntityBranch = Table<mmCIF_Schema['pdbx_entity_branch']>;
export type ChemComp = Table<mmCIF_chemComp_schema>;
export type ChemCompIdentifier = Table<mmCIF_Schema['pdbx_chem_comp_identifier']>;
export type AtomSite = Table<mmCIF_Schema['atom_site']>;
export type IhmSphereObjSite = Table<mmCIF_Schema['ihm_sphere_obj_site']>;
export type IhmGaussianObjSite = Table<mmCIF_Schema['ihm_gaussian_obj_site']>;
export type UnobsOrZeroOccResidues = Table<mmCIF_Schema['pdbx_unobs_or_zero_occ_residues']>;
export type Molecule = Table<mmCIF_Schema['pdbx_molecule']>;
export declare const BasicSchema: {
    entry: {
        id: import("../../../mol-data/db").Column.Schema.Str;
    };
    struct: {
        entry_id: import("../../../mol-data/db").Column.Schema.Str;
        title: import("../../../mol-data/db").Column.Schema.Str;
        pdbx_structure_determination_methodology: import("../../../mol-data/db").Column.Schema.Aliased<"experimental" | "integrative" | "computational">;
        pdbx_descriptor: import("../../../mol-data/db").Column.Schema.Str;
    };
    struct_asym: {
        details: import("../../../mol-data/db").Column.Schema.Str;
        entity_id: import("../../../mol-data/db").Column.Schema.Str;
        id: import("../../../mol-data/db").Column.Schema.Str;
        pdbx_modified: import("../../../mol-data/db").Column.Schema.Str;
        pdbx_blank_PDB_chainid_flag: import("../../../mol-data/db").Column.Schema.Aliased<"N" | "Y">;
    };
    ihm_model_list: {
        model_id: import("../../../mol-data/db").Column.Schema.Int;
        model_name: import("../../../mol-data/db").Column.Schema.Str;
        assembly_id: import("../../../mol-data/db").Column.Schema.Int;
        protocol_id: import("../../../mol-data/db").Column.Schema.Int;
        representation_id: import("../../../mol-data/db").Column.Schema.Int;
    };
    ihm_model_group: {
        id: import("../../../mol-data/db").Column.Schema.Int;
        name: import("../../../mol-data/db").Column.Schema.Str;
        details: import("../../../mol-data/db").Column.Schema.Str;
    };
    ihm_model_group_link: {
        model_id: import("../../../mol-data/db").Column.Schema.Int;
        group_id: import("../../../mol-data/db").Column.Schema.Int;
    };
    entity: {
        details: import("../../../mol-data/db").Column.Schema.Str;
        formula_weight: import("../../../mol-data/db").Column.Schema.Float;
        id: import("../../../mol-data/db").Column.Schema.Str;
        src_method: import("../../../mol-data/db").Column.Schema.Aliased<"nat" | "man" | "syn">;
        type: import("../../../mol-data/db").Column.Schema.Aliased<"non-polymer" | "polymer" | "macrolide" | "water" | "branched">;
        pdbx_description: import("../../../mol-data/db").Column.Schema.List<string>;
        pdbx_number_of_molecules: import("../../../mol-data/db").Column.Schema.Int;
        pdbx_parent_entity_id: import("../../../mol-data/db").Column.Schema.Str;
        pdbx_mutation: import("../../../mol-data/db").Column.Schema.Str;
        pdbx_fragment: import("../../../mol-data/db").Column.Schema.Str;
        pdbx_ec: import("../../../mol-data/db").Column.Schema.List<string>;
    };
    entity_poly: {
        entity_id: import("../../../mol-data/db").Column.Schema.Str;
        nstd_linkage: import("../../../mol-data/db").Column.Schema.Aliased<"y" | "yes" | "no" | "n">;
        nstd_monomer: import("../../../mol-data/db").Column.Schema.Aliased<"y" | "yes" | "no" | "n">;
        type: import("../../../mol-data/db").Column.Schema.Aliased<"other" | "polypeptide(D)" | "polypeptide(L)" | "polydeoxyribonucleotide" | "polyribonucleotide" | "polydeoxyribonucleotide/polyribonucleotide hybrid" | "cyclic-pseudo-peptide" | "peptide nucleic acid">;
        pdbx_strand_id: import("../../../mol-data/db").Column.Schema.List<string>;
        pdbx_seq_one_letter_code: import("../../../mol-data/db").Column.Schema.Str;
        pdbx_seq_one_letter_code_can: import("../../../mol-data/db").Column.Schema.Str;
        pdbx_target_identifier: import("../../../mol-data/db").Column.Schema.Str;
    };
    entity_poly_seq: {
        entity_id: import("../../../mol-data/db").Column.Schema.Str;
        hetero: import("../../../mol-data/db").Column.Schema.Aliased<"y" | "yes" | "no" | "n">;
        mon_id: import("../../../mol-data/db").Column.Schema.Str;
        num: import("../../../mol-data/db").Column.Schema.Int;
    };
    pdbx_entity_branch: {
        entity_id: import("../../../mol-data/db").Column.Schema.Str;
        type: import("../../../mol-data/db").Column.Schema.Aliased<"oligosaccharide">;
    };
    chem_comp: {
        type: import("../../../mol-data/db").Column.Schema.Aliased<"other" | "d-peptide linking" | "l-peptide linking" | "d-peptide nh3 amino terminus" | "l-peptide nh3 amino terminus" | "d-peptide cooh carboxy terminus" | "l-peptide cooh carboxy terminus" | "dna linking" | "rna linking" | "l-rna linking" | "l-dna linking" | "dna oh 5 prime terminus" | "rna oh 5 prime terminus" | "dna oh 3 prime terminus" | "rna oh 3 prime terminus" | "d-saccharide, beta linking" | "d-saccharide, alpha linking" | "l-saccharide, beta linking" | "l-saccharide, alpha linking" | "l-saccharide" | "d-saccharide" | "saccharide" | "non-polymer" | "peptide linking" | "peptide-like" | "l-gamma-peptide, c-delta linking" | "d-gamma-peptide, c-delta linking" | "l-beta-peptide, c-gamma linking" | "d-beta-peptide, c-gamma linking" | "ion" | "lipid">;
        formula: import("../../../mol-data/db").Column.Schema.Str;
        formula_weight: import("../../../mol-data/db").Column.Schema.Float;
        id: import("../../../mol-data/db").Column.Schema.Str;
        mon_nstd_flag: import("../../../mol-data/db").Column.Schema.Aliased<"y" | "yes" | "no" | "n">;
        name: import("../../../mol-data/db").Column.Schema.Str;
        pdbx_synonyms: import("../../../mol-data/db").Column.Schema.List<string>;
    };
    pdbx_chem_comp_identifier: {
        comp_id: import("../../../mol-data/db").Column.Schema.Str;
        identifier: import("../../../mol-data/db").Column.Schema.Str;
        type: import("../../../mol-data/db").Column.Schema.Aliased<"COMMON NAME" | "SYSTEMATIC NAME" | "CAS REGISTRY NUMBER" | "PUBCHEM Identifier" | "MDL Identifier" | "SYNONYM" | "CONDENSED IUPAC CARB SYMBOL" | "IUPAC CARB SYMBOL" | "SNFG CARB SYMBOL" | "CONDENSED IUPAC CARBOHYDRATE SYMBOL" | "IUPAC CARBOHYDRATE SYMBOL" | "SNFG CARBOHYDRATE SYMBOL">;
        program: import("../../../mol-data/db").Column.Schema.Str;
        program_version: import("../../../mol-data/db").Column.Schema.Str;
    };
    atom_site: {
        auth_asym_id: import("../../../mol-data/db").Column.Schema.Str;
        auth_atom_id: import("../../../mol-data/db").Column.Schema.Str;
        auth_comp_id: import("../../../mol-data/db").Column.Schema.Str;
        auth_seq_id: import("../../../mol-data/db").Column.Schema.Int;
        B_iso_or_equiv: import("../../../mol-data/db").Column.Schema.Float;
        Cartn_x: import("../../../mol-data/db").Column.Schema.Coordinate;
        Cartn_y: import("../../../mol-data/db").Column.Schema.Coordinate;
        Cartn_z: import("../../../mol-data/db").Column.Schema.Coordinate;
        group_PDB: import("../../../mol-data/db").Column.Schema.Aliased<"ATOM" | "HETATM">;
        id: import("../../../mol-data/db").Column.Schema.Int;
        label_alt_id: import("../../../mol-data/db").Column.Schema.Str;
        label_asym_id: import("../../../mol-data/db").Column.Schema.Str;
        label_atom_id: import("../../../mol-data/db").Column.Schema.Str;
        label_comp_id: import("../../../mol-data/db").Column.Schema.Str;
        label_entity_id: import("../../../mol-data/db").Column.Schema.Str;
        label_seq_id: import("../../../mol-data/db").Column.Schema.Int;
        occupancy: import("../../../mol-data/db").Column.Schema.Float;
        type_symbol: import("../../../mol-data/db").Column.Schema.Str;
        pdbx_PDB_ins_code: import("../../../mol-data/db").Column.Schema.Str;
        pdbx_PDB_model_num: import("../../../mol-data/db").Column.Schema.Int;
        pdbx_formal_charge: import("../../../mol-data/db").Column.Schema.Int;
        pdbx_label_index: import("../../../mol-data/db").Column.Schema.Int;
        pdbx_sifts_xref_db_name: import("../../../mol-data/db").Column.Schema.Str;
        pdbx_sifts_xref_db_acc: import("../../../mol-data/db").Column.Schema.Str;
        pdbx_sifts_xref_db_num: import("../../../mol-data/db").Column.Schema.Str;
        pdbx_sifts_xref_db_res: import("../../../mol-data/db").Column.Schema.Str;
        ihm_model_id: import("../../../mol-data/db").Column.Schema.Int;
    };
    ihm_sphere_obj_site: {
        id: import("../../../mol-data/db").Column.Schema.Int;
        entity_id: import("../../../mol-data/db").Column.Schema.Str;
        seq_id_begin: import("../../../mol-data/db").Column.Schema.Int;
        seq_id_end: import("../../../mol-data/db").Column.Schema.Int;
        asym_id: import("../../../mol-data/db").Column.Schema.Str;
        Cartn_x: import("../../../mol-data/db").Column.Schema.Float;
        Cartn_y: import("../../../mol-data/db").Column.Schema.Float;
        Cartn_z: import("../../../mol-data/db").Column.Schema.Float;
        object_radius: import("../../../mol-data/db").Column.Schema.Float;
        rmsf: import("../../../mol-data/db").Column.Schema.Float;
        model_id: import("../../../mol-data/db").Column.Schema.Int;
    };
    ihm_gaussian_obj_site: {
        id: import("../../../mol-data/db").Column.Schema.Int;
        entity_id: import("../../../mol-data/db").Column.Schema.Str;
        seq_id_begin: import("../../../mol-data/db").Column.Schema.Int;
        seq_id_end: import("../../../mol-data/db").Column.Schema.Int;
        asym_id: import("../../../mol-data/db").Column.Schema.Str;
        mean_Cartn_x: import("../../../mol-data/db").Column.Schema.Float;
        mean_Cartn_y: import("../../../mol-data/db").Column.Schema.Float;
        mean_Cartn_z: import("../../../mol-data/db").Column.Schema.Float;
        weight: import("../../../mol-data/db").Column.Schema.Float;
        covariance_matrix: import("../../../mol-data/db").Column.Schema.Tensor;
        model_id: import("../../../mol-data/db").Column.Schema.Int;
    };
    pdbx_unobs_or_zero_occ_residues: {
        id: import("../../../mol-data/db").Column.Schema.Int;
        polymer_flag: import("../../../mol-data/db").Column.Schema.Aliased<"y" | "n">;
        occupancy_flag: import("../../../mol-data/db").Column.Schema.Aliased<"1" | "0">;
        PDB_model_num: import("../../../mol-data/db").Column.Schema.Int;
        auth_asym_id: import("../../../mol-data/db").Column.Schema.Str;
        auth_comp_id: import("../../../mol-data/db").Column.Schema.Str;
        auth_seq_id: import("../../../mol-data/db").Column.Schema.Int;
        PDB_ins_code: import("../../../mol-data/db").Column.Schema.Str;
        label_asym_id: import("../../../mol-data/db").Column.Schema.Str;
        label_comp_id: import("../../../mol-data/db").Column.Schema.Str;
        label_seq_id: import("../../../mol-data/db").Column.Schema.Int;
    };
    pdbx_molecule: {
        prd_id: import("../../../mol-data/db").Column.Schema.Str;
        instance_id: import("../../../mol-data/db").Column.Schema.Int;
        asym_id: import("../../../mol-data/db").Column.Schema.Str;
    };
};
export interface BasicData {
    entry: Entry;
    struct: Struct;
    struct_asym: StructAsym;
    ihm_model_list: IhmModelList;
    ihm_model_group: IhmModelGroup;
    ihm_model_group_link: IhmModelGroupLink;
    entity: Entity;
    entity_poly: EntityPoly;
    entity_poly_seq: EntityPolySeq;
    pdbx_entity_branch: EntityBranch;
    chem_comp: ChemComp;
    pdbx_chem_comp_identifier: ChemCompIdentifier;
    atom_site: AtomSite;
    ihm_sphere_obj_site: IhmSphereObjSite;
    ihm_gaussian_obj_site: IhmGaussianObjSite;
    pdbx_unobs_or_zero_occ_residues: UnobsOrZeroOccResidues;
    pdbx_molecule: Molecule;
}
export declare function createBasic(data: Partial<BasicData>, normalize?: boolean): BasicData;
