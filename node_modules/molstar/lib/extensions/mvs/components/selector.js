/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { SortedArray } from '../../../mol-data/int';
import { Structure, StructureElement } from '../../../mol-model/structure';
import { StaticStructureComponentTypes, createStructureComponent } from '../../../mol-plugin-state/helpers/structure-component';
import { PluginStateObject } from '../../../mol-plugin-state/objects';
import { MolScriptBuilder } from '../../../mol-script/language/builder';
import { arrayExtend, sortIfNeeded } from '../../../mol-util/array';
import { mapArrayToObject, pickObjectKeys } from '../../../mol-util/object';
import { Choice } from '../../../mol-util/param-choice';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { capitalize } from '../../../mol-util/string';
import { MVSAnnotationStructureComponentParams, createMVSAnnotationStructureComponent } from './annotation-structure-component';
/** Allowed values for a static selector */
export const StaticSelectorChoice = new Choice(mapArrayToObject(StaticStructureComponentTypes, t => capitalize(t)), 'all');
/** Parameter definition for specifying a part of structure (kinda extension of `StructureComponentParams` from mol-plugin-state/helpers/structure-component) */
export const SelectorParams = PD.MappedStatic('static', {
    static: StaticSelectorChoice.PDSelect(),
    expression: PD.Value(MolScriptBuilder.struct.generator.all),
    bundle: PD.Value(StructureElement.Bundle.Empty),
    script: PD.Script({ language: 'mol-script', expression: '(sel.atom.all)' }),
    annotation: PD.Group(pickObjectKeys(MVSAnnotationStructureComponentParams, ['annotationId', 'fieldName', 'fieldValues'])),
}, { description: 'Define a part of the structure where this layer applies (use Static:all to apply to the whole structure)' });
/** `Selector` for selecting the whole structure */
export const SelectorAll = { name: 'static', params: 'all' };
/** Decide whether a selector is `SelectorAll` */
export function isSelectorAll(props) {
    return props.name === 'static' && props.params === 'all';
}
export const ElementSet = {
    /** Create an `ElementSet` from the substructure of `structure` defined by `selector` */
    fromSelector(structure, selector) {
        var _a;
        var _b;
        if (!structure)
            return {};
        const arrays = {};
        const selection = substructureFromSelector(structure, selector); // using `getAtomRangesForRow` might (might not) be faster here
        for (const unit of selection.units) {
            arrayExtend((_a = arrays[_b = unit.model.id]) !== null && _a !== void 0 ? _a : (arrays[_b] = []), unit.elements);
        }
        const result = {};
        for (const modelId in arrays) {
            const array = arrays[modelId];
            sortIfNeeded(array, (a, b) => a - b);
            result[modelId] = SortedArray.ofSortedArray(array);
        }
        return result;
    },
    /** Decide if the element set `set` contains structure element location `location` */
    has(set, location) {
        const array = set[location.unit.model.id];
        return array ? SortedArray.has(array, location.element) : false;
    },
};
/** Return a substructure of `structure` defined by `selector` */
export function substructureFromSelector(structure, selector) {
    const pso = (selector.name === 'annotation') ?
        createMVSAnnotationStructureComponent(structure, { ...selector.params, label: '', nullIfEmpty: false })
        : createStructureComponent(structure, { type: selector, label: '', nullIfEmpty: false }, { source: structure });
    return PluginStateObject.Molecule.Structure.is(pso) ? pso.data : Structure.Empty;
}
