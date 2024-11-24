/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Column } from '../../mol-data/db';
import Type = Column.Schema;
export declare const Sources: {
    id: Type.Str;
    count: Type.Int;
};
export type Sources = typeof Sources;
export declare const Base: {
    id: Type.Str;
    identifier: Type.Str;
    mapping_group_id: Type.Int;
};
export type Base = typeof Base;
export declare const mapping: {
    id: Type.Int;
    group_id: Type.Int;
    label_entity_id: Type.Str;
    label_asym_id: Type.Str;
    auth_asym_id: Type.Str;
    beg_label_seq_id: Type.Int;
    beg_auth_seq_id: Type.Int;
    pdbx_beg_PDB_ins_code: Type.Str;
    end_label_seq_id: Type.Int;
    end_auth_seq_id: Type.Int;
    pdbx_end_PDB_ins_code: Type.Str;
};
export type mapping = typeof mapping;
export declare const Pfam: {
    description: Type.Str;
};
export type Pfam = typeof Pfam;
export declare const InterPro: {
    name: Type.Str;
};
export type InterPro = typeof InterPro;
export declare const CATH: {
    name: Type.Str;
    homology: Type.Str;
    architecture: Type.Str;
    identifier: Type.Str;
    class: Type.Str;
    topology: Type.Str;
};
export type CATH = typeof CATH;
export declare const EC: {
    accepted_name: Type.Str;
    reaction: Type.Str;
    systematic_name: Type.Str;
};
export type EC = typeof EC;
export declare const UniProt: {
    name: Type.Str;
};
export type UniProt = typeof UniProt;
export declare const SCOP: {
    sccs: Type.Str;
    description: Type.Str;
};
export type SCOP = typeof SCOP;
export declare const GO: {
    category: Type.Str;
    definition: Type.Str;
    name: Type.Str;
};
export type GO = typeof GO;
export declare const categories: {
    Pfam: {
        description: Type.Str;
    };
    InterPro: {
        name: Type.Str;
    };
    CATH: {
        name: Type.Str;
        homology: Type.Str;
        architecture: Type.Str;
        identifier: Type.Str;
        class: Type.Str;
        topology: Type.Str;
    };
    EC: {
        accepted_name: Type.Str;
        reaction: Type.Str;
        systematic_name: Type.Str;
    };
    UniProt: {
        name: Type.Str;
    };
    SCOP: {
        sccs: Type.Str;
        description: Type.Str;
    };
    GO: {
        category: Type.Str;
        definition: Type.Str;
        name: Type.Str;
    };
};
