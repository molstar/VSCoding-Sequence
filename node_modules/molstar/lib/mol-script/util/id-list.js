/**
 * Copyright (c) 2021-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Ludovic Autin <ludovic.autin@gmail.com>
 */
import { MolScriptBuilder as MS } from '../language/builder';
import { compile } from '../runtime/query/base';
import { UniqueArray } from '../../mol-data/generic';
function residueEntriesToQuery(xs, kind) {
    var _a;
    const groups = [];
    const asym_id_key = kind === 'auth' ? 'auth_asym_id' : 'label_asym_id';
    const seq_id_key = kind === 'auth' ? 'auth_seq_id' : 'label_seq_id';
    for (const x of xs) {
        if (x.kind === 'range') {
            groups.push(MS.struct.generator.atomGroups({
                'chain-test': MS.core.rel.eq([MS.ammp(asym_id_key), x.asym_id]),
                'residue-test': MS.core.rel.inRange([MS.ammp(seq_id_key), x.seq_id_beg, x.seq_id_end])
            }));
        }
        else {
            const ins_code = ((_a = x.ins_code) !== null && _a !== void 0 ? _a : '').trim();
            groups.push(MS.struct.generator.atomGroups({
                'chain-test': MS.core.rel.eq([MS.ammp(asym_id_key), x.asym_id]),
                'residue-test': MS.core.logic.and([
                    MS.core.rel.eq([MS.ammp(seq_id_key), x.seq_id]),
                    MS.core.rel.eq([MS.ammp('pdbx_PDB_ins_code'), ins_code])
                ])
            }));
        }
    }
    const query = MS.struct.combinator.merge(groups);
    return compile(query);
}
function atomEntriesToQuery(xs) {
    const set = UniqueArray.create();
    for (const [a, b] of xs) {
        for (let i = a; i <= b; i++) {
            UniqueArray.add(set, i, i);
        }
    }
    const query = MS.struct.generator.atomGroups({
        'atom-test': MS.core.set.has([MS.set(...set.array), MS.ammp('id')])
    });
    return compile(query);
}
function elementSymbolNumberEntriesToQuery(xs) {
    const set = UniqueArray.create();
    for (const [a, b] of xs) {
        for (let i = a; i <= b; i++) {
            UniqueArray.add(set, i.toString(), i.toString());
        }
    }
    const query = MS.struct.generator.atomGroups({
        'atom-test': MS.core.set.has([MS.set(...set.array), MS.acp('elementSymbol')])
    });
    return compile(query);
}
function elementSymbolStringEntriesToQuery(names) {
    const query = MS.struct.generator.atomGroups({
        'atom-test': MS.core.set.has([MS.set(...names), MS.acp('elementSymbol')])
    });
    return compile(query);
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
export function compileIdListSelection(input, idType) {
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
