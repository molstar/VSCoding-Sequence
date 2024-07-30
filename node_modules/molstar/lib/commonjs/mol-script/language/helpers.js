"use strict";
/*
 * Copyright (c) 2018 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.symbol = symbol;
exports.normalizeTable = normalizeTable;
exports.symbolList = symbolList;
const symbol_1 = require("./symbol");
function symbol(args, type, description) {
    return (0, symbol_1.MSymbol)('', args, type, description);
}
function normalizeTable(table) {
    _normalizeTable('', '', table);
}
function symbolList(table) {
    const list = [];
    _symbolList(table, list);
    return list;
}
function formatKey(key) {
    const regex = /([a-z])([A-Z])([a-z]|$)/g;
    // do this twice because 'xXxX'
    return key.replace(regex, (s, a, b, c) => `${a}-${b.toLocaleLowerCase()}${c}`).replace(regex, (s, a, b, c) => `${a}-${b.toLocaleLowerCase()}${c}`);
}
function _normalizeTable(namespace, key, obj) {
    if ((0, symbol_1.isSymbol)(obj)) {
        obj.info.namespace = namespace;
        obj.info.name = obj.info.name || formatKey(key);
        obj.id = `${obj.info.namespace}.${obj.info.name}`;
        return;
    }
    const currentNs = `${obj['@namespace'] || formatKey(key)}`;
    const newNs = namespace ? `${namespace}.${currentNs}` : currentNs;
    for (const childKey of Object.keys(obj)) {
        if (typeof obj[childKey] !== 'object' && !(0, symbol_1.isSymbol)(obj[childKey]))
            continue;
        _normalizeTable(newNs, childKey, obj[childKey]);
    }
}
function _symbolList(obj, list) {
    if ((0, symbol_1.isSymbol)(obj)) {
        list.push(obj);
        return;
    }
    for (const childKey of Object.keys(obj)) {
        if (typeof obj[childKey] !== 'object' && !(0, symbol_1.isSymbol)(obj[childKey]))
            continue;
        _symbolList(obj[childKey], list);
    }
}
