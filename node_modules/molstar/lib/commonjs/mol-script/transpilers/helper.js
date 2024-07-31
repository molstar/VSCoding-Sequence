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
exports.escapeRegExp = void 0;
exports.prefix = prefix;
exports.postfix = postfix;
exports.binaryRight = binaryRight;
exports.binaryLeft = binaryLeft;
exports.combineOperators = combineOperators;
exports.infixOp = infixOp;
exports.prefixOp = prefixOp;
exports.postfixOp = postfixOp;
exports.ofOp = ofOp;
exports.makeError = makeError;
exports.andExpr = andExpr;
exports.orExpr = orExpr;
exports.testExpr = testExpr;
exports.invertExpr = invertExpr;
exports.strLenSortFn = strLenSortFn;
exports.getPropertyRules = getPropertyRules;
exports.getNamedPropertyRules = getNamedPropertyRules;
exports.getKeywordRules = getKeywordRules;
exports.getFunctionRules = getFunctionRules;
exports.getPropertyNameRules = getPropertyNameRules;
exports.getReservedWords = getReservedWords;
exports.atomNameSet = atomNameSet;
exports.asAtoms = asAtoms;
exports.wrapValue = wrapValue;
exports.testLevel = testLevel;
exports.valuesTest = valuesTest;
exports.resnameExpr = resnameExpr;
const tslib_1 = require("tslib");
const P = tslib_1.__importStar(require("../../mol-util/monadic-parser"));
const builder_1 = require("../../mol-script/language/builder");
const B = builder_1.MolScriptBuilder;
const string_1 = require("../../mol-util/string");
Object.defineProperty(exports, "escapeRegExp", { enumerable: true, get: function () { return string_1.escapeRegExp; } });
// Takes a parser for the prefix operator, and a parser for the base thing being
// parsed, and parses as many occurrences as possible of the prefix operator.
// Note that the parser is created using `P.lazy` because it's recursive. It's
// valid for there to be zero occurrences of the prefix operator.
function prefix(opParser, nextParser, mapFn) {
    const parser = P.MonadicParser.lazy(() => {
        return P.MonadicParser.seq(opParser, parser)
            .map(x => mapFn(...x))
            .or(nextParser);
    });
    return parser;
}
// Ideally this function would be just like `PREFIX` but reordered like
// `P.seq(parser, opParser).or(nextParser)`, but that doesn't work. The
// reason for that is that Parsimmon will get stuck in infinite recursion, since
// the very first rule. Inside `parser` is to match parser again. Alternatively,
// you might think to try `nextParser.or(P.seq(parser, opParser))`, but
// that won't work either because in a call to `.or` (aka `P.alt`), Parsimmon
// takes the first possible match, even if subsequent matches are longer, so the
// parser will never actually look far enough ahead to see the postfix
// operators.
function postfix(opParser, nextParser, mapFn) {
    // Because we can't use recursion like stated above, we just match a flat list
    // of as many occurrences of the postfix operator as possible, then use
    // `.reduce` to manually nest the list.
    //
    // Example:
    //
    // INPUT  :: "4!!!"
    // PARSE  :: [4, "factorial", "factorial", "factorial"]
    // REDUCE :: ["factorial", ["factorial", ["factorial", 4]]]
    return P.MonadicParser.seqMap(nextParser, opParser.many(), (x, suffixes) => suffixes.reduce((acc, x) => {
        return mapFn(x, acc);
    }, x));
}
// Takes a parser for all the operators at this precedence level, and a parser
// that parsers everything at the next precedence level, and returns a parser
// that parses as many binary operations as possible, associating them to the
// right. (e.g. 1^2^3 is 1^(2^3) not (1^2)^3)
function binaryRight(opParser, nextParser, mapFn) {
    const parser = P.MonadicParser.lazy(() => nextParser.chain(next => P.MonadicParser.seq(opParser, P.MonadicParser.of(next), parser).map((x) => {
        return x;
    }).or(P.MonadicParser.of(next))));
    return parser;
}
// Takes a parser for all the operators at this precedence level, and a parser
// that parsers everything at the next precedence level, and returns a parser
// that parses as many binary operations as possible, associating them to the
// left. (e.g. 1-2-3 is (1-2)-3 not 1-(2-3))
function binaryLeft(opParser, nextParser, mapFn) {
    // We run into a similar problem as with the `POSTFIX` parser above where we
    // can't recurse in the direction we want, so we have to resort to parsing an
    // entire list of operator chunks and then using `.reduce` to manually nest
    // them again.
    //
    // Example:
    //
    // INPUT  :: "1+2+3"
    // PARSE  :: [1, ["+", 2], ["+", 3]]
    // REDUCE :: ["+", ["+", 1, 2], 3]
    return P.MonadicParser.seqMap(nextParser, P.MonadicParser.seq(opParser, nextParser).many(), (first, rest) => {
        return rest.reduce((acc, ch) => {
            const [op, another] = ch;
            return mapFn(op, acc, another);
        }, first);
    });
}
/**
 * combine operators of decreasing binding strength
 */
