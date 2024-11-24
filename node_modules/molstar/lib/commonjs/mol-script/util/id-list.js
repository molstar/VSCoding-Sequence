"use strict";
/**
 * Copyright (c) 2021-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Ludovic Autin <ludovic.autin@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileIdListSelection = compileIdListSelection;
const builder_1 = require("../language/builder");
const base_1 = require("../runtime/query/base");
const generic_1 = require("../../mol-data/generic");
function residueEntriesToQuery(xs, kind) {
    var _a;
    const groups = [];
    const asym_id_key = kind === 'auth' ? 'auth_asym_id' : 'label_asym_id';
    const seq_id_key = kind === 'auth' ? 'auth_seq_id' : 'label_seq_id';
    for (const x of xs) {
        if (x.kind === 'range') {
            groups.push(builder_1.MolScriptBuilder.struct.generator.atomGroups({
                'chain-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp(asym_id_key), x.asym_id]),
                'residue-test': builder_1.MolScriptBuilder.core.rel.inRange([builder_1.MolScriptBuilder.ammp(seq_id_key), x.seq_id_beg, x.seq_id_end])
            }));
        }
        else {
            const ins_code = ((_a = x.ins_code) !== null && _a !== void 0 ? _a : '').trim();
            groups.push(builder_1.MolScriptBuilder.struct.generator.atomGroups({
                'chain-test': builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp(asym_id_key), x.asym_id]),
                'residue-test': builder_1.MolScriptBuilder.core.logic.and([
                    builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp(seq_id_key), x.seq_id]),
                    builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('pdbx_PDB_ins_code'), ins_code])
                ])
            }));
        }
    }
    const query = builder_1.MolScriptBuilder.struct.combinator.merge(groups);
    return (0, base_1.compile)(query);
}
function atomEntriesToQuery(xs) {
    const set = generic_1.UniqueArray.create();
    for (const [a, b] of xs) {
        for (let i = a; i <= b; i++) {
            generic_1.UniqueArray.add(set, i, i);
        }
    }
    const query = builder_1.MolScriptBuilder.struct.generator.atomGroups({
        'atom-test': builder_1.MolScriptBuilder.core.set.has([builder_1.MolScriptBuilder.set(...set.array), builder_1.MolScriptBuilder.ammp('id')])
    });
    return (0, base_1.compile)(query);
}
function elementSymbolNumberEntriesToQuery(xs) {
    const set = generic_1.UniqueArray.create();
    for (const [a, b] of xs) {
        for (let i = a; i <= b; i++) {
            generic_1.UniqueArray.add(set, i.toString(), i.toString());
        }
    }
    const query = builder_1.MolScriptBuilder.struct.generator.atomGroups({
        'atom-test': builder_1.MolScriptBuilder.core.set.has([builder_1.MolScriptBuilder.set(...set.array), builder_1.MolScriptBuilder.acp('elementSymbol')])
    });
    return (0, base_1.compile)(query);
}
function elementSymbolStringEntriesToQuery(names) {
    const query = builder_1.MolScriptBuilder.struct.generator.atomGroups({
        'atom-test': builder_1.MolScriptBuilder.core.set.has([builder_1.MolScriptBuilder.set(...names), builder_1.MolScriptBuilder.acp('elementSymbol')])
    });
    return (0, base_1.compile)(query);
}
function parseRange(c, s, e) {
    if (!c || s.length === 0 || Number.isNaN(+s[0]))
        return;
    if (Number.isNaN(e)) {
        return { kind: 'single', asym_id: c, seq_id: +s[0], ins_code: s[1] };
    }
    return { kind: 'range', asym_id: c, seq_id_beg: +s[0], seq_id_end: e };
}
function parseInsCode(e) {
    if (!e)
        return [];
    return e.split(':');
}
function parseResidueListSelection(input) {
    return input.split(',') // A 1-3, B 3 => [A 1-3, B 3]
        .map(e => e.trim().split(/\s+|[-]/g).filter(e => !!e)) // [A 1-3, B 3] => [[A, 1, 3], [B, 3]]
        .map(e => parseRange(e[0], parseInsCode(e[1]), +e[2]))
        .filter(e => !!e);
}
function parseAtomListSelection(input) {
    return input.split(',') // 1-3, 3 => [1-3, 3]
        .map(e => e.trim().split(/\s+|[-]/g).filter(e => !!e)) // [1-3, 3] => [[1, 3], [3]]
        .filter(e => e.length === 1 || e.length === 2)
        .map(e => e.length === 1 ? [+e[0], +e[0]] : [+e[0], +e[1]]);
}
// parses a list of residue ranges, e.g. A 10-100, B 30, C 12:i
function compileIdListSelection(input, idType) {
    if (idType === 'atom-id') {
        const entries = parseAtomListSelection(input);
        return atomEntriesToQuery(entries);
    }
    else if (idType === 'element-symbol') {
        const containsLetters = /[a-zA-Z]/.test(input);
        if (containsLetters) {
            return elementSymbolStringEntriesToQuery(input.split(',').map(e => e.trim()));
        }
        else {
            const entries = parseAtomListSelection(input);
            return elementSymbolNumberEntriesToQuery(entries);
        }
    }
    else {
        const entries = parseResidueListSelection(input);
        return residueEntriesToQuery(entries, idType);
    }
}
