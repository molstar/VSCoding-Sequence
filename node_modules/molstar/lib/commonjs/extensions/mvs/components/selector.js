"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementSet = exports.SelectorAll = exports.SelectorParams = exports.StaticSelectorChoice = void 0;
exports.isSelectorAll = isSelectorAll;
exports.substructureFromSelector = substructureFromSelector;
const int_1 = require("../../../mol-data/int");
const structure_1 = require("../../../mol-model/structure");
const structure_component_1 = require("../../../mol-plugin-state/helpers/structure-component");
const objects_1 = require("../../../mol-plugin-state/objects");
const builder_1 = require("../../../mol-script/language/builder");
const array_1 = require("../../../mol-util/array");
const object_1 = require("../../../mol-util/object");
const param_choice_1 = require("../../../mol-util/param-choice");
const param_definition_1 = require("../../../mol-util/param-definition");
const string_1 = require("../../../mol-util/string");
const annotation_structure_component_1 = require("./annotation-structure-component");
/** Allowed values for a static selector */
exports.StaticSelectorChoice = new param_choice_1.Choice((0, object_1.mapArrayToObject)(structure_component_1.StaticStructureComponentTypes, t => (0, string_1.capitalize)(t)), 'all');
/** Parameter definition for specifying a part of structure (kinda extension of `StructureComponentParams` from mol-plugin-state/helpers/structure-component) */
exports.SelectorParams = param_definition_1.ParamDefinition.MappedStatic('static', {
    static: exports.StaticSelectorChoice.PDSelect(),
    expression: param_definition_1.ParamDefinition.Value(builder_1.MolScriptBuilder.struct.generator.all),
    bundle: param_definition_1.ParamDefinition.Value(structure_1.StructureElement.Bundle.Empty),
    script: param_definition_1.ParamDefinition.Script({ language: 'mol-script', expression: '(sel.atom.all)' }),
    annotation: param_definition_1.ParamDefinition.Group((0, object_1.pickObjectKeys)(annotation_structure_component_1.MVSAnnotationStructureComponentParams, ['annotationId', 'fieldName', 'fieldValues'])),
}, { description: 'Define a part of the structure where this layer applies (use Static:all to apply to the whole structure)' });
/** `Selector` for selecting the whole structure */
exports.SelectorAll = { name: 'static', params: 'all' };
/** Decide whether a selector is `SelectorAll` */
function isSelectorAll(props) {
    return props.name === 'static' && props.params === 'all';
}
exports.ElementSet = {
    /** Create an `ElementSet` from the substructure of `structure` defined by `selector` */
    fromSelector(structure, selector) {
        var _a;
        var _b;
        if (!structure)
            return {};
        const arrays = {};
        const selection = substructureFromSelector(structure, selector); // using `getAtomRangesForRow` might (might not) be faster here
        for (const unit of selection.units) {
            (0, array_1.arrayExtend)((_a = arrays[_b = unit.model.id]) !== null && _a !== void 0 ? _a : (arrays[_b] = []), unit.elements);
        }
        const result = {};
        for (const modelId in arrays) {
            const array = arrays[modelId];
            (0, array_1.sortIfNeeded)(array, (a, b) => a - b);
            result[modelId] = int_1.SortedArray.ofSortedArray(array);
        }
        return result;
    },
    /** Decide if the element set `set` contains structure element location `location` */
    has(set, location) {
        const array = set[location.unit.model.id];
        return array ? int_1.SortedArray.has(array, location.element) : false;
    },
};
/** Return a substructure of `structure` defined by `selector` */
function substructureFromSelector(structure, selector) {
    const pso = (selector.name === 'annotation') ?
        (0, annotation_structure_component_1.createMVSAnnotationStructureComponent)(structure, { ...selector.params, label: '', nullIfEmpty: false })
        : (0, structure_component_1.createStructureComponent)(structure, { type: selector, label: '', nullIfEmpty: false }, { source: structure });
    return objects_1.PluginStateObject.Molecule.Structure.is(pso) ? pso.data : structure_1.Structure.Empty;
}
