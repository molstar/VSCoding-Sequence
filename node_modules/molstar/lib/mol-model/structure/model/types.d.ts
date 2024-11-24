/**
 * Copyright (c) 2017-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { BitFlags } from '../../../mol-util/bit-flags';
import { mmCIF_Schema } from '../../../mol-io/reader/cif/schema/mmcif';
import { EntitySubtype, ChemicalComponent } from './properties/common';
import { mmCIF_chemComp_schema } from '../../../mol-io/reader/cif/schema/mmcif-extras';
export type ElementSymbol = string & {
    '@type': 'element-symbol';
};
export declare function ElementSymbol(s: string): ElementSymbol;
export declare function getElementFromAtomicNumber(n: number): ElementSymbol;
/** Entity types as defined in the mmCIF dictionary */
export declare enum EntityType {
    'unknown' = 0,
    'polymer' = 1,
    'non-polymer' = 2,
    'macrolide' = 3,
    'water' = 4,
    'branched' = 5
}
export declare const enum MoleculeType {
    /** The molecule type is not known */
    Unknown = 0,
    /** A known, but here not listed molecule type */
    Other = 1,
    /** Water molecule */
    Water = 2,
    /** Small ionic molecule */
    Ion = 3,
    /** Lipid molecule */
    Lipid = 4,
    /** Protein, e.g. component type included in `ProteinComponentTypeNames` */
    Protein = 5,
    /** RNA, e.g. component type included in `RNAComponentTypeNames` */
    RNA = 6,
    /** DNA, e.g. component type included in `DNAComponentTypeNames` */
    DNA = 7,
    /** PNA, peptide nucleic acid, comp id included in `PeptideBaseNames` */
    PNA = 8,
    /** Saccharide, e.g. component type included in `SaccharideComponentTypeNames` */
    Saccharide = 9
}
export declare const enum PolymerType {
    /** not applicable */
    NA = 0,
    Protein = 1,
    GammaProtein = 2,
    BetaProtein = 3,
    RNA = 4,
    DNA = 5,
    PNA = 6
}
export type AtomRole = 'trace' | 'directionFrom' | 'directionTo' | 'backboneStart' | 'backboneEnd' | 'coarseBackbone';
export declare const PolymerTypeAtomRoleId: {
    [k in PolymerType]: {
        [k in AtomRole]: Set<string>;
    };
};
export declare const ProteinBackboneAtoms: Set<string>;
export declare const NucleicBackboneAtoms: Set<string>;
type ChemCompType = mmCIF_chemComp_schema['type']['T'];
/** Chemical component type names for D-linked protein */
export declare const DProteinComponentTypeNames: Set<"other" | "d-peptide linking" | "l-peptide linking" | "d-peptide nh3 amino terminus" | "l-peptide nh3 amino terminus" | "d-peptide cooh carboxy terminus" | "l-peptide cooh carboxy terminus" | "dna linking" | "rna linking" | "l-rna linking" | "l-dna linking" | "dna oh 5 prime terminus" | "rna oh 5 prime terminus" | "dna oh 3 prime terminus" | "rna oh 3 prime terminus" | "d-saccharide, beta linking" | "d-saccharide, alpha linking" | "l-saccharide, beta linking" | "l-saccharide, alpha linking" | "l-saccharide" | "d-saccharide" | "saccharide" | "non-polymer" | "peptide linking" | "peptide-like" | "l-gamma-peptide, c-delta linking" | "d-gamma-peptide, c-delta linking" | "l-beta-peptide, c-gamma linking" | "d-beta-peptide, c-gamma linking" | "ion" | "lipid">;
/** Chemical component type names for L-linked protein */
export declare const LProteinComponentTypeNames: Set<"other" | "d-peptide linking" | "l-peptide linking" | "d-peptide nh3 amino terminus" | "l-peptide nh3 amino terminus" | "d-peptide cooh carboxy terminus" | "l-peptide cooh carboxy terminus" | "dna linking" | "rna linking" | "l-rna linking" | "l-dna linking" | "dna oh 5 prime terminus" | "rna oh 5 prime terminus" | "dna oh 3 prime terminus" | "rna oh 3 prime terminus" | "d-saccharide, beta linking" | "d-saccharide, alpha linking" | "l-saccharide, beta linking" | "l-saccharide, alpha linking" | "l-saccharide" | "d-saccharide" | "saccharide" | "non-polymer" | "peptide linking" | "peptide-like" | "l-gamma-peptide, c-delta linking" | "d-gamma-peptide, c-delta linking" | "l-beta-peptide, c-gamma linking" | "d-beta-peptide, c-gamma linking" | "ion" | "lipid">;
/** Chemical component type names for gamma protein, overlaps with D/L-linked */
export declare const GammaProteinComponentTypeNames: Set<"other" | "d-peptide linking" | "l-peptide linking" | "d-peptide nh3 amino terminus" | "l-peptide nh3 amino terminus" | "d-peptide cooh carboxy terminus" | "l-peptide cooh carboxy terminus" | "dna linking" | "rna linking" | "l-rna linking" | "l-dna linking" | "dna oh 5 prime terminus" | "rna oh 5 prime terminus" | "dna oh 3 prime terminus" | "rna oh 3 prime terminus" | "d-saccharide, beta linking" | "d-saccharide, alpha linking" | "l-saccharide, beta linking" | "l-saccharide, alpha linking" | "l-saccharide" | "d-saccharide" | "saccharide" | "non-polymer" | "peptide linking" | "peptide-like" | "l-gamma-peptide, c-delta linking" | "d-gamma-peptide, c-delta linking" | "l-beta-peptide, c-gamma linking" | "d-beta-peptide, c-gamma linking" | "ion" | "lipid">;
/** Chemical component type names for beta protein, overlaps with D/L-linked */
export declare const BetaProteinComponentTypeNames: Set<"other" | "d-peptide linking" | "l-peptide linking" | "d-peptide nh3 amino terminus" | "l-peptide nh3 amino terminus" | "d-peptide cooh carboxy terminus" | "l-peptide cooh carboxy terminus" | "dna linking" | "rna linking" | "l-rna linking" | "l-dna linking" | "dna oh 5 prime terminus" | "rna oh 5 prime terminus" | "dna oh 3 prime terminus" | "rna oh 3 prime terminus" | "d-saccharide, beta linking" | "d-saccharide, alpha linking" | "l-saccharide, beta linking" | "l-saccharide, alpha linking" | "l-saccharide" | "d-saccharide" | "saccharide" | "non-polymer" | "peptide linking" | "peptide-like" | "l-gamma-peptide, c-delta linking" | "d-gamma-peptide, c-delta linking" | "l-beta-peptide, c-gamma linking" | "d-beta-peptide, c-gamma linking" | "ion" | "lipid">;
/** Chemical component type names for protein termini, overlaps with D/L-linked */
export declare const ProteinTerminusComponentTypeNames: Set<"other" | "d-peptide linking" | "l-peptide linking" | "d-peptide nh3 amino terminus" | "l-peptide nh3 amino terminus" | "d-peptide cooh carboxy terminus" | "l-peptide cooh carboxy terminus" | "dna linking" | "rna linking" | "l-rna linking" | "l-dna linking" | "dna oh 5 prime terminus" | "rna oh 5 prime terminus" | "dna oh 3 prime terminus" | "rna oh 3 prime terminus" | "d-saccharide, beta linking" | "d-saccharide, alpha linking" | "l-saccharide, beta linking" | "l-saccharide, alpha linking" | "l-saccharide" | "d-saccharide" | "saccharide" | "non-polymer" | "peptide linking" | "peptide-like" | "l-gamma-peptide, c-delta linking" | "d-gamma-peptide, c-delta linking" | "l-beta-peptide, c-gamma linking" | "d-beta-peptide, c-gamma linking" | "ion" | "lipid">;
/** Chemical component type names for peptide-like protein */
export declare const OtherProteinComponentTypeNames: Set<"other" | "d-peptide linking" | "l-peptide linking" | "d-peptide nh3 amino terminus" | "l-peptide nh3 amino terminus" | "d-peptide cooh carboxy terminus" | "l-peptide cooh carboxy terminus" | "dna linking" | "rna linking" | "l-rna linking" | "l-dna linking" | "dna oh 5 prime terminus" | "rna oh 5 prime terminus" | "dna oh 3 prime terminus" | "rna oh 3 prime terminus" | "d-saccharide, beta linking" | "d-saccharide, alpha linking" | "l-saccharide, beta linking" | "l-saccharide, alpha linking" | "l-saccharide" | "d-saccharide" | "saccharide" | "non-polymer" | "peptide linking" | "peptide-like" | "l-gamma-peptide, c-delta linking" | "d-gamma-peptide, c-delta linking" | "l-beta-peptide, c-gamma linking" | "d-beta-peptide, c-gamma linking" | "ion" | "lipid">;
/** Chemical component type names for protein */
export declare const ProteinComponentTypeNames: Set<"other" | "d-peptide linking" | "l-peptide linking" | "d-peptide nh3 amino terminus" | "l-peptide nh3 amino terminus" | "d-peptide cooh carboxy terminus" | "l-peptide cooh carboxy terminus" | "dna linking" | "rna linking" | "l-rna linking" | "l-dna linking" | "dna oh 5 prime terminus" | "rna oh 5 prime terminus" | "dna oh 3 prime terminus" | "rna oh 3 prime terminus" | "d-saccharide, beta linking" | "d-saccharide, alpha linking" | "l-saccharide, beta linking" | "l-saccharide, alpha linking" | "l-saccharide" | "d-saccharide" | "saccharide" | "non-polymer" | "peptide linking" | "peptide-like" | "l-gamma-peptide, c-delta linking" | "d-gamma-peptide, c-delta linking" | "l-beta-peptide, c-gamma linking" | "d-beta-peptide, c-gamma linking" | "ion" | "lipid">;
/** Chemical component type names for DNA */
export declare const DNAComponentTypeNames: Set<"other" | "d-peptide linking" | "l-peptide linking" | "d-peptide nh3 amino terminus" | "l-peptide nh3 amino terminus" | "d-peptide cooh carboxy terminus" | "l-peptide cooh carboxy terminus" | "dna linking" | "rna linking" | "l-rna linking" | "l-dna linking" | "dna oh 5 prime terminus" | "rna oh 5 prime terminus" | "dna oh 3 prime terminus" | "rna oh 3 prime terminus" | "d-saccharide, beta linking" | "d-saccharide, alpha linking" | "l-saccharide, beta linking" | "l-saccharide, alpha linking" | "l-saccharide" | "d-saccharide" | "saccharide" | "non-polymer" | "peptide linking" | "peptide-like" | "l-gamma-peptide, c-delta linking" | "d-gamma-peptide, c-delta linking" | "l-beta-peptide, c-gamma linking" | "d-beta-peptide, c-gamma linking" | "ion" | "lipid">;
/** Chemical component type names for RNA */
export declare const RNAComponentTypeNames: Set<"other" | "d-peptide linking" | "l-peptide linking" | "d-peptide nh3 amino terminus" | "l-peptide nh3 amino terminus" | "d-peptide cooh carboxy terminus" | "l-peptide cooh carboxy terminus" | "dna linking" | "rna linking" | "l-rna linking" | "l-dna linking" | "dna oh 5 prime terminus" | "rna oh 5 prime terminus" | "dna oh 3 prime terminus" | "rna oh 3 prime terminus" | "d-saccharide, beta linking" | "d-saccharide, alpha linking" | "l-saccharide, beta linking" | "l-saccharide, alpha linking" | "l-saccharide" | "d-saccharide" | "saccharide" | "non-polymer" | "peptide linking" | "peptide-like" | "l-gamma-peptide, c-delta linking" | "d-gamma-peptide, c-delta linking" | "l-beta-peptide, c-gamma linking" | "d-beta-peptide, c-gamma linking" | "ion" | "lipid">;
/** Chemical component type names for saccharide */
export declare const SaccharideComponentTypeNames: Set<string>;
/** Chemical component type names for other */
export declare const OtherComponentTypeNames: Set<"other" | "d-peptide linking" | "l-peptide linking" | "d-peptide nh3 amino terminus" | "l-peptide nh3 amino terminus" | "d-peptide cooh carboxy terminus" | "l-peptide cooh carboxy terminus" | "dna linking" | "rna linking" | "l-rna linking" | "l-dna linking" | "dna oh 5 prime terminus" | "rna oh 5 prime terminus" | "dna oh 3 prime terminus" | "rna oh 3 prime terminus" | "d-saccharide, beta linking" | "d-saccharide, alpha linking" | "l-saccharide, beta linking" | "l-saccharide, alpha linking" | "l-saccharide" | "d-saccharide" | "saccharide" | "non-polymer" | "peptide linking" | "peptide-like" | "l-gamma-peptide, c-delta linking" | "d-gamma-peptide, c-delta linking" | "l-beta-peptide, c-gamma linking" | "d-beta-peptide, c-gamma linking" | "ion" | "lipid">;
/** Chemical component type names for ion (extension to mmcif) */
export declare const IonComponentTypeNames: Set<"other" | "d-peptide linking" | "l-peptide linking" | "d-peptide nh3 amino terminus" | "l-peptide nh3 amino terminus" | "d-peptide cooh carboxy terminus" | "l-peptide cooh carboxy terminus" | "dna linking" | "rna linking" | "l-rna linking" | "l-dna linking" | "dna oh 5 prime terminus" | "rna oh 5 prime terminus" | "dna oh 3 prime terminus" | "rna oh 3 prime terminus" | "d-saccharide, beta linking" | "d-saccharide, alpha linking" | "l-saccharide, beta linking" | "l-saccharide, alpha linking" | "l-saccharide" | "d-saccharide" | "saccharide" | "non-polymer" | "peptide linking" | "peptide-like" | "l-gamma-peptide, c-delta linking" | "d-gamma-peptide, c-delta linking" | "l-beta-peptide, c-gamma linking" | "d-beta-peptide, c-gamma linking" | "ion" | "lipid">;
/** Chemical component type names for lipid (extension to mmcif) */
export declare const LipidComponentTypeNames: Set<"other" | "d-peptide linking" | "l-peptide linking" | "d-peptide nh3 amino terminus" | "l-peptide nh3 amino terminus" | "d-peptide cooh carboxy terminus" | "l-peptide cooh carboxy terminus" | "dna linking" | "rna linking" | "l-rna linking" | "l-dna linking" | "dna oh 5 prime terminus" | "rna oh 5 prime terminus" | "dna oh 3 prime terminus" | "rna oh 3 prime terminus" | "d-saccharide, beta linking" | "d-saccharide, alpha linking" | "l-saccharide, beta linking" | "l-saccharide, alpha linking" | "l-saccharide" | "d-saccharide" | "saccharide" | "non-polymer" | "peptide linking" | "peptide-like" | "l-gamma-peptide, c-delta linking" | "d-gamma-peptide, c-delta linking" | "l-beta-peptide, c-gamma linking" | "d-beta-peptide, c-gamma linking" | "ion" | "lipid">;
/** Common names for water molecules */
export declare const WaterNames: Set<string>;
export declare const AminoAcidNamesL: Set<string>;
export declare const AminoAcidNamesD: Set<string>;
export declare const AminoAcidNames: Set<string>;
export declare const CommonProteinCaps: Set<string>;
export declare const RnaBaseNames: Set<string>;
export declare const DnaBaseNames: Set<string>;
export declare const PeptideBaseNames: Set<string>;
export declare const PurineBaseNames: Set<string>;
export declare const PyrimidineBaseNames: Set<string>;
export declare const BaseNames: Set<string>;
export declare const isPurineBase: (compId: string) => boolean;
export declare const isPyrimidineBase: (compId: string) => boolean;
export declare const PolymerNames: Set<string>;
/** get the molecule type from component type and id */
export declare function getMoleculeType(compType: ChemCompType, compId: string): MoleculeType;
export declare function getPolymerType(compType: ChemCompType, molType: MoleculeType): PolymerType;
export declare function getComponentType(compId: string): ChemCompType;
export declare function getDefaultChemicalComponent(compId: string): ChemicalComponent;
export declare function getEntityType(compId: string): mmCIF_Schema['entity']['type']['T'];
export declare function getEntitySubtype(compId: string, compType: ChemCompType): EntitySubtype;
export declare function isPolymer(moleculeType: MoleculeType): moleculeType is MoleculeType.Protein | MoleculeType.RNA | MoleculeType.DNA | MoleculeType.PNA;
export declare function isNucleic(moleculeType: MoleculeType): moleculeType is MoleculeType.RNA | MoleculeType.DNA | MoleculeType.PNA;
export declare function isProtein(moleculeType: MoleculeType): moleculeType is MoleculeType.Protein;
export type SecondaryStructureType = BitFlags<SecondaryStructureType.Flag>;
export declare namespace SecondaryStructureType {
    const is: (ss: SecondaryStructureType, f: Flag) => boolean;
    const create: (fs: Flag) => SecondaryStructureType;
    const enum Flag {
        None = 0,
        DoubleHelix = 1,
        Helix = 2,
        Beta = 4,
        Bend = 8,
        Turn = 16,
        LeftHanded = 32,// helix
        RightHanded = 64,
        ClassicTurn = 128,// turn
        InverseTurn = 256,
        HelixOther = 512,// protein
        Helix27 = 1024,
        Helix3Ten = 2048,
        HelixAlpha = 4096,
        HelixGamma = 8192,
        HelixOmega = 16384,
        HelixPi = 32768,
        HelixPolyproline = 65536,
        DoubleHelixOther = 131072,// nucleic
        DoubleHelixZ = 262144,
        DoubleHelixA = 524288,
        DoubleHelixB = 1048576,
        BetaOther = 2097152,// protein
        BetaStrand = 4194304,// single strand
        BetaSheet = 8388608,// multiple hydrogen bonded strands
        BetaBarell = 16777216,// closed series of sheets
        TurnOther = 33554432,// protein
        Turn1 = 67108864,
        Turn2 = 134217728,
        Turn3 = 268435456,
        NA = 536870912
    }
    const SecondaryStructureMmcif: {
        [value in mmCIF_Schema['struct_conf']['conf_type_id']['T']]: number;
    };
    const SecondaryStructurePdb: {
        [value: string]: number;
    };
    const SecondaryStructureStride: {
        [value: string]: number;
    };
    const SecondaryStructureDssp: {
        [value: string]: number;
    };
}
/** Maximum accessible surface area observed for amino acids. Taken from: http://dx.doi.org/10.1371/journal.pone.0080635 */
export declare const MaxAsa: {
    ALA: number;
    ARG: number;
    ASN: number;
    ASP: number;
    CYS: number;
    GLU: number;
    GLN: number;
    GLY: number;
    HIS: number;
    ILE: number;
    LEU: number;
    LYS: number;
    MET: number;
    PHE: number;
    PRO: number;
    SER: number;
    THR: number;
    TRP: number;
    TYR: number;
    VAL: number;
    HSD: number;
    HSE: number;
    HSP: number;
    HID: number;
    HIE: number;
    HIP: number;
    ASH: number;
    GLH: number;
};
export declare const DefaultMaxAsa = 121;
export type BondType = BitFlags<BondType.Flag>;
export declare namespace BondType {
    const is: (b: BondType, f: Flag) => boolean;
    const enum Flag {
        None = 0,
        Covalent = 1,
        MetallicCoordination = 2,
        HydrogenBond = 4,
        Disulfide = 8,
        Aromatic = 16,
        Computed = 32
    }
    function create(flags: Flag): BondType;
    function isCovalent(flags: BondType.Flag): boolean;
    function isAll(flags: BondType.Flag): boolean;
    const Names: {
        covalent: Flag;
        'metal-coordination': Flag;
        'hydrogen-bond': Flag;
        disulfide: Flag;
        aromatic: Flag;
        computed: Flag;
    };
    type Names = keyof typeof Names;
    function isName(name: string): name is Names;
    function fromName(name: Names): Flag;
    function fromNames(names: Names[]): Flag;
}
/**
 * "Experimentally determined hydrophobicity scale for proteins at membrane interfaces"
 * by Wimely and White (doi:10.1038/nsb1096-842)
 * http://blanco.biomol.uci.edu/Whole_residue_HFscales.txt
 * https://www.nature.com/articles/nsb1096-842
 */
export declare const ResidueHydrophobicity: {
    ALA: number[];
    ARG: number[];
    ASN: number[];
    ASP: number[];
    ASH: number[];
    CYS: number[];
    GLN: number[];
    GLU: number[];
    GLH: number[];
    GLY: number[];
    HIS: number[];
    ILE: number[];
    LEU: number[];
    LYS: number[];
    MET: number[];
    PHE: number[];
    PRO: number[];
    SER: number[];
    THR: number[];
    TRP: number[];
    TYR: number[];
    VAL: number[];
    HSD: number[];
    HSE: number[];
    HSP: number[];
    HID: number[];
    HIE: number[];
    HIP: number[];
};
export declare const DefaultResidueHydrophobicity: number[];
export {};
