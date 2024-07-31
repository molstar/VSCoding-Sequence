"use strict";
/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Panagiotis Tourlas <panagiot_tourlov@hotmail.com>
 * @author Koya Sakuma <koya.sakuma.work@gmail.com>
 *
 * Adapted from MolQL project
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.transpiler = void 0;
const tslib_1 = require("tslib");
const P = tslib_1.__importStar(require("../../../mol-util/monadic-parser"));
const h = tslib_1.__importStar(require("../helper"));
const builder_1 = require("../../../mol-script/language/builder");
const B = builder_1.MolScriptBuilder;
const properties_1 = require("./properties");
const operators_1 = require("./operators");
const keywords_1 = require("./keywords");
const functions_1 = require("./functions");
// <, <=, = or ==, >=, >, and !=
// lt, le, eq, ge, gt, and ne, =~
const valueOperators = [
    {
        '@desc': 'multiplication, division',
        '@examples': [],
        name: 'mul-div',
        type: h.binaryLeft,
        rule: P.MonadicParser.regexp(/\s*(\*|\/)\s*/, 1),
        map: (op, e1, e2) => {
            switch (op) {
                case '*': return B.core.math.mult([e1, e2]);
                case '/': return B.core.math.div([e1, e2]);
                default: throw new Error(`value operator '${op}' not supported`);
            }
        }
    },
    {
        '@desc': 'addition, substraction',
        '@examples': [],
        name: 'add-sub',
        type: h.binaryLeft,
        rule: P.MonadicParser.regexp(/\s*(-|\+)\s*/, 1),
        map: (op, e1, e2) => {
            switch (op) {
                case '-': return B.core.math.sub([e1, e2]);
                case '+': return B.core.math.add([e1, e2]);
                default: throw new Error(`value operator '${op}' not supported`);
            }
        }
    },
    {
        '@desc': 'value comparisons',
        '@examples': [],
        name: 'comparison',
        type: h.binaryLeft,
        rule: P.MonadicParser.alt(P.MonadicParser.regexp(/\s*(=~|==|>=|<=|=|!=|>|<)\s*/, 1), P.MonadicParser.whitespace.result('=')),
        map: (op, e1, e2) => {
            let expr;
            if (e1.head !== undefined) {
                if (e1.head.name === 'structure-query.atom-property.macromolecular.secondary-structure-flags') {
                    expr = B.core.flags.hasAny([e1, (0, properties_1.sstrucMap)(e2)]);
                }
                if (e1.head.name === 'core.type.regex') {
                    expr = B.core.str.match([e1, B.core.type.str([e2])]);
                }
            }
            else if (e2.head !== undefined) {
                if (e2.head.name === 'structure-query.atom-property.macromolecular.secondary-structure-flags') {
                    expr = B.core.flags.hasAny([e2, (0, properties_1.sstrucMap)(e1)]);
                }
                if (e2.head.name === 'core.type.regex') {
                    expr = B.core.str.match([e2, B.core.type.str([e1])]);
                }
            }
            else if (op === '=~') {
                if (e1.head) {
                    expr = B.core.str.match([
                        B.core.type.regex([`^${e2}$`, 'i']),
                        B.core.type.str([e1])
                    ]);
                }
                else {
                    expr = B.core.str.match([
                        B.core.type.regex([`^${e1}$`, 'i']),
                        B.core.type.str([e2])
                    ]);
                }
            }
            if (!expr) {
                if (e1.head)
                    e2 = h.wrapValue(e1, e2);
                if (e2.head)
                    e1 = h.wrapValue(e2, e1);
                switch (op) {
                    case '=':
                    case '==':
                        expr = B.core.rel.eq([e1, e2]);
                        break;
                    case '!=':
                        expr = B.core.rel.neq([e1, e2]);
                        break;
                    case '>':
                        expr = B.core.rel.gr([e1, e2]);
                        break;
                    case '<':
                        expr = B.core.rel.lt([e1, e2]);
                        break;
                    case '>=':
                        expr = B.core.rel.gre([e1, e2]);
                        break;
                    case '<=':
                        expr = B.core.rel.lte([e1, e2]);
                        break;
                    default: throw new Error(`value operator '${op}' not supported`);
                }
            }
            return B.struct.generator.atomGroups({ 'atom-test': expr });
        }
    }
];
const lang = P.MonadicParser.createLanguage({
    Parens: function (r) {
        return P.MonadicParser.alt(r.Parens, r.Operator, r.Expression).wrap(P.MonadicParser.string('('), P.MonadicParser.string(')'));
    },
    Expression: function (r) {
        return P.MonadicParser.alt(r.RangeListProperty, 
        //	    r.NamedAtomProperties,
        r.ValueQuery, r.Keywords);
    },
    NamedAtomProperties: function () {
        return P.MonadicParser.alt(...h.getNamedPropertyRules(properties_1.properties));
    },
    Keywords: () => P.MonadicParser.alt(...h.getKeywordRules(keywords_1.keywords)),
    ValueRange: function (r) {
        return P.MonadicParser.seq(r.Value
            .skip(P.MonadicParser.regexp(/\s+TO\s+/i)), r.Value).map(x => ({ range: x }));
    },
    RangeListProperty: function (r) {
        return P.MonadicParser.seq(P.MonadicParser.alt(...h.getPropertyNameRules(properties_1.properties, /\s/))
            .skip(P.MonadicParser.whitespace), P.MonadicParser.alt(r.ValueRange, r.Value).sepBy1(P.MonadicParser.whitespace)).map(x => {
            const [property, values] = x;
            const listValues = [];
            const rangeValues = [];
            values.forEach((v) => {
                if (v.range) {
                    rangeValues.push(B.core.rel.inRange([property, v.range[0], v.range[1]]));
                }
                else {
                    listValues.push(h.wrapValue(property, v, properties_1.sstrucDict));
                }
            });
            const rangeTest = h.orExpr(rangeValues);
            const listTest = h.valuesTest(property, listValues);
            let test;
            if (rangeTest && listTest) {
                test = B.core.logic.or([rangeTest, listTest]);
            }
            else {
                test = rangeTest ? rangeTest : listTest;
            }
            return B.struct.generator.atomGroups({ [h.testLevel(property)]: test });
        });
    },
    Operator: function (r) {
        return h.combineOperators(operators_1.operators, P.MonadicParser.alt(r.Parens, r.Expression, r.ValueQuery));
    },
    Query: function (r) {
        return P.MonadicParser.alt(r.Operator, r.Parens, r.Expression).trim(P.MonadicParser.optWhitespace);
    },
    Number: function () {
        return P.MonadicParser.regexp(/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/)
            .map(Number)
            .desc('number');
    },
    String: function () {
        const w = h.getReservedWords(properties_1.properties, keywords_1.keywords, operators_1.operators)
            .sort(h.strLenSortFn).map(h.escapeRegExp).join('|');
        return P.MonadicParser.alt(P.MonadicParser.regexp(new RegExp(`(?!(${w}))[A-Z0-9_]+`, 'i')), P.MonadicParser.regexp(/'((?:[^"\\]|\\.)*)'/, 1), P.MonadicParser.regexp(/"((?:[^"\\]|\\.)*)"/, 1).map((x) => B.core.type.regex([`^${x}$`, 'i']))).desc('string');
    },
    Value: function (r) {
        return P.MonadicParser.alt(r.Number, r.String);
    },
    ValueParens: function (r) {
        return P.MonadicParser.alt(r.ValueParens, r.ValueOperator, r.ValueExpressions).wrap(P.MonadicParser.string('('), P.MonadicParser.string(')'));
    },
    ValuePropertyNames: function () {
        return P.MonadicParser.alt(...h.getPropertyNameRules(properties_1.properties, /=~|==|>=|<=|=|!=|>|<|\)|\s|\+|-|\*|\//i));
    },
    ValueOperator: function (r) {
        return h.combineOperators(valueOperators, P.MonadicParser.alt(r.ValueParens, r.ValueExpressions));
    },
    ValueExpressions: function (r) {
        return P.MonadicParser.alt(r.ValueFunctions, r.Value, r.ValuePropertyNames);
    },
    ValueFunctions: function (r) {
        return P.MonadicParser.alt(...h.getFunctionRules(functions_1.functions, r.ValueOperator));
    },
    ValueQuery: function (r) {
        return P.MonadicParser.alt(r.ValueOperator.map((x) => {
            // if (!x.head || x.head.startsWith('core.math') || x.head.startsWith('structure-query.atom-property')) {
            if (!x.head.name || !x.head.name.startsWith('structure-query.generator')) {
                throw new Error(`values must be part of an comparison, value '${x}'`);
            }
            else {
                return x;
            }
        }));
    }
});
const transpiler = str => lang.Query.tryParse(str);
exports.transpiler = transpiler;
