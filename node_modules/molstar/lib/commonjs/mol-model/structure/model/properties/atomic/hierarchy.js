"use strict";
/**
 * Copyright (c) 2017-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtomicHierarchy = exports.AtomicIndex = exports.ChainsSchema = exports.ResiduesSchema = exports.AtomsSchema = void 0;
const db_1 = require("../../../../../mol-data/db");
const mmcif_1 = require("../../../../../mol-io/reader/cif/schema/mmcif");
exports.AtomsSchema = {
    /**
     * The chemical element of this atom site.
     * For mmCIF files, this points to atom_type.symbol in the ATOM_TYPE category.
     */
    type_symbol: db_1.Column.Schema.Aliased(mmcif_1.mmCIF_Schema.atom_site.type_symbol),
    /**
     * A component of the identifier for this atom site.
     * This is a standardized name for the atom within its residue.
     * For mmCIF files, this points to chem_comp_atom.atom_id in the CHEM_COMP_ATOM category.
     */
    label_atom_id: mmcif_1.mmCIF_Schema.atom_site.label_atom_id,
    /**
     * An alternative identifier for label_atom_id that may be provided by an author
     * in order to match the identification used in the publication that describes the structure.
     */
    auth_atom_id: mmcif_1.mmCIF_Schema.atom_site.auth_atom_id,
    /**
     * A component of the identifier for this atom site.
     * Identifies an alternative conformation for this atom site.
     */
    label_alt_id: mmcif_1.mmCIF_Schema.atom_site.label_alt_id,
    /**
     * A component of the identifier for this atom site.
     * For mmCIF files, this points to chem_comp.id in the CHEM_COMP category.
     */
    label_comp_id: mmcif_1.mmCIF_Schema.atom_site.label_comp_id,
    /**
     * An alternative identifier for atom_site.label_comp_id that may be provided by an author
     * in order to match the identification used in the publication that describes the structure.
     */
    auth_comp_id: mmcif_1.mmCIF_Schema.atom_site.auth_comp_id,
    /**
     * The net integer charge assigned to this atom.
     * This is the formal charge assignment normally found in chemical diagrams.
     */
    pdbx_formal_charge: mmcif_1.mmCIF_Schema.atom_site.pdbx_formal_charge,
    // id, occupancy and B_iso_or_equiv are part of conformation
};
exports.ResiduesSchema = {
    /**
     * The group of atoms to which the atom site belongs. This data item is provided for
     * compatibility with the original Protein Data Bank format, and only for that purpose.
     */
    group_PDB: mmcif_1.mmCIF_Schema.atom_site.group_PDB,
    /**
     * For mmCIF files, this points to entity_poly_seq.num in the ENTITY_POLY_SEQ category.
     */
    label_seq_id: mmcif_1.mmCIF_Schema.atom_site.label_seq_id,
    /**
     * An alternative identifier for atom_site.label_seq_id that may be provided by an author
     * in order to match the identification used in the publication that describes the structure.
     */
    auth_seq_id: mmcif_1.mmCIF_Schema.atom_site.auth_seq_id,
    /**
     * PDB insertion code.
     */
    pdbx_PDB_ins_code: mmcif_1.mmCIF_Schema.atom_site.pdbx_PDB_ins_code,
    // comp_id is part of atoms because of microheterogeneity
};
exports.ChainsSchema = {
    /**
     * A component of the identifier for this atom site.
     * For mmCIF files, this points to struct_asym.id in the STRUCT_ASYM category.
     */
    label_asym_id: mmcif_1.mmCIF_Schema.atom_site.label_asym_id,
    /**
     * An alternative identifier for atomsite.label_asym_id that may be provided by an author
     * in order to match the identification used in the publication that describes the structure.
     */
    auth_asym_id: mmcif_1.mmCIF_Schema.atom_site.auth_asym_id,
    /**
     * For mmCIF files, this points to _entity.id in the ENTITY category.
     */
    label_entity_id: mmcif_1.mmCIF_Schema.atom_site.label_entity_id
};
var AtomicIndex;
(function (AtomicIndex) {
    function EmptyResidueKey() { return { label_entity_id: '', label_asym_id: '', auth_seq_id: 0, pdbx_PDB_ins_code: void 0 }; }
    AtomicIndex.EmptyResidueKey = EmptyResidueKey;
})(AtomicIndex || (exports.AtomicIndex = AtomicIndex = {}));
var AtomicHierarchy;
(function (AtomicHierarchy) {
    /** Start residue inclusive */
    function chainStartResidueIndex(segs, cI) {
        return segs.residueAtomSegments.index[segs.chainAtomSegments.offsets[cI]];
    }
    AtomicHierarchy.chainStartResidueIndex = chainStartResidueIndex;
    /** End residue exclusive */
    function chainEndResidueIndexExcl(segs, cI) {
        return segs.residueAtomSegments.index[segs.chainAtomSegments.offsets[cI + 1] - 1] + 1;
    }
    AtomicHierarchy.chainEndResidueIndexExcl = chainEndResidueIndexExcl;
    function chainResidueCount(segs, cI) {
        return chainEndResidueIndexExcl(segs, cI) - chainStartResidueIndex(segs, cI);
    }
    AtomicHierarchy.chainResidueCount = chainResidueCount;
    function residueFirstAtomIndex(hierarchy, rI) {
        return hierarchy.residueAtomSegments.offsets[rI];
    }
    AtomicHierarchy.residueFirstAtomIndex = residueFirstAtomIndex;
    function atomChainIndex(hierarchy, eI) {
        return hierarchy.chainAtomSegments.index[eI];
    }
    AtomicHierarchy.atomChainIndex = atomChainIndex;
    function residueChainIndex(hierarchy, rI) {
        return hierarchy.chainAtomSegments.index[hierarchy.residueAtomSegments.offsets[rI]];
    }
    AtomicHierarchy.residueChainIndex = residueChainIndex;
})(AtomicHierarchy || (exports.AtomicHierarchy = AtomicHierarchy = {}));
