/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Structure, StructureSelection as Sel, QueryContext } from '../../mol-model/structure';
import { Script } from '../../mol-script/script';
import { compile } from '../../mol-script/runtime/query/compiler';
export { StructureQueryHelper };
var StructureQueryHelper;
(function (StructureQueryHelper) {
    function isUnchanged(entry, query, structure) {
        if (entry.currentStructure !== structure)
            return false;
        if (Script.is(query)) {
            return !!entry.script && Script.areEqual(entry.script, query);
        }
        return entry.expression === query;
    }
    StructureQueryHelper.isUnchanged = isUnchanged;
    function create(structure, query) {
        const script = Script.is(query) ? query : void 0;
        const expression = Script.is(query) ? Script.toExpression(query) : query;
        const compiled = compile(expression);
        return { script, expression, compiled, originalStructure: structure, currentStructure: structure };
    }
    StructureQueryHelper.create = create;
    function run(entry, structure) {
        return entry.compiled(new QueryContext(structure));
    }
    StructureQueryHelper.run = run;
    function createAndRun(structure, query) {
        const entry = create(structure, query);
        return { entry, selection: run(entry, structure) };
    }
    StructureQueryHelper.createAndRun = createAndRun;
    function updateStructure(entry, structure) {
        entry.currentStructure = structure;
        return entry.compiled(new QueryContext(structure));
    }
    StructureQueryHelper.updateStructure = updateStructure;
    function updateStructureObject(obj, selection, label) {
        const s = Sel.unionStructure(selection);
        obj.label = `${label || 'Selection'}`;
        obj.description = Structure.elementDescription(s);
        obj.data = s;
    }
    StructureQueryHelper.updateStructureObject = updateStructureObject;
})(StructureQueryHelper || (StructureQueryHelper = {}));
