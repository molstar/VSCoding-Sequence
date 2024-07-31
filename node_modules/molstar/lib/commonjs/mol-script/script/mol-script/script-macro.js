"use strict";
/**
 * Copyright (c) 2018-2019 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPositionalArgs = getPositionalArgs;
exports.tryGetArg = tryGetArg;
exports.pickArgs = pickArgs;
exports.aggregate = aggregate;
const builder_1 = require("../../language/builder");
function getPositionalArgs(args) {
    return Object.keys(args)
        .filter(k => !isNaN(k))
        .map(k => +k)
        .sort((a, b) => a - b)
        .map(k => args[k]);
}
function tryGetArg(args, name, defaultValue) {
    return (args && args[name] !== void 0) ? args[name] : defaultValue;
}
function pickArgs(args, ...names) {
    const ret = Object.create(null);
    let count = 0;
    for (const k of Object.keys(args)) {
        if (names.indexOf(k) >= 0) {
            ret[k] = args[k];
            count++;
        }
    }
    return count ? ret : void 0;
}
function aggregate(property, fn, initial) {
    return builder_1.MolScriptBuilder.struct.atomSet.reduce({
        initial: initial !== void 0 ? initial : property,
        value: fn([builder_1.MolScriptBuilder.struct.slot.elementSetReduce(), property])
    });
}
