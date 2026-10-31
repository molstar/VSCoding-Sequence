"use strict";
/*
 * Copyright (c) 2018 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Expression = void 0;
var Expression;
(function (Expression) {
    function Symbol(name) { return { name }; }
    Expression.Symbol = Symbol;
    function Apply(head, args) { return args ? { head, args } : { head }; }
    Expression.Apply = Apply;
    function isArgumentsArray(e) { return !!e && Array.isArray(e); }
    Expression.isArgumentsArray = isArgumentsArray;
    function isArgumentsMap(e) { return !!e && !Array.isArray(e); }
    Expression.isArgumentsMap = isArgumentsMap;
    function isLiteral(e) { return !isApply(e) && !isSymbol(e); }
    Expression.isLiteral = isLiteral;
    function isApply(e) { return !!e && !!e.head && typeof e === 'object'; }
    Expression.isApply = isApply;
    function isSymbol(e) { return !!e && typeof e.name === 'string'; }
    Expression.isSymbol = isSymbol;
})(Expression || (exports.Expression = Expression = {}));
