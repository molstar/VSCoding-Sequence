"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureQueryHelper = void 0;
const structure_1 = require("../../mol-model/structure");
const script_1 = require("../../mol-script/script");
const compiler_1 = require("../../mol-script/runtime/query/compiler");
var StructureQueryHelper;
(function (StructureQueryHelper) {
    function isUnchanged(entry, query, structure) {
        if (entry.currentStructure !== structure)
            return false;
        if (script_1.Script.is(query)) {
            return !!entry.script && script_1.Script.areEqual(entry.script, query);
        }
        return entry.expression === query;
    }
    StructureQueryHelper.isUnchanged = isUnchanged;
    function create(structure, query) {
        const script = script_1.Script.is(query) ? query : void 0;
        const expression = script_1.Script.is(query) ? script_1.Script.toExpression(query) : query;
        const compiled = (0, compiler_1.compile)(expression);
        return { script, expression, compiled, originalStructure: structure, currentStructure: structure };
    }
    StructureQueryHelper.create = create;
    function run(entry, structure) {
        return entry.compiled(new structure_1.QueryContext(structure));
    }
    StructureQueryHelper.run = run;
    function createAndRun(structure, query) {
        const entry = create(structure, query);
        return { entry, selection: run(entry, structure) };
    }
    StructureQueryHelper.createAndRun = createAndRun;
    function updateStructure(entry, structure) {
        entry.currentStructure = structure;
        return entry.compiled(new structure_1.QueryContext(structure));
    }
    StructureQueryHelper.updateStructure = updateStructure;
    function updateStructureObject(obj, selection, label) {
        const s = structure_1.StructureSelection.unionStructure(selection);
        obj.label = `${label || 'Selection'}`;
        obj.description = structure_1.Structure.elementDescription(s);
        obj.data = s;
    }
    StructureQueryHelper.updateStructureObject = updateStructureObject;
})(StructureQueryHelper || (exports.StructureQueryHelper = StructureQueryHelper = {}));
