"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MVSAnnotationStructureComponent = exports.MVSTransform = exports.MVSAnnotationStructureComponentParams = void 0;
exports.createMVSAnnotationSubstructure = createMVSAnnotationSubstructure;
exports.createMVSAnnotationStructureComponent = createMVSAnnotationStructureComponent;
exports.updateMVSAnnotationStructureComponent = updateMVSAnnotationStructureComponent;
const structure_1 = require("../../../mol-model/structure");
const structure_query_1 = require("../../../mol-plugin-state/helpers/structure-query");
const objects_1 = require("../../../mol-plugin-state/objects");
const mol_state_1 = require("../../../mol-state");
const mol_util_1 = require("../../../mol-util");
const object_1 = require("../../../mol-util/object");
const param_definition_1 = require("../../../mol-util/param-definition");
const selections_1 = require("../helpers/selections");
const annotation_prop_1 = require("./annotation-prop");
/** Parameter definition for `MVSAnnotationStructureComponent` transformer */
exports.MVSAnnotationStructureComponentParams = {
    annotationId: param_definition_1.ParamDefinition.Text('', { description: 'Reference to "Annotation" custom model property' }),
    fieldName: param_definition_1.ParamDefinition.Text('component', { description: 'Annotation field (column) from which to take component identifier' }),
    fieldValues: param_definition_1.ParamDefinition.MappedStatic('all', {
        all: param_definition_1.ParamDefinition.EmptyGroup(),
        selected: param_definition_1.ParamDefinition.ObjectList({
            value: param_definition_1.ParamDefinition.Text(),
        }, obj => obj.value),
    }),
    nullIfEmpty: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Boolean(true, { isHidden: false })),
    label: param_definition_1.ParamDefinition.Text('', { isHidden: false }),
};
/** Transformer builder for MVS extension */
exports.MVSTransform = mol_state_1.StateTransformer.builderFactory('mvs');
exports.MVSAnnotationStructureComponent = (0, exports.MVSTransform)({
    name: 'mvs-structure-component-from-annotation',
    display: { name: 'MVS Annotation Component', description: 'A molecular structure component defined by MVS annotation data.' },
    from: objects_1.PluginStateObject.Molecule.Structure,
    to: objects_1.PluginStateObject.Molecule.Structure,
    params: exports.MVSAnnotationStructureComponentParams,
})({
    apply({ a, params }) {
        return createMVSAnnotationStructureComponent(a.data, params);
    },
    update: ({ a, b, oldParams, newParams }) => {
        return updateMVSAnnotationStructureComponent(a.data, b, oldParams, newParams);
    },
    dispose({ b }) {
        b === null || b === void 0 ? void 0 : b.data.customPropertyDescriptors.dispose();
    }
});
/** Create a substructure based on `MVSAnnotationStructureComponentProps` */
function createMVSAnnotationSubstructure(structure, params) {
    const { annotation } = (0, annotation_prop_1.getMVSAnnotationForStructure)(structure, params.annotationId);
    if (annotation) {
        let rows = annotation.getRows();
        if (params.fieldValues.name === 'selected') {
            const selectedValues = new Set(params.fieldValues.params.map(obj => obj.value));
            rows = rows.filter((row, i) => selectedValues.has(annotation.getValueForRow(i, params.fieldName)));
        }
        const expression = (0, selections_1.rowsToExpression)(rows);
        const { selection } = structure_query_1.StructureQueryHelper.createAndRun(structure, expression);
        return structure_1.StructureSelection.unionStructure(selection);
    }
    else {
        return structure_1.Structure.Empty;
    }
}
/** Create a substructure PSO based on `MVSAnnotationStructureComponentProps` */
function createMVSAnnotationStructureComponent(structure, params) {
    const component = createMVSAnnotationSubstructure(structure, params);
    if (params.nullIfEmpty && component.elementCount === 0)
        return mol_state_1.StateObject.Null;
    let label = params.label;
    if (label === undefined || label === '') {
        if (params.fieldValues.name === 'selected' && params.fieldValues.params.length > 0) {
            const values = params.fieldValues.params;
            let valuesStr = `"${values[0].value}"`;
            if (values.length === 2) {
                valuesStr += ` + "${values[1].value}"`;
            }
            else if (values.length > 2) {
                valuesStr += ` + ${values.length - 1} more values`;
            }
            label = `MVS Annotation Component (${params.fieldName}: ${valuesStr})`;
        }
        else {
            label = 'MVS Annotation Component';
        }
    }
    const props = { label, description: structure_1.Structure.elementDescription(component) };
    return new objects_1.PluginStateObject.Molecule.Structure(component, props);
}
/** Update a substructure PSO based on `MVSAnnotationStructureComponentProps` */
function updateMVSAnnotationStructureComponent(a, b, oldParams, newParams) {
    const change = !(0, mol_util_1.deepEqual)(newParams, oldParams);
    const needsRecreate = !(0, mol_util_1.deepEqual)((0, object_1.omitObjectKeys)(newParams, ['label']), (0, object_1.omitObjectKeys)(oldParams, ['label']));
    if (!change) {
        return mol_state_1.StateTransformer.UpdateResult.Unchanged;
    }
    if (!needsRecreate) {
        b.label = newParams.label || b.label;
        return mol_state_1.StateTransformer.UpdateResult.Updated;
    }
    return mol_state_1.StateTransformer.UpdateResult.Recreate;
}
