"use strict";
/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Panagiotis Tourlas <panagiot_tourlov@hotmail.com>
 *
 * Adapted from MolQL project
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.operators = void 0;
const tslib_1 = require("tslib");
const P = tslib_1.__importStar(require("../../../mol-util/monadic-parser"));
const h = tslib_1.__importStar(require("../helper"));
const builder_1 = require("../../../mol-script/language/builder");
const B = builder_1.MolScriptBuilder;
const properties_1 = require("./properties");
const propNames = Object.keys(properties_1.properties).sort(h.strLenSortFn)
    .filter(name => !properties_1.properties[name].isUnsupported).join('|');
exports.operators = [
    {
        '@desc': 'Selects atoms that are not included in s1.',
        '@examples': ['not protein'],
        name: 'not',
        type: h.prefix,
        rule: P.MonadicParser.regexp(/NOT/i).skip(P.MonadicParser.whitespace),
        map: (op, selection) => h.invertExpr(selection),
    },
    {
        '@desc': 'Selects atoms within a specified distance of a selection',
        '@examples': ['within 5 of name FE'],
        name: 'within',
        type: h.prefix,
        rule: h.prefixOp(/WITHIN\s+([-+]?[0-9]*\.?[0-9]+)\s+OF/i, 1).map((x) => parseFloat(x)),
        map: (radius, selection) => {
            return B.struct.modifier.includeSurroundings({ 0: selection, radius });
        }
    },
    {
        '@desc': 'Exclusive within, equivalent to (within 3 of X) and not X',
        '@examples': ['exwithin 10 of resname HEM'],
        name: 'exwithin',
        type: h.prefix,
        rule: h.prefixOp(/EXWITHIN\s+([-+]?[0-9]*\.?[0-9]+)\s+OF/i, 1).map((x) => parseFloat(x)),
        map: (radius, target) => {
            return B.struct.modifier.exceptBy({
                '0': B.struct.modifier.includeSurroundings({ 0: target, radius }),
                by: target
            });
        }
    },
    {
        '@desc': 'Selects atoms which have the same keyword as the atoms in a given selection',
        '@examples': ['same resid as name FE'],
        name: 'same',
        type: h.prefix,
        rule: h.prefixOp(new RegExp(`SAME\\s+(${propNames})\\s+AS`, 'i'), 1).map((x) => properties_1.properties[x].property),
        map: (property, source) => {
            return B.struct.filter.withSameAtomProperties({
                '0': B.struct.generator.all(),
                source,
                property
            });
        }
    },
    {
        '@desc': 'Selects atoms included in both s1 and s2.',
        '@examples': ['backbone and protein'],
        name: 'and',
        type: h.binaryLeft,
        rule: P.MonadicParser.alt(h.infixOp(/AND/i), P.MonadicParser.whitespace),
        map: (op, selection, by) => B.struct.modifier.intersectBy({ 0: selection, by })
    },
    {
        '@desc': 'Selects atoms included in either s1 or s2.',
        '@examples': ['water or protein'],
        name: 'or',
        type: h.binaryLeft,
        rule: h.infixOp(/OR/i),
        map: (op, s1, s2) => B.struct.combinator.merge([s1, s2])
    }
];
