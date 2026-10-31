/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { transpileMolScript } from './script/mol-script/symbols';
import { parseMolScript } from './language/parser';
import { parse } from './transpile';
import { QueryContext, StructureSelection } from '../mol-model/structure';
import { compile } from './runtime/query/compiler';
import { MolScriptBuilder } from './language/builder';
import { assertUnreachable } from '../mol-util/type-helpers';
export { Script };
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
                const parsed = parseMolScript(script.expression);
                if (parsed.length === 0)
                    throw new Error('No query');
                return transpileMolScript(parsed[0]);
            case 'pymol':
            case 'jmol':
            case 'vmd':
                return parse(script.language, script.expression);
            default:
                assertUnreachable(script.language);
        }
    }
    Script.toExpression = toExpression;
    function toQuery(script) {
        const expression = toExpression(script);
        return compile(expression);
    }
    Script.toQuery = toQuery;
    function toLoci(script, structure) {
        const query = toQuery(script);
        const result = query(new QueryContext(structure));
        return StructureSelection.toLociWithSourceUnits(result);
    }
    Script.toLoci = toLoci;
    function getStructureSelection(expr, structure, options) {
        const e = typeof expr === 'function' ? expr(MolScriptBuilder) : expr;
        const query = compile(e);
        return query(new QueryContext(structure, options));
    }
    Script.getStructureSelection = getStructureSelection;
})(Script || (Script = {}));
