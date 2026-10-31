"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Script = Script;
const symbols_1 = require("./script/mol-script/symbols");
const parser_1 = require("./language/parser");
const transpile_1 = require("./transpile");
const structure_1 = require("../mol-model/structure");
const compiler_1 = require("./runtime/query/compiler");
const builder_1 = require("./language/builder");
const type_helpers_1 = require("../mol-util/type-helpers");
function Script(expression, language) {
    return { expression, language };
}
(function (Script) {
    Script.Info = {
        'mol-script': 'Mol-Script',
        'pymol': 'PyMOL',
        'vmd': 'VMD',
        'jmol': 'Jmol',
    };
    function is(x) {
        return !!x && typeof x.expression === 'string' && !!x.language;
    }
    Script.is = is;
    function areEqual(a, b) {
        return a.language === b.language && a.expression === b.expression;
    }
    Script.areEqual = areEqual;
    function toExpression(script) {
        switch (script.language) {
            case 'mol-script':
                const parsed = (0, parser_1.parseMolScript)(script.expression);
                if (parsed.length === 0)
                    throw new Error('No query');
                return (0, symbols_1.transpileMolScript)(parsed[0]);
            case 'pymol':
            case 'jmol':
            case 'vmd':
                return (0, transpile_1.parse)(script.language, script.expression);
            default:
                (0, type_helpers_1.assertUnreachable)(script.language);
        }
    }
    Script.toExpression = toExpression;
    function toQuery(script) {
        const expression = toExpression(script);
        return (0, compiler_1.compile)(expression);
    }
    Script.toQuery = toQuery;
    function toLoci(script, structure) {
        const query = toQuery(script);
        const result = query(new structure_1.QueryContext(structure));
        return structure_1.StructureSelection.toLociWithSourceUnits(result);
    }
    Script.toLoci = toLoci;
    function getStructureSelection(expr, structure, options) {
        const e = typeof expr === 'function' ? expr(builder_1.MolScriptBuilder) : expr;
        const query = (0, compiler_1.compile)(e);
        return query(new structure_1.QueryContext(structure, options));
    }
    Script.getStructureSelection = getStructureSelection;
})(Script || (exports.Script = Script = {}));