function combineOperators(opList, rule) {
    const x = opList.reduce((acc, level) => {
        const map = level.isUnsupported ? makeError(`operator '${level.name}' not supported`) : level.map;
        return level.type(level.rule, acc, map);
    }, rule);
    return x;
}
function infixOp(re, group = 0) {
    return P.MonadicParser.optWhitespace.then(P.MonadicParser.regexp(re, group).skip(P.MonadicParser.optWhitespace));
}
function prefixOp(re, group = 0) {
    return P.MonadicParser.regexp(re, group).skip(P.MonadicParser.optWhitespace);
}
function postfixOp(re, group = 0) {
    return P.MonadicParser.optWhitespace.then(P.MonadicParser.regexp(re, group));
}
function ofOp(name, short) {
    const op = short ? `${name}|${(0, string_1.escapeRegExp)(short)}` : name;
    const re = RegExp(`(${op})\\s+([-+]?[0-9]*\\.?[0-9]+)\\s+OF`, 'i');
    return infixOp(re, 2).map(parseFloat);
}
function makeError(msg) {
    return function () {
        throw new Error(msg);
    };
}
function andExpr(selections) {
    if (selections.length === 1) {
        return selections[0];
    }
    else if (selections.length > 1) {
        return B.core.logic.and(selections);
    }
    else {
        return undefined;
    }
}
function orExpr(selections) {
    if (selections.length === 1) {
        return selections[0];
    }
    else if (selections.length > 1) {
        return B.core.logic.or(selections);
    }
    else {
        return undefined;
    }
}
function testExpr(property, args) {
    if (args && args.op !== undefined && args.val !== undefined) {
        const opArgs = [property, args.val];
        switch (args.op) {
            case '=': return B.core.rel.eq(opArgs);
            case '!=': return B.core.rel.neq(opArgs);
            case '>': return B.core.rel.gr(opArgs);
            case '<': return B.core.rel.lt(opArgs);
            case '>=': return B.core.rel.gre(opArgs);
            case '<=': return B.core.rel.lte(opArgs);
            default: throw new Error(`operator '${args.op}' not supported`);
        }
    }
    else if (args && args.flags !== undefined) {
        return B.core.flags.hasAny([property, args.flags]);
    }
    else if (args && args.min !== undefined && args.max !== undefined) {
        return B.core.rel.inRange([property, args.min, args.max]);
    }
    else if (!Array.isArray(args)) {
        return B.core.rel.eq([property, args]);
    }
    else if (args.length > 1) {
        return B.core.set.has([B.core.type.set(args), property]);
    }
    else {
        return B.core.rel.eq([property, args[0]]);
    }
}
function invertExpr(selection) {
    return B.struct.generator.queryInSelection({
        0: selection, query: B.struct.generator.all(), 'in-complement': true
    });
}
function strLenSortFn(a, b) {
    return a.length < b.length ? 1 : -1;
}
function getNamesRegex(name, abbr) {
    const names = (abbr ? [name].concat(abbr) : [name])
        .sort(strLenSortFn).map(string_1.escapeRegExp).join('|');
    return RegExp(`${names}`, 'i');
}
function getPropertyRules(properties) {
    // in keyof typeof properties
    const propertiesDict = {};
    Object.keys(properties).sort(strLenSortFn).forEach(name => {
        const ps = properties[name];
        const errorFn = makeError(`property '${name}' not supported`);
        const rule = P.MonadicParser.regexp(ps.regex).map((x) => {
            if (ps.isUnsupported)
                errorFn();
            return testExpr(ps.property, ps.map(x));
        });
        if (!ps.isNumeric) {
            propertiesDict[name] = rule;
        }
    });
    return propertiesDict;
}
function getNamedPropertyRules(properties) {
    const namedPropertiesList = [];
    Object.keys(properties).sort(strLenSortFn).forEach(name => {
        const ps = properties[name];
        const errorFn = makeError(`property '${name}' not supported`);
        const rule = P.MonadicParser.regexp(ps.regex).map((x) => {
            if (ps.isUnsupported)
                errorFn();
            return testExpr(ps.property, ps.map(x));
        });
        const nameRule = P.MonadicParser.regexp(getNamesRegex(name, ps.abbr)).trim(P.MonadicParser.optWhitespace);
        const groupMap = (x) => B.struct.generator.atomGroups({ [ps.level]: x });
        if (ps.isNumeric) {
            namedPropertiesList.push(nameRule.then(P.MonadicParser.seq(P.MonadicParser.regexp(/>=|<=|=|!=|>|</).trim(P.MonadicParser.optWhitespace), P.MonadicParser.regexp(ps.regex).map(ps.map))).map((x) => {
                if (ps.isUnsupported)
                    errorFn();
                return testExpr(ps.property, { op: x[0], val: x[1] });
            }).map(groupMap));
        }
        else {
            namedPropertiesList.push(nameRule.then(rule).map(groupMap));
        }
    });
    return namedPropertiesList;
}
function getKeywordRules(keywords) {
    const keywordsList = [];
    Object.keys(keywords).sort(strLenSortFn).forEach(name => {
        const ks = keywords[name];
        const mapFn = ks.map ? ks.map : makeError(`keyword '${name}' not supported`);
        const rule = P.MonadicParser.regexp(getNamesRegex(name, ks.abbr)).map(mapFn);
        keywordsList.push(rule);
    });
    return keywordsList;
}
function getFunctionRules(functions, argRule) {
    const functionsList = [];
    const begRule = P.MonadicParser.regexp(/\(\s*/);
    const endRule = P.MonadicParser.regexp(/\s*\)/);
    Object.keys(functions).sort(strLenSortFn).forEach(name => {
        const fs = functions[name];
        const mapFn = fs.map ? fs.map : makeError(`function '${name}' not supported`);
        const rule = P.MonadicParser.regexp(new RegExp(name, 'i')).skip(begRule).then(argRule).skip(endRule).map(mapFn);
        functionsList.push(rule);
    });
    return functionsList;
}
function getPropertyNameRules(properties, lookahead) {
    const list = [];
    Object.keys(properties).sort(strLenSortFn).forEach(name => {
        const ps = properties[name];
        const errorFn = makeError(`property '${name}' not supported`);
        const rule = P.MonadicParser.regexp(getNamesRegex(name, ps.abbr)).lookahead(lookahead).map(() => {
            if (ps.isUnsupported)
                errorFn();
            return ps.property;
        });
        list.push(rule);
    });
    return list;
}
function getReservedWords(properties, keywords, operators, functions) {
    const w = [];
    for (const name in properties) {
        w.push(name);
        if (properties[name].abbr)
            w.push(...properties[name].abbr);
    }
    for (const name in keywords) {
        w.push(name);
        if (keywords[name].abbr)
            w.push(...keywords[name].abbr);
    }
    operators.forEach(o => {
        w.push(o.name);
        if (o.abbr)
            w.push(...o.abbr);
    });
    return w;
}
function atomNameSet(ids) {
    return B.core.type.set(ids.map(B.atomName));
}
function asAtoms(e) {
    return B.struct.generator.queryInSelection({
        0: e,
        query: B.struct.generator.all()
    });
}
function wrapValue(property, value, sstrucDict) {
    switch (property.head.name) {
        case 'structure-query.atom-property.macromolecular.label_atom_id':
            return B.atomName(value);
        case 'structure-query.atom-property.core.element-symbol':
            return B.es(value);
        case 'structure-query.atom-property.macromolecular.secondary-structure-flags':
            if (sstrucDict) {
                value = [sstrucDict[value.toUpperCase()] || 'none'];
            }
            return B.struct.type.secondaryStructureFlags([value]);
        default:
            return value;
    }
}
const propPrefix = 'structure-query.atom-property.macromolecular.';
const entityProps = ['entityKey', 'label_entity_id', 'entityType'];
const chainProps = ['chainKey', 'label_asym_id', 'label_entity_id', 'auth_asym_id', 'entityType'];
const residueProps = ['residueKey', 'label_comp_id', 'label_seq_id', 'auth_comp_id', 'auth_seq_id', 'pdbx_formal_charge', 'secondaryStructureKey', 'secondaryStructureFlags', 'isModified', 'modifiedParentName'];
function testLevel(property) {
    if (property.head.name.startsWith(propPrefix)) {
        const name = property.head.name.substr(propPrefix.length);
        if (entityProps.includes(name))
            return 'entity-test';
        if (chainProps.includes(name))
            return 'chain-test';
        if (residueProps.includes(name))
            return 'residue-test';
    }
    return 'atom-test';
}
const flagProps = [
    'structure-query.atom-property.macromolecular.secondary-structure-flags'
];
function valuesTest(property, values) {
    if (flagProps.includes(property.head.name)) {
        const name = values[0].head;
        const flags = [];
        values.forEach(v => flags.push(...v.args[0]));
        return B.core.flags.hasAny([property, { head: name, args: flags }]);
    }
    else {
        if (values.length === 1) {
            return B.core.rel.eq([property, values[0]]);
        }
        else if (values.length > 1) {
            return B.core.set.has([B.core.type.set(values), property]);
        }
    }
}
function resnameExpr(resnameList) {
    return B.struct.generator.atomGroups({
        'residue-test': B.core.set.has([
            B.core.type.set(resnameList),
            B.ammp('label_comp_id')
        ])
    });
}
