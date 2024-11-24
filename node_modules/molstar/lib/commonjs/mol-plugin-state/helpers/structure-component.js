"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureComponentParams = exports.StaticStructureComponentTypes = void 0;
exports.createStructureComponent = createStructureComponent;
exports.updateStructureComponent = updateStructureComponent;
const param_definition_1 = require("../../mol-util/param-definition");
const builder_1 = require("../../mol-script/language/builder");
const structure_1 = require("../../mol-model/structure");
const structure_query_1 = require("./structure-query");
const objects_1 = require("../objects");
const structure_selection_query_1 = require("./structure-selection-query");
const mol_state_1 = require("../../mol-state");
const script_1 = require("../../mol-script/script");
const type_helpers_1 = require("../../mol-util/type-helpers");
exports.StaticStructureComponentTypes = [
    'all',
    'polymer',
    'protein',
    'nucleic',
    'water',
    'ion',
    'lipid',
    'branched',
    'ligand',
    'non-standard',
    'coarse'
];
const StructureComponentParams = () => ({
    type: param_definition_1.ParamDefinition.MappedStatic('static', {
        static: param_definition_1.ParamDefinition.Text('polymer'),
        expression: param_definition_1.ParamDefinition.Value(builder_1.MolScriptBuilder.struct.generator.all),
        bundle: param_definition_1.ParamDefinition.Value(structure_1.StructureElement.Bundle.Empty),
        script: param_definition_1.ParamDefinition.Script({ language: 'mol-script', expression: '(sel.atom.all)' }),
    }, { isHidden: true }),
    nullIfEmpty: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Boolean(true, { isHidden: true })),
    label: param_definition_1.ParamDefinition.Text('', { isHidden: true })
});
exports.StructureComponentParams = StructureComponentParams;
function createStructureComponent(a, params, cache) {
    cache.source = a;
    let component = structure_1.Structure.Empty;
    let label = void 0;
    switch (params.type.name) {
        case 'static': {
            let query;
            switch (params.type.params) {
                case 'all':
                    query = structure_selection_query_1.StructureSelectionQueries.all.query;
                    label = 'All';
                    break;
                case 'polymer':
                    query = structure_selection_query_1.StructureSelectionQueries.polymer.query;
                    label = 'Polymer';
                    break;
                case 'protein':
                    query = structure_selection_query_1.StructureSelectionQueries.protein.query;
                    label = 'Protein';
                    break;
                case 'nucleic':
                    query = structure_selection_query_1.StructureSelectionQueries.nucleic.query;
                    label = 'Nucleic';
                    break;
                case 'water':
                    query = structure_1.Queries.internal.water();
                    label = 'Water';
                    break;
                case 'ion':
                    query = structure_selection_query_1.StructureSelectionQueries.ion.query;
                    label = 'Ion';
                    break;
                case 'lipid':
                    query = structure_selection_query_1.StructureSelectionQueries.lipid.query;
                    label = 'Lipid';
                    break;
                case 'branched':
                    query = structure_selection_query_1.StructureSelectionQueries.branchedPlusConnected.query;
                    label = 'Branched';
                    break;
                case 'ligand':
                    query = structure_selection_query_1.StructureSelectionQueries.ligandPlusConnected.query;
                    label = 'Ligand';
                    break;
                case 'non-standard':
                    query = structure_selection_query_1.StructureSelectionQueries.nonStandardPolymer.query;
                    label = 'Non-standard';
                    break;
                case 'coarse':
                    query = structure_selection_query_1.StructureSelectionQueries.coarse.query;
                    label = 'Coarse';
                    break;
                default: (0, type_helpers_1.assertUnreachable)(params.type);
            }
            const result = query(new structure_1.QueryContext(a));
            component = structure_1.StructureSelection.unionStructure(result);
            break;
        }
        case 'script':
        case 'expression': {
            const { selection, entry } = structure_query_1.StructureQueryHelper.createAndRun(a, params.type.params);
            cache.entry = entry;
            component = structure_1.StructureSelection.unionStructure(selection);
            break;
        }
        case 'bundle': {
            if (params.type.params.hash !== a.hashCode)
                break;
            component = structure_1.StructureElement.Bundle.toStructure(params.type.params, a);
            break;
        }
    }
    if (params.nullIfEmpty && component.elementCount === 0)
        return mol_state_1.StateObject.Null;
    const props = { label: `${params.label || label || 'Component'}`, description: structure_1.Structure.elementDescription(component) };
    return new objects_1.PluginStateObject.Molecule.Structure(component, props);
}
function updateStructureComponent(a, b, oldParams, newParams, cache) {
    if (oldParams.type.name !== newParams.type.name)
        return mol_state_1.StateTransformer.UpdateResult.Recreate;
    let updated = false;
    switch (newParams.type.name) {
        case 'static': {
            if (oldParams.type.params !== newParams.type.params) {
                return mol_state_1.StateTransformer.UpdateResult.Recreate;
            }
            if (!structure_1.Structure.areEquivalent(a, cache.source)) {
                return mol_state_1.StateTransformer.UpdateResult.Recreate;
            }
            if (b.data.model === a.model)
                return mol_state_1.StateTransformer.UpdateResult.Unchanged;
            if (!structure_1.Model.areHierarchiesEqual(a.model, b.data.model))
                return mol_state_1.StateTransformer.UpdateResult.Recreate;
            b.data = b.data.remapModel(a.model);
            return mol_state_1.StateTransformer.UpdateResult.Updated;
        }
        case 'script':
            if (!script_1.Script.areEqual(oldParams.type.params, newParams.type.params)) {
                return mol_state_1.StateTransformer.UpdateResult.Recreate;
            }
        case 'expression': {
            if (oldParams.type.params !== newParams.type.params) {
                return mol_state_1.StateTransformer.UpdateResult.Recreate;
            }
            if (a === cache.source)
                break;
            const entry = cache.entry;
            const selection = structure_query_1.StructureQueryHelper.updateStructure(entry, a);
            cache.source = a;
            b.data = structure_1.StructureSelection.unionStructure(selection);
            structure_query_1.StructureQueryHelper.updateStructureObject(b, selection, newParams.label);
            updated = true;
            break;
        }
        case 'bundle': {
            if (a === cache.source && structure_1.StructureElement.Bundle.areEqual(oldParams.type.params, newParams.type.params)) {
                break;
            }
            cache.source = a;
            if (newParams.type.params.hash !== a.hashCode) {
                updated = b.data.elementCount !== 0;
                b.data = b.data.elementCount === 0 ? b.data : structure_1.Structure.Empty;
            }
            else {
                updated = true;
                b.data = structure_1.StructureElement.Bundle.toStructure(newParams.type.params, a);
            }
            break;
        }
    }
    if (updated) {
        if (newParams.nullIfEmpty && b.data.elementCount === 0)
            return mol_state_1.StateTransformer.UpdateResult.Null;
        b.description = structure_1.Structure.elementDescription(b.data);
    }
    if (oldParams.label !== newParams.label) {
        updated = true;
        b.label = `${newParams.label || b.label}`;
    }
    return updated ? mol_state_1.StateTransformer.UpdateResult.Updated : mol_state_1.StateTransformer.UpdateResult.Unchanged;
}
