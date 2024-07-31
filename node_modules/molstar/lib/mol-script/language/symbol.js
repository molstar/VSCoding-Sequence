/*
 * Copyright (c) 2018 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Expression } from './expression';
export function Argument(type, params) {
    const { description = void 0, isOptional = false, isRest = false, defaultValue = void 0 } = params || {};
    return { type, isOptional, isRest, defaultValue, description };
}
export var Arguments;
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
})(Arguments || (Arguments = {}));
export function MSymbol(name, args, type, description) {
    const symbol = function (args) {
        return Expression.Apply(Expression.Symbol(symbol.id), args);
    };
    symbol.info = { namespace: '', name, description };
    symbol.id = '';
    symbol.args = args;
    symbol.type = type;
    return symbol;
}
export function CustomPropSymbol(namespace, name, type, description) {
    const symbol = function (args) {
        return Expression.Apply(Expression.Symbol(symbol.id), args);
    };
    symbol.info = { namespace, name, description };
    symbol.id = `${namespace}.${name}`;
    symbol.args = Arguments.None;
    symbol.type = type;
    return symbol;
}
export function isSymbol(x) {
    const s = x;
    return typeof s === 'function' && !!s.info && !!s.args && typeof s.info.namespace === 'string' && !!s.type;
}
