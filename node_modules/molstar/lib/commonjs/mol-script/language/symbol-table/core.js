"use strict";
/**
 * Copyright (c) 2018 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolMap = exports.SymbolList = exports.core = exports.TTargs = exports.Types = void 0;
const type_1 = require("../type");
const symbol_1 = require("../symbol");
const helpers_1 = require("../helpers");
var Types;
(function (Types) {
    Types.AnyVar = type_1.Type.Variable('a', type_1.Type.Any);
    Types.AnyValueVar = type_1.Type.Variable('a', type_1.Type.Any);
    Types.ConstrainedVar = type_1.Type.Variable('a', type_1.Type.Any, true);
    Types.Regex = type_1.Type.Value('Core', 'Regex');
    Types.Set = (t) => type_1.Type.Container('Core', 'Set', t || Types.AnyValueVar);
    Types.List = (t) => type_1.Type.Container('Core', 'List', t || Types.AnyVar);
    Types.Fn = (t, alias) => type_1.Type.Container('Core', 'Fn', t || Types.AnyVar, alias);
    Types.Flags = (t, alias) => type_1.Type.Container('Core', 'Flags', t, alias);
    Types.BitFlags = Types.Flags(type_1.Type.Num, 'BitFlags');
})(Types || (exports.Types = Types = {}));
function unaryOp(type, description) {
    return (0, helpers_1.symbol)(symbol_1.Arguments.Dictionary({ 0: (0, symbol_1.Argument)(type) }), type, description);
}
function binOp(type, description) {
    return (0, helpers_1.symbol)(symbol_1.Arguments.List(type, { nonEmpty: true }), type, description);
}
function binRel(src, target, description) {
    return (0, helpers_1.symbol)(symbol_1.Arguments.Dictionary({
        0: (0, symbol_1.Argument)(src),
        1: (0, symbol_1.Argument)(src)
    }), target, description);
}
exports.TTargs = symbol_1.Arguments.Dictionary({
    0: (0, symbol_1.Argument)(type_1.Type.Num),
    1: (0, symbol_1.Argument)(type_1.Type.Num)
});
const type = {
    '@header': 'Types',
    bool: (0, helpers_1.symbol)(symbol_1.Arguments.Dictionary({ 0: (0, symbol_1.Argument)(type_1.Type.AnyValue) }), type_1.Type.Bool, 'Convert a value to boolean.'),
    num: (0, helpers_1.symbol)(symbol_1.Arguments.Dictionary({ 0: (0, symbol_1.Argument)(type_1.Type.AnyValue) }), type_1.Type.Num, 'Convert a value to number.'),
    str: (0, helpers_1.symbol)(symbol_1.Arguments.Dictionary({ 0: (0, symbol_1.Argument)(type_1.Type.AnyValue) }), type_1.Type.Str, 'Convert a value to string.'),
    regex: (0, helpers_1.symbol)(symbol_1.Arguments.Dictionary({
        0: (0, symbol_1.Argument)(type_1.Type.Str, { description: 'Expression' }),
        1: (0, symbol_1.Argument)(type_1.Type.Str, { isOptional: true, description: `Flags, e.g. 'i' for ignore case` })
    }), Types.Regex, 'Creates a regular expression from a string using the ECMAscript syntax.'),
    list: (0, helpers_1.symbol)(symbol_1.Arguments.List(Types.AnyVar), Types.List()),
    set: (0, helpers_1.symbol)(symbol_1.Arguments.List(Types.AnyValueVar), Types.Set()),
    bitflags: (0, helpers_1.symbol)(symbol_1.Arguments.Dictionary({ 0: (0, symbol_1.Argument)(type_1.Type.Num) }), Types.BitFlags, 'Interpret a number as bitflags.'),
    compositeKey: (0, helpers_1.symbol)(symbol_1.Arguments.List(type_1.Type.AnyValue), type_1.Type.AnyValue),
};
const logic = {
    '@header': 'Logic',
    not: unaryOp(type_1.Type.Bool),
    and: binOp(type_1.Type.Bool),
    or: binOp(type_1.Type.Bool),
};
const ctrl = {
    '@header': 'Control',
    eval: (0, helpers_1.symbol)(symbol_1.Arguments.Dictionary({ 0: (0, symbol_1.Argument)(Types.Fn(Types.AnyVar)) }), Types.AnyVar, 'Evaluate a function.'),
    fn: (0, helpers_1.symbol)(symbol_1.Arguments.Dictionary({ 0: (0, symbol_1.Argument)(Types.AnyVar) }), Types.Fn(Types.AnyVar), 'Wrap an expression to a "lazy" function.'),
    if: (0, helpers_1.symbol)(symbol_1.Arguments.Dictionary({
        0: (0, symbol_1.Argument)(type_1.Type.Bool, { description: 'Condition' }),
        1: (0, symbol_1.Argument)(type_1.Type.Variable('a', type_1.Type.Any), { description: 'If true' }),
        2: (0, symbol_1.Argument)(type_1.Type.Variable('b', type_1.Type.Any), { description: 'If false' })
    }), type_1.Type.Union([type_1.Type.Variable('a', type_1.Type.Any), type_1.Type.Variable('b', type_1.Type.Any)])),
    assoc: (0, helpers_1.symbol)(symbol_1.Arguments.Dictionary({
        0: (0, symbol_1.Argument)(type_1.Type.Str, { description: 'Name' }),
        1: (0, symbol_1.Argument)(type_1.Type.Variable('a', type_1.Type.Any), { description: 'Value to assign' })
    }), type_1.Type.Variable('a', type_1.Type.Any))
};
const rel = {
    '@header': 'Relational',
    eq: binRel(type_1.Type.Variable('a', type_1.Type.AnyValue, true), type_1.Type.Bool),
    neq: binRel(type_1.Type.Variable('a', type_1.Type.AnyValue, true), type_1.Type.Bool),
    lt: binRel(type_1.Type.Num, type_1.Type.Bool),
    lte: binRel(type_1.Type.Num, type_1.Type.Bool),
    gr: binRel(type_1.Type.Num, type_1.Type.Bool),
    gre: binRel(type_1.Type.Num, type_1.Type.Bool),
    inRange: (0, helpers_1.symbol)(symbol_1.Arguments.Dictionary({
        0: (0, symbol_1.Argument)(type_1.Type.Num, { description: 'Value to test' }),
        1: (0, symbol_1.Argument)(type_1.Type.Num, { description: 'Minimum value' }),
        2: (0, symbol_1.Argument)(type_1.Type.Num, { description: 'Maximum value' })
    }), type_1.Type.Bool, 'Check if the value of the 1st argument is >= 2nd and <= 3rd.'),
};
const math = {
    '@header': 'Math',
    add: binOp(type_1.Type.Num),
    sub: binOp(type_1.Type.Num),
    mult: binOp(type_1.Type.Num),
    div: binRel(type_1.Type.Num, type_1.Type.Num),
    pow: binRel(type_1.Type.Num, type_1.Type.Num),
    mod: binRel(type_1.Type.Num, type_1.Type.Num),
    min: binOp(type_1.Type.Num),
    max: binOp(type_1.Type.Num),
    cantorPairing: binRel(type_1.Type.Num, type_1.Type.Num),
    sortedCantorPairing: binRel(type_1.Type.Num, type_1.Type.Num),
    invertCantorPairing: (0, helpers_1.symbol)(symbol_1.Arguments.Dictionary({ 0: (0, symbol_1.Argument)(type_1.Type.Num) }), Types.List(type_1.Type.Num)),
    floor: unaryOp(type_1.Type.Num),
    ceil: unaryOp(type_1.Type.Num),
    roundInt: unaryOp(type_1.Type.Num),
    trunc: unaryOp(type_1.Type.Num),
    abs: unaryOp(type_1.Type.Num),
    sign: unaryOp(type_1.Type.Num),
    sqrt: unaryOp(type_1.Type.Num),
    cbrt: unaryOp(type_1.Type.Num),
    sin: unaryOp(type_1.Type.Num),
    cos: unaryOp(type_1.Type.Num),
    tan: unaryOp(type_1.Type.Num),
    asin: unaryOp(type_1.Type.Num),
    acos: unaryOp(type_1.Type.Num),
    atan: unaryOp(type_1.Type.Num),
    sinh: unaryOp(type_1.Type.Num),
    cosh: unaryOp(type_1.Type.Num),
    tanh: unaryOp(type_1.Type.Num),
    exp: unaryOp(type_1.Type.Num),
    log: unaryOp(type_1.Type.Num),
    log10: unaryOp(type_1.Type.Num),
    atan2: binRel(type_1.Type.Num, type_1.Type.Num)
};
const str = {
    '@header': 'Strings',
    concat: binOp(type_1.Type.Str),
    match: (0, helpers_1.symbol)(symbol_1.Arguments.Dictionary({ 0: (0, symbol_1.Argument)(Types.Regex), 1: (0, symbol_1.Argument)(type_1.Type.Str) }), type_1.Type.Bool)
};
const list = {
    '@header': 'Lists',
    getAt: (0, helpers_1.symbol)(symbol_1.Arguments.Dictionary({ 0: (0, symbol_1.Argument)(Types.List()), 1: (0, symbol_1.Argument)(type_1.Type.Num) }), Types.AnyVar),
    equal: (0, helpers_1.symbol)(symbol_1.Arguments.Dictionary({ 0: (0, symbol_1.Argument)(Types.List()), 1: (0, symbol_1.Argument)(Types.List()) }), type_1.Type.Bool)
};
const set = {
    '@header': 'Sets',
    has: (0, helpers_1.symbol)(symbol_1.Arguments.Dictionary({ 0: (0, symbol_1.Argument)(Types.Set(Types.ConstrainedVar)), 1: (0, symbol_1.Argument)(Types.ConstrainedVar) }), type_1.Type.Bool, 'Check if the the 1st argument includes the value of the 2nd.'),
    isSubset: (0, helpers_1.symbol)(symbol_1.Arguments.Dictionary({ 0: (0, symbol_1.Argument)(Types.Set(Types.ConstrainedVar)), 1: (0, symbol_1.Argument)(Types.Set(Types.ConstrainedVar)) }), type_1.Type.Bool, 'Check if the the 1st argument is a subset of the 2nd.')
};
const flags = {
    '@header': 'Flags',
    hasAny: (0, helpers_1.symbol)(symbol_1.Arguments.Dictionary({
        0: (0, symbol_1.Argument)(Types.Flags(Types.ConstrainedVar)),
        1: (0, symbol_1.Argument)(Types.Flags(Types.ConstrainedVar))
    }), type_1.Type.Bool, 'Check if the the 1st argument has at least one of the 2nd one\'s flags.'),
    hasAll: (0, helpers_1.symbol)(symbol_1.Arguments.Dictionary({
        0: (0, symbol_1.Argument)(Types.Flags(Types.ConstrainedVar)),
        1: (0, symbol_1.Argument)(Types.Flags(Types.ConstrainedVar))
    }), type_1.Type.Bool, 'Check if the the 1st argument has all 2nd one\'s flags.'),
};
exports.core = {
    '@header': 'Language Primitives',
    type,
    logic,
    ctrl,
    rel,
    math,
    str,
    list,
    set,
    flags
};
(0, helpers_1.normalizeTable)(exports.core);
exports.SymbolList = (0, helpers_1.symbolList)(exports.core);
exports.SymbolMap = (function () {
    const map = Object.create(null);
    for (const s of exports.SymbolList)
        map[s.id] = s;
    return map;
})();
