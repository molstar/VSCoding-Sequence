/**
 * Copyright (c) 2018 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { MonadicParser as P } from '../../mol-util/monadic-parser';
import { Expression } from './expression';
import { MolScriptBuilder as B } from './builder';
import { assertUnreachable } from '../../mol-util/type-helpers';
export function parseMolScript(input) {
    return Language.parse(input);
}
var Language;
(function (Language) {
    let ASTNode;
    (function (ASTNode) {
        function str(value) { return { kind: 'string', value }; }
        ASTNode.str = str;
        function symb(value) { return { kind: 'symbol', value }; }
        ASTNode.symb = symb;
        function list(bracket, nodes) { return { kind: 'list', bracket, nodes }; }
        ASTNode.list = list;
        function comment(value) { return { kind: 'comment', value }; }
        ASTNode.comment = comment;
    })(ASTNode || (ASTNode = {}));
    const ws = P.regexp(/[\n\r\s]*/);
    const Expr = P.lazy(() => (P.alt(Str, List, Symb, Comment).trim(ws)));
    const Str = P.takeWhile(c => c !== '`').trim('`').map(ASTNode.str);
    const Symb = P.regexp(/[^()\[\]{};`,\n\r\s]+/).map(ASTNode.symb);
    const Comment = P.regexp(/\s*;+([^\n\r]*)\n/, 1).map(ASTNode.comment);
    const Args = Expr.many();
    const List1 = Args.wrap('(', ')').map(args => ASTNode.list('(', args));
    const List2 = Args.wrap('[', ']').map(args => ASTNode.list('[', args));
    const List3 = Args.wrap('{', '}').map(args => ASTNode.list('{', args));
    const List = P.alt(List1, List2, List3);
    const Expressions = Expr.many();
    function getAST(input) { return Expressions.tryParse(input); }
    function visitExpr(expr) {
        switch (expr.kind) {
            case 'string': return expr.value;
            case 'symbol': {
                const value = expr.value;
                if (value.length > 1) {
                    const fst = value.charAt(0);
                    switch (fst) {
                        case '.': return B.atomName(value.substr(1));
                        case '_': return B.struct.type.elementSymbol([value.substr(1)]);
                    }
                }
                if (value === 'true')
                    return true;
                if (value === 'false')
                    return false;
                if (isNumber(value))
                    return +value;
                return Expression.Symbol(value);
            }
            case 'list': {
                switch (expr.bracket) {
                    case '[': return B.core.type.list(withoutComments(expr.nodes).map(visitExpr));
                    case '{': return B.core.type.set(withoutComments(expr.nodes).map(visitExpr));
                    case '(': {
                        if (expr.nodes[0].kind === 'comment')
                            throw new Error('Invalid expression');
                        const head = visitExpr(expr.nodes[0]);
                        return Expression.Apply(head, getArgs(expr.nodes));
                    }
                    default: assertUnreachable(expr.bracket);
                }
            }
            default: assertUnreachable(expr);
        }
    }
    function getArgs(nodes) {
        if (nodes.length <= 1)
            return void 0;
        if (!hasNamedArgs(nodes)) {
            const args = [];
            for (let i = 1, _i = nodes.length; i < _i; i++) {
                const n = nodes[i];
                if (n.kind === 'comment')
                    continue;
                args[args.length] = visitExpr(n);
            }
            return args;
        }
        const args = {};
        let allNumeric = true;
        let pos = 0;
        for (let i = 1, _i = nodes.length; i < _i; i++) {
            const n = nodes[i];
            if (n.kind === 'comment')
                continue;
            if (n.kind === 'symbol' && n.value.length > 1 && n.value.charAt(0) === ':') {
                const name = n.value.substr(1);
                ++i;
                while (i < _i && nodes[i].kind === 'comment') {
                    i++;
                }
                if (i >= _i)
                    throw new Error(`There must be a value foolowed a named arg ':${name}'.`);
                if (nodes[i].kind === 'comment')
                    throw new Error('Invalid expression');
                args[name] = visitExpr(nodes[i]);
                if (isNaN(+name))
                    allNumeric = false;
            }
            else {
                args[pos++] = visitExpr(n);
            }
        }
        if (allNumeric) {
            const keys = Object.keys(args).map(a => +a).sort((a, b) => a - b);
            let isArray = true;
            for (let i = 0, _i = keys.length; i < _i; i++) {
                if (keys[i] !== i) {
                    isArray = false;
                    break;
                }
            }
            if (isArray) {
                const arrayArgs = [];
                for (let i = 0, _i = keys.length; i < _i; i++) {
                    arrayArgs[i] = args[i];
                }
                return arrayArgs;
            }
        }
        return args;
    }
    function hasNamedArgs(nodes) {
        for (let i = 1, _i = nodes.length; i < _i; i++) {
            const n = nodes[i];
            if (n.kind === 'symbol' && n.value.length > 1 && n.value.charAt(0) === ':')
                return true;
        }
        return false;
    }
    function withoutComments(nodes) {
        let hasComment = false;
        for (let i = 0, _i = nodes.length; i < _i; i++) {
            if (nodes[i].kind === 'comment') {
                hasComment = true;
                break;
            }
        }
        if (!hasComment)
            return nodes;
        return nodes.filter(n => n.kind !== 'comment');
    }
    function isNumber(value) {
        return /-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/.test(value) && !isNaN(+value);
    }
    function parse(input) {
        const ast = getAST(input);
        const ret = [];
        for (const expr of ast) {
            if (expr.kind === 'comment')
                continue;
            ret[ret.length] = visitExpr(expr);
        }
        return ret;
    }
    Language.parse = parse;
})(Language || (Language = {}));
