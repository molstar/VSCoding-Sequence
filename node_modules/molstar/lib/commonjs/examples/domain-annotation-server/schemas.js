"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.categories = exports.GO = exports.SCOP = exports.UniProt = exports.EC = exports.CATH = exports.InterPro = exports.Pfam = exports.mapping = exports.Base = exports.Sources = void 0;
const db_1 = require("../../mol-data/db");
var Type = db_1.Column.Schema;
exports.Sources = {
    id: Type.str,
    count: Type.int
};
exports.Base = {
    id: Type.str,
    identifier: Type.str,
    mapping_group_id: Type.int
};
exports.mapping = {
    id: Type.int,
    group_id: Type.int,
    label_entity_id: Type.str,
    label_asym_id: Type.str,
    auth_asym_id: Type.str,
    beg_label_seq_id: Type.int,
    beg_auth_seq_id: Type.int,
    pdbx_beg_PDB_ins_code: Type.str,
    end_label_seq_id: Type.int,
    end_auth_seq_id: Type.int,
    pdbx_end_PDB_ins_code: Type.str
};
exports.Pfam = {
    description: Type.str
};
exports.InterPro = {
    name: Type.str
};
exports.CATH = {
    name: Type.str,
    homology: Type.str,
    architecture: Type.str,
    identifier: Type.str,
    class: Type.str,
    topology: Type.str,
};
exports.EC = {
    accepted_name: Type.str,
    reaction: Type.str,
    systematic_name: Type.str
};
exports.UniProt = {
    name: Type.str
};
exports.SCOP = {
    sccs: Type.str,
    description: Type.str
};
exports.GO = {
    category: Type.str,
    definition: Type.str,
    name: Type.str
};
exports.categories = {
    Pfam: exports.Pfam,
    InterPro: exports.InterPro,
    CATH: exports.CATH,
    EC: exports.EC,
    UniProt: exports.UniProt,
    SCOP: exports.SCOP,
    GO: exports.GO
};
