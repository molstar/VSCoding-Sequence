/**
 * Copyright (c) 2017-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Column, Table } from '../../../../../mol-data/db';
import { Segmentation } from '../../../../../mol-data/int';
import { ElementSymbol, MoleculeType, PolymerType } from '../../types';
import { ChainIndex, EntityIndex, ResidueIndex, ElementIndex } from '../../indexing';
import { SortedRanges } from '../../../../../mol-data/int/sorted-ranges';
export declare const AtomsSchema: {
    /**
     * The chemical element of this atom site.
     * For mmCIF files, this points to atom_type.symbol in the ATOM_TYPE category.
     */
    type_symbol: Column.Schema.Aliased<ElementSymbol>;
    /**
     * A component of the identifier for this atom site.
     * This is a standardized name for the atom within its residue.
     * For mmCIF files, this points to chem_comp_atom.atom_id in the CHEM_COMP_ATOM category.
     */
    label_atom_id: Column.Schema.Str;
    /**
     * An alternative identifier for label_atom_id that may be provided by an author
     * in order to match the identification used in the publication that describes the structure.
     */
    auth_atom_id: Column.Schema.Str;
    /**
     * A component of the identifier for this atom site.
     * Identifies an alternative conformation for this atom site.
     */
    label_alt_id: Column.Schema.Str;
    /**
     * A component of the identifier for this atom site.
     * For mmCIF files, this points to chem_comp.id in the CHEM_COMP category.
     */
    label_comp_id: Column.Schema.Str;
    /**
     * An alternative identifier for atom_site.label_comp_id that may be provided by an author
     * in order to match the identification used in the publication that describes the structure.
     */
    auth_comp_id: Column.Schema.Str;
    /**
     * The net integer charge assigned to this atom.
     * This is the formal charge assignment normally found in chemical diagrams.
     */
    pdbx_formal_charge: Column.Schema.Int;
};
export type AtomsSchema = typeof AtomsSchema;
export type Atoms = Table<AtomsSchema>;
export declare const ResiduesSchema: {
    /**
     * The group of atoms to which the atom site belongs. This data item is provided for
     * compatibility with the original Protein Data Bank format, and only for that purpose.
     */
    group_PDB: Column.Schema.Aliased<"ATOM" | "HETATM">;
    /**
     * For mmCIF files, this points to entity_poly_seq.num in the ENTITY_POLY_SEQ category.
     */
    label_seq_id: Column.Schema.Int;
    /**
     * An alternative identifier for atom_site.label_seq_id that may be provided by an author
     * in order to match the identification used in the publication that describes the structure.
     */
    auth_seq_id: Column.Schema.Int;
    /**
     * PDB insertion code.
     */
    pdbx_PDB_ins_code: Column.Schema.Str;
};
export type ResiduesSchema = typeof ResiduesSchema;
export type Residues = Table<ResiduesSchema>;
export declare const ChainsSchema: {
    /**
     * A component of the identifier for this atom site.
     * For mmCIF files, this points to struct_asym.id in the STRUCT_ASYM category.
     */
    label_asym_id: Column.Schema.Str;
    /**
     * An alternative identifier for atomsite.label_asym_id that may be provided by an author
     * in order to match the identification used in the publication that describes the structure.
     */
    auth_asym_id: Column.Schema.Str;
    /**
     * For mmCIF files, this points to _entity.id in the ENTITY category.
     */
    label_entity_id: Column.Schema.Str;
};
export type ChainsSchema = typeof ChainsSchema;
export type Chains = Table<ChainsSchema>;
export interface AtomicData {
    atoms: Atoms;
    /**
     * The index of this atom in the input data.
     * Required because of sorting of atoms.
     */
    atomSourceIndex: Column<number>;
    residues: Residues;
    chains: Chains;
}
export interface AtomicDerivedData {
    readonly atom: {
        readonly atomicNumber: ArrayLike<number>;
    };
    readonly residue: {
        readonly traceElementIndex: ArrayLike<ElementIndex | -1>;
        readonly directionFromElementIndex: ArrayLike<ElementIndex | -1>;
        readonly directionToElementIndex: ArrayLike<ElementIndex | -1>;
        readonly moleculeType: ArrayLike<MoleculeType>;
        readonly polymerType: ArrayLike<PolymerType>;
    };
}
export interface AtomicSegments {
    /** Maps residueIndex to a range of atoms [segments[rI], segments[rI + 1]) */
    residueAtomSegments: Segmentation<ElementIndex, ResidueIndex>;
    /**
     * Maps chainIndex to a range of atoms [segments[cI], segments[cI + 1]),
     *
     * residues of i-th chain are accessed like this:
     * const rI = residueAtomSegments.index, offsets = chainAtomSegments.offsets;
     * const start = rI[offsets[i]], const end = rI[offsets[i + 1] - 1] + 1;
     * for (let j = start; j < end; i++) { }
     */
    chainAtomSegments: Segmentation<ElementIndex, ChainIndex>;
}
export interface AtomicIndex {
    /** @returns index or -1 if not present. */
    getEntityFromChain(cI: ChainIndex): EntityIndex;
    /** @returns index or -1 if not present. */
    findEntity(label_asym_id: string): EntityIndex;
    /**
     * Find chain using label_ mmCIF properties
     * @returns index or -1 if not present.
     */
    findChainLabel(key: AtomicIndex.ChainLabelKey): ChainIndex;
    /**
     * Find chain using auth_ mmCIF properties
     * @returns index or -1 if not present.
     */
    findChainAuth(key: AtomicIndex.ChainAuthKey): ChainIndex;
    /**
     * Index of the 1st occurence of this residue.
     * auth_seq_id is used because label_seq_id is undefined for "ligands" in mmCIF.
     * @param key.pdbx_PDB_ins_code Empty string for undefined
     * @returns index or -1 if not present.
     */
    findResidue(key: AtomicIndex.ResidueKey): ResidueIndex;
    findResidue(label_entity_id: string, label_asym_id: string, auth_seq_id: number, pdbx_PDB_ins_code?: string): ResidueIndex;
    /**
     * Index of the 1st occurence of this residue using "all-label" address.
     * Doesn't work for "ligands" as they don't have a label seq id assigned.
     * @returns index or -1 if not present.
     */
    findResidueLabel(key: AtomicIndex.ResidueLabelKey): ResidueIndex;
    /**
     * Index of the 1st occurence of this residue.
     * @param key.pdbx_PDB_ins_code Empty string for undefined
     * @returns index or -1 if not present.
     */
    findResidueAuth(key: AtomicIndex.ResidueAuthKey): ResidueIndex;
    /**
     * Find the residue index where the spefied residue should be inserted to maintain the ordering (entity_id, asym_id, seq_id, ins_code).
     * Useful for determining ranges for sequence-level annotations.
     * @param key.pdbx_PDB_ins_code Use empty string for undefined
     */
    findResidueInsertion(key: AtomicIndex.ResidueLabelKey): ResidueIndex;
    /**
     * Find element index of an atom.
     * @param key
     * @returns index or -1 if the atom is not present.
     */
    findAtom(key: AtomicIndex.AtomKey): ElementIndex;
    /**
     * Find element index of an atom.
     * @param key
     * @returns index or -1 if the atom is not present.
     */
    findAtomAuth(key: AtomicIndex.AtomAuthKey): ElementIndex;
    /**
     * Find element index of an atom on a given residue.
     * @returns index or -1 if the atom is not present.
     */
    findAtomOnResidue(residueIndex: ResidueIndex, label_atom_id: string, label_alt_id?: string): ElementIndex;
    /**
     * Find element index of any given atom on a given residue.
     * @returns first found index or -1 if none of the given atoms are present.
     */
    findAtomsOnResidue(residueIndex: ResidueIndex, label_atom_ids: Set<string>): ElementIndex;
    /**
     * Find element index of an atom on a given residue.
     * @returns index or -1 if the atom is not present.
     */
    findElementOnResidue(residueIndex: ResidueIndex, type_symbol: ElementSymbol): ElementIndex;
}
export declare namespace AtomicIndex {
    interface ChainLabelKey {
        label_entity_id: string;
        label_asym_id: string;
    }
    interface ChainAuthKey {
        auth_asym_id: string;
        auth_seq_id: number;
    }
    interface ResidueKey {
        label_entity_id: string;
        label_asym_id: string;
        auth_seq_id: number;
        pdbx_PDB_ins_code?: string;
    }
    function EmptyResidueKey(): ResidueKey;
    interface ResidueAuthKey {
        auth_asym_id: string;
        auth_comp_id: string;
        auth_seq_id: number;
        pdbx_PDB_ins_code?: string;
    }
    interface ResidueLabelKey {
        label_entity_id: string;
        label_asym_id: string;
        label_seq_id: number;
        pdbx_PDB_ins_code?: string;
    }
    interface AtomKey extends ResidueKey {
        label_atom_id: string;
        label_alt_id?: string;
    }
    interface AtomAuthKey extends ResidueAuthKey {
        auth_atom_id: string;
        label_alt_id?: string;
    }
}
export interface AtomicRanges {
    polymerRanges: SortedRanges<ElementIndex>;
    gapRanges: SortedRanges<ElementIndex>;
    cyclicPolymerMap: Map<ResidueIndex, ResidueIndex>;
}
type _Hierarchy = AtomicData & AtomicSegments;
export interface AtomicHierarchy extends _Hierarchy {
    index: AtomicIndex;
    derived: AtomicDerivedData;
}
export declare namespace AtomicHierarchy {
    /** Start residue inclusive */
    function chainStartResidueIndex(segs: AtomicSegments, cI: ChainIndex): ResidueIndex;
    /** End residue exclusive */
    function chainEndResidueIndexExcl(segs: AtomicSegments, cI: ChainIndex): ResidueIndex;
    function chainResidueCount(segs: AtomicSegments, cI: ChainIndex): number;
    function residueFirstAtomIndex(hierarchy: AtomicHierarchy, rI: ResidueIndex): ElementIndex;
    function atomChainIndex(hierarchy: AtomicHierarchy, eI: ElementIndex): ChainIndex;
    function residueChainIndex(hierarchy: AtomicHierarchy, rI: ResidueIndex): ChainIndex;
}
export {};
