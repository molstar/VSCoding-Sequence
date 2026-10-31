"use strict";
/*
 * Copyright (c) 2018 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Arguments = void 0;
exports.Argument = Argument;
exports.MSymbol = MSymbol;
exports.CustomPropSymbol = CustomPropSymbol;
exports.isSymbol = isSymbol;
const expression_1 = require("./expression");
function Argument(type, params) {
    const { description = void 0, isOptional = false, isRest = false, defaultValue = void 0 } = params || {};
    return { type, isOptional, isRest, defaultValue, description };
}
var Arguments;
(function (Arguments) {
    Arguments.None = Dictionary({});
    function Dictionary(map) {
        return { kind: 'dictionary', map, '@type': 0 };
    }
    Arguments.Dictionary = Dictionary;
    function List(type, params) {
        const { nonEmpty = false } = params || {};
        return { kind: 'list', type, nonEmpty, '@type': 0 };
    }
    Arguments.List = List;
})(Arguments || (exports.Arguments = Arguments = {}));
function MSymbol(name, args, type, description) {
    const symbol = function (args) {
        return expression_1.Expression.Apply(expression_1.Expression.Symbol(symbol.id), args);
    };
    symbol.info = { namespace: '', name, description };
    symbol.id = '';
    symbol.args = args;
    symbol.type = type;
    return symbol;
}
function CustomPropSymbol(namespace, name, type, description) {
    const symbol = function (args) {
        return expression_1.Expression.Apply(expression_1.Expression.Symbol(symbol.id), args);
    };
    symbol.info = { namespace, name, description };
    symbol.id = `${namespace}.${name}`;
    symbol.args = Arguments.None;
    symbol.type = type;
    return symbol;
}
function isSymbol(x) {
    const s = x;
    return typeof s === 'function' && !!s.info && !!s.args && typeof s.info.namespace === 'string' && !!s.type;
}
