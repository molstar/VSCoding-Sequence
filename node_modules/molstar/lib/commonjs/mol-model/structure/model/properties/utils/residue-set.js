"use strict";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResidueSet = void 0;
const properties_1 = require("../../../structure/properties");
class ResidueSet {
    add(entry) {
        let root = this.index.get(entry.label_asym_id);
        if (!root) {
            root = new Map();
            this.index.set(entry.label_asym_id, root);
        }
        let entries = root.get(entry.label_seq_id);
        if (!entries) {
            entries = [];
            root.set(entry.label_seq_id, entries);
        }
        const exists = this._find(entry, entries);
        if (!exists) {
            entries.push(entry);
            return true;
        }
        return false;
    }
    hasLabelAsymId(asym_id) {
        return this.index.has(asym_id);
    }
    has(loc) {
        var _a, _b;
        const asym_id = _asym_id(loc);
        if (!this.index.has(asym_id))
            return;
        const root = this.index.get(asym_id);
        const seq_id = _seq_id(loc);
        if (!root.has(seq_id))
            return;
        const entries = root.get(seq_id);
        const comp_id = _comp_id(loc);
        const alt_id = _alt_id(loc);
        const ins_code = _ins_code(loc);
        const op_name = (_a = _op_name(loc)) !== null && _a !== void 0 ? _a : '1_555';
        for (const e of entries) {
            if (e.label_comp_id !== comp_id || e.label_alt_id !== alt_id || e.ins_code !== ins_code)
                continue;
            if (this.checkOperator && ((_b = e.operator_name) !== null && _b !== void 0 ? _b : '1_555') !== op_name)
                continue;
            return e;
        }
    }
    static getLabel(entry, checkOperator = false) {
        var _a;
        return `${entry.label_asym_id} ${entry.label_comp_id} ${entry.label_seq_id}:${entry.ins_code}:${entry.label_alt_id}${checkOperator ? ' ' + ((_a = entry.operator_name) !== null && _a !== void 0 ? _a : '1_555') : ''}`;
    }
    static getEntryFromLocation(loc) {
        var _a;
        return {
            label_asym_id: _asym_id(loc),
            label_comp_id: _comp_id(loc),
            label_seq_id: _seq_id(loc),
            label_alt_id: _alt_id(loc),
            ins_code: _ins_code(loc),
            operator_name: (_a = _op_name(loc)) !== null && _a !== void 0 ? _a : '1_555'
        };
    }
    _find(entry, xs) {
        var _a, _b;
        for (const e of xs) {
            if (e.label_comp_id !== entry.label_comp_id || e.label_alt_id !== entry.label_alt_id || e.ins_code !== entry.ins_code)
                continue;
            if (this.checkOperator && ((_a = e.operator_name) !== null && _a !== void 0 ? _a : '1_555') !== ((_b = entry.operator_name) !== null && _b !== void 0 ? _b : '1_555'))
                continue;
            return true;
        }
        return false;
    }
    constructor(options) {
        var _a;
        this.index = new Map();
        this.checkOperator = false;
        this.checkOperator = (_a = options === null || options === void 0 ? void 0 : options.checkOperator) !== null && _a !== void 0 ? _a : false;
    }
}
exports.ResidueSet = ResidueSet;
const _asym_id = properties_1.StructureProperties.chain.label_asym_id;
const _seq_id = properties_1.StructureProperties.residue.label_seq_id;
const _comp_id = properties_1.StructureProperties.atom.label_comp_id;
const _alt_id = properties_1.StructureProperties.atom.label_alt_id;
const _ins_code = properties_1.StructureProperties.residue.pdbx_PDB_ins_code;
const _op_name = properties_1.StructureProperties.unit.operator_name;
