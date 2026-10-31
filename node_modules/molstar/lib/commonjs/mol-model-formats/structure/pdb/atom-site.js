"use strict";
/**
     * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabelAsymIdHelper = void 0;
exports.getAtomSiteTemplate = getAtomSiteTemplate;
exports.getAtomSite = getAtomSite;
exports.addAtom = addAtom;
const cif_1 = require("../../../mol-io/reader/cif");
const tokenizer_1 = require("../../../mol-io/reader/common/text/tokenizer");
const util_1 = require("../util");
const db_1 = require("../../../mol-data/db");
const token_1 = require("../../../mol-io/reader/common/text/column/token");
function getAtomSiteTemplate(data, count) {
    const str = () => [];
    const ts = () => tokenizer_1.TokenBuilder.create(data, 2 * count);
    return {
        index: 0,
        group_PDB: ts(),
        id: str(),
        auth_atom_id: ts(),
        label_alt_id: ts(),
        auth_comp_id: ts(),
        auth_asym_id: ts(),
        auth_seq_id: ts(),
        pdbx_PDB_ins_code: ts(),
        Cartn_x: ts(),
        Cartn_y: ts(),
        Cartn_z: ts(),
        occupancy: ts(),
        B_iso_or_equiv: ts(),
        type_symbol: ts(),
        pdbx_PDB_model_num: str(),
        label_entity_id: str(),
        partial_charge: ts(),
    };
}
class LabelAsymIdHelper {
    constructor(asymIds, modelNums, terIndices, hasAssemblies) {
        this.asymIds = asymIds;
        this.modelNums = modelNums;
        this.terIndices = terIndices;
        this.hasAssemblies = hasAssemblies;
        this.asymIdCounts = new Map();
        this.currModelNum = undefined;
        this.currAsymId = '';
        this.currLabelAsymId = '';
    }
    clear() {
        this.asymIdCounts.clear();
        this.currModelNum = undefined;
    }
    get(i) {
        const asymId = this.asymIds.value(i);
        if (this.hasAssemblies)
            return asymId;
        const modelNum = this.modelNums[i];
        if (modelNum !== this.currModelNum) {
            this.asymIdCounts.clear();
            this.currModelNum = modelNum;
            this.currLabelAsymId = asymId;
        }
        else if (this.currAsymId !== asymId) {
            this.currAsymId = asymId;
            this.currLabelAsymId = asymId;
        }
        if (this.asymIdCounts.has(asymId)) {
            // only change the chains name if there are TER records
            // otherwise assume repeated chain name use is from interleaved chains
            // also don't change the chains name if there are assemblies
            // as those require the original chain name
            if (this.terIndices.has(i)) {
                const asymIdCount = this.asymIdCounts.get(asymId) + 1;
                this.asymIdCounts.set(asymId, asymIdCount);
                this.currLabelAsymId = `${asymId}_${asymIdCount}`;
            }
        }
        else {
            this.asymIdCounts.set(asymId, 0);
        }
        return this.currLabelAsymId;
    }
}
exports.LabelAsymIdHelper = LabelAsymIdHelper;
function getAtomSite(sites, labelAsymIdHelper, options) {
    labelAsymIdHelper.clear();
    const pdbx_PDB_model_num = cif_1.CifField.ofStrings(sites.pdbx_PDB_model_num);
    const auth_asym_id = cif_1.CifField.ofTokens(sites.auth_asym_id);
    const auth_seq_id = cif_1.CifField.ofTokens(sites.auth_seq_id);
    const pdbx_PDB_ins_code = cif_1.CifField.ofTokens(sites.pdbx_PDB_ins_code);
    const auth_atom_id = cif_1.CifField.ofTokens(sites.auth_atom_id);
    const auth_comp_id = cif_1.CifField.ofTokens(sites.auth_comp_id);
    const id = cif_1.CifField.ofStrings(sites.id);
    //
    let currModelNum = pdbx_PDB_model_num.str(0);
    let currAsymId = auth_asym_id.str(0);
    let currSeqId = auth_seq_id.int(0);
    let currInsCode = pdbx_PDB_ins_code.str(0);
    let currLabelSeqId = currSeqId;
    const asymIdCounts = new Map();
    const atomIdCounts = new Map();
    const labelAsymIds = [];
    const labelAtomIds = [];
    const labelSeqIds = [];
    // serial label_seq_id if there are ins codes
    let hasInsCode = false;
    for (let i = 0, il = id.rowCount; i < il; ++i) {
        if (pdbx_PDB_ins_code.str(i) !== '') {
            hasInsCode = true;
            break;
        }
    }
    // ensure unique asym ids per model and unique atom ids per seq id
    for (let i = 0, il = id.rowCount; i < il; ++i) {
        const modelNum = pdbx_PDB_model_num.str(i);
        const asymId = auth_asym_id.str(i);
        const seqId = auth_seq_id.int(i);
        const insCode = pdbx_PDB_ins_code.str(i);
        let atomId = auth_atom_id.str(i);
        if (modelNum !== currModelNum) {
            asymIdCounts.clear();
            atomIdCounts.clear();
            currModelNum = modelNum;
            currAsymId = asymId;
            currSeqId = seqId;
            currInsCode = insCode;
            currLabelSeqId = seqId;
        }
        else if (currAsymId !== asymId) {
            atomIdCounts.clear();
            currAsymId = asymId;
            currSeqId = seqId;
            currInsCode = insCode;
            currLabelSeqId = seqId;
        }
        else if (currSeqId !== seqId) {
            atomIdCounts.clear();
            if (currSeqId === currLabelSeqId) {
                currLabelSeqId = seqId;
            }
            else {
                currLabelSeqId += 1;
            }
            currSeqId = seqId;
            currInsCode = insCode;
        }
        else if (currInsCode !== insCode) {
            atomIdCounts.clear();
            currInsCode = insCode;
            currLabelSeqId += 1;
        }
        labelAsymIds[i] = labelAsymIdHelper.get(i);
        if (atomIdCounts.has(atomId)) {
            const atomIdCount = atomIdCounts.get(atomId) + 1;
            atomIdCounts.set(atomId, atomIdCount);
            atomId = `${atomId}_${atomIdCount}`;
        }
        else {
            atomIdCounts.set(atomId, 0);
        }
        labelAtomIds[i] = atomId;
        if (hasInsCode) {
            labelSeqIds[i] = currLabelSeqId;
        }
    }
    const labelAsymId = db_1.Column.ofStringArray(labelAsymIds);
    const labelAtomId = db_1.Column.ofStringArray(labelAtomIds);
    const label_seq_id = hasInsCode
        ? cif_1.CifField.ofColumn(db_1.Column.ofIntArray(labelSeqIds))
        : cif_1.CifField.ofUndefined(sites.index, db_1.Column.Schema.int);
    //
    return {
        auth_asym_id,
        auth_atom_id,
        auth_comp_id,
        auth_seq_id,
        B_iso_or_equiv: cif_1.CifField.ofTokens(sites.B_iso_or_equiv),
        Cartn_x: cif_1.CifField.ofTokens(sites.Cartn_x),
        Cartn_y: cif_1.CifField.ofTokens(sites.Cartn_y),
        Cartn_z: cif_1.CifField.ofTokens(sites.Cartn_z),
        group_PDB: cif_1.CifField.ofTokens(sites.group_PDB),
        id,
        label_alt_id: cif_1.CifField.ofTokens(sites.label_alt_id),
        label_asym_id: cif_1.CifField.ofColumn(labelAsymId),
        label_atom_id: cif_1.CifField.ofColumn(labelAtomId),
        label_comp_id: auth_comp_id,
        label_seq_id,
        label_entity_id: cif_1.CifField.ofStrings(sites.label_entity_id),
        occupancy: (0, token_1.areTokensEmpty)(sites.occupancy) ? cif_1.CifField.ofUndefined(sites.index, db_1.Column.Schema.float) : cif_1.CifField.ofTokens(sites.occupancy),
        type_symbol: cif_1.CifField.ofTokens(sites.type_symbol),
        pdbx_PDB_ins_code: cif_1.CifField.ofTokens(sites.pdbx_PDB_ins_code),
        pdbx_PDB_model_num,
        partial_charge: cif_1.CifField.ofTokens(sites.partial_charge)
    };
}
function addAtom(sites, model, data, s, e, isPdbqt) {
    const { data: str } = data;
    const length = e - s;
    // TODO: filter invalid atoms
    // COLUMNS        DATA TYPE       CONTENTS
    // --------------------------------------------------------------------------------
    // 1 -  6        Record name     "ATOM  "
    tokenizer_1.TokenBuilder.addToken(sites.group_PDB, tokenizer_1.Tokenizer.trim(data, s, s + 6));
    // 7 - 11        Integer         Atom serial number.
    // TODO: support HEX
    tokenizer_1.Tokenizer.trim(data, s + 6, s + 11);
    sites.id[sites.index] = data.data.substring(data.tokenStart, data.tokenEnd);
    // 13 - 16        Atom            Atom name.
    tokenizer_1.TokenBuilder.addToken(sites.auth_atom_id, tokenizer_1.Tokenizer.trim(data, s + 12, s + 16));
    // 17             Character       Alternate location indicator.
    if (str.charCodeAt(s + 16) === 32) { // ' '
        tokenizer_1.TokenBuilder.add(sites.label_alt_id, 0, 0);
    }
    else {
        tokenizer_1.TokenBuilder.add(sites.label_alt_id, s + 16, s + 17);
    }
    // 18 - 20        Residue name    Residue name.
    tokenizer_1.TokenBuilder.addToken(sites.auth_comp_id, tokenizer_1.Tokenizer.trim(data, s + 17, s + 20));
    // 22             Character       Chain identifier.
    tokenizer_1.TokenBuilder.add(sites.auth_asym_id, s + 21, s + 22);
    // 23 - 26        Integer         Residue sequence number.
    // TODO: support HEX
    tokenizer_1.TokenBuilder.addToken(sites.auth_seq_id, tokenizer_1.Tokenizer.trim(data, s + 22, s + 26));
    // 27             AChar           Code for insertion of residues.
    if (str.charCodeAt(s + 26) === 32) { // ' '
        tokenizer_1.TokenBuilder.add(sites.pdbx_PDB_ins_code, 0, 0);
    }
    else {
        tokenizer_1.TokenBuilder.add(sites.pdbx_PDB_ins_code, s + 26, s + 27);
    }
    // 31 - 38        Real(8.3)       Orthogonal coordinates for X in Angstroms.
    tokenizer_1.TokenBuilder.addToken(sites.Cartn_x, tokenizer_1.Tokenizer.trim(data, s + 30, s + 38));
    // 39 - 46        Real(8.3)       Orthogonal coordinates for Y in Angstroms.
    tokenizer_1.TokenBuilder.addToken(sites.Cartn_y, tokenizer_1.Tokenizer.trim(data, s + 38, s + 46));
    // 47 - 54        Real(8.3)       Orthogonal coordinates for Z in Angstroms.
    tokenizer_1.TokenBuilder.addToken(sites.Cartn_z, tokenizer_1.Tokenizer.trim(data, s + 46, s + 54));
    // 55 - 60        Real(6.2)       Occupancy.
    tokenizer_1.TokenBuilder.addToken(sites.occupancy, tokenizer_1.Tokenizer.trim(data, s + 54, s + 60));
    // 61 - 66        Real(6.2)       Temperature factor (Default = 0.0).
    if (length >= 66) {
        tokenizer_1.TokenBuilder.addToken(sites.B_iso_or_equiv, tokenizer_1.Tokenizer.trim(data, s + 60, s + 66));
    }
    else {
        tokenizer_1.TokenBuilder.add(sites.B_iso_or_equiv, 0, 0);
    }
    // 73 - 76        LString(4)      Segment identifier, left-justified.
    if (isPdbqt) {
        tokenizer_1.TokenBuilder.addToken(sites.partial_charge, tokenizer_1.Tokenizer.trim(data, s + 70, s + 76));
    }
    else {
        // ignored
    }
    // 77 - 78        LString(2)      Element symbol, right-justified.
    if (length >= 78 && !isPdbqt) {
        tokenizer_1.Tokenizer.trim(data, s + 76, s + 78);
        if (data.tokenStart < data.tokenEnd) {
            tokenizer_1.TokenBuilder.addToken(sites.type_symbol, data);
        }
        else {
            (0, util_1.guessElementSymbolTokens)(sites.type_symbol, str, s + 12, s + 16);
        }
    }
    else {
        (0, util_1.guessElementSymbolTokens)(sites.type_symbol, str, s + 12, s + 16);
    }
    // 79 - 80        LString(2)    charge       Charge  on the atom.
    // TODO
    sites.pdbx_PDB_model_num[sites.index] = model;
    sites.index++;
}
