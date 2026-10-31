"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureSelection = void 0;
const generic_1 = require("../../../mol-data/generic");
const structure_1 = require("../structure");
const structure_set_1 = require("./utils/structure-set");
const int_1 = require("../../../mol-data/int");
var StructureSelection;
(function (StructureSelection) {
    function Singletons(source, structure) { return { kind: 'singletons', source, structure }; }
    StructureSelection.Singletons = Singletons;
    function Sequence(source, structures) { return { kind: 'sequence', source, structures }; }
    StructureSelection.Sequence = Sequence;
    function Empty(source) { return Singletons(source, structure_1.Structure.Empty); }
    StructureSelection.Empty = Empty;
    ;
    function isSingleton(s) { return s.kind === 'singletons'; }
    StructureSelection.isSingleton = isSingleton;
    function isEmpty(s) { return isSingleton(s) ? s.structure.units.length === 0 : s.structures.length === 0; }
    StructureSelection.isEmpty = isEmpty;
    function structureCount(sel) {
        if (isSingleton(sel))
            return sel.structure.elementCount;
        return sel.structures.length;
    }
    StructureSelection.structureCount = structureCount;
    function unionStructure(sel) {
        if (isEmpty(sel))
            return structure_1.Structure.Empty;
        if (isSingleton(sel))
            return sel.structure;
        return (0, structure_set_1.structureUnion)(sel.source, sel.structures);
    }
    StructureSelection.unionStructure = unionStructure;
    /** Convert selection to loci and use "current structure units" in Loci elements */
    function toLociWithCurrentUnits(sel) {
        const elements = [];
        const { unitMap } = sel.source;
        for (const unit of unionStructure(sel).units) {
            if (unit === unitMap.get(unit.id)) {
                elements[elements.length] = {
                    unit,
                    indices: int_1.OrderedSet.ofBounds(0, unit.elements.length)
                };
            }
            else {
                elements[elements.length] = {
                    unit,
                    indices: int_1.OrderedSet.ofSortedArray(int_1.SortedArray.indicesOf(unitMap.get(unit.id).elements, unit.elements))
                };
            }
        }
        return structure_1.StructureElement.Loci(sel.source, elements);
    }
    StructureSelection.toLociWithCurrentUnits = toLociWithCurrentUnits;
    /** use source unit in loci.elements */
    function toLociWithSourceUnits(sel) {
        const elements = [];
        const { unitMap } = sel.source;
        for (const _unit of unionStructure(sel).units) {
            const unit = unitMap.get(_unit.id);
            if (unit === _unit) {
                elements[elements.length] = {
                    unit,
                    indices: int_1.OrderedSet.ofBounds(0, unit.elements.length)
                };
            }
            else {
                elements[elements.length] = {
                    unit,
                    indices: int_1.OrderedSet.ofSortedArray(int_1.SortedArray.indicesOf(unit.elements, _unit.elements))
                };
            }
        }
        return structure_1.StructureElement.Loci(sel.source, elements);
    }
    StructureSelection.toLociWithSourceUnits = toLociWithSourceUnits;
    function getSelection(source, structures, allSingletons) {
        const len = structures.length;
        if (len === 0)
            return Empty(source);
        if (allSingletons)
            return Singletons(source, (0, structure_set_1.structureUnion)(source, structures));
        return Sequence(source, structures);
    }
    class LinearBuilderImpl {
        add(structure) {
            const elementCount = structure.elementCount;
            if (elementCount === 0)
                return;
            this.structures[this.structures.length] = structure;
            if (elementCount !== 1)
                this.allSingletons = false;
        }
        getSelection() { return getSelection(this.source, this.structures, this.allSingletons); }
        constructor(source) {
            this.source = source;
            this.structures = [];
            this.allSingletons = true;
        }
    }
    class HashBuilderImpl {
        add(structure) {
            const atomCount = structure.elementCount;
            if (atomCount === 0 || !this.uniqueSets.add(structure))
                return;
            this.structures[this.structures.length] = structure;
            if (atomCount !== 1)
                this.allSingletons = false;
        }
        getSelection() { return getSelection(this.structure, this.structures, this.allSingletons); }
        constructor(structure) {
            this.structure = structure;
            this.structures = [];
            this.allSingletons = true;
            this.uniqueSets = (0, generic_1.HashSet)(structure_1.Structure.hashCode, structure_1.Structure.areUnitIdsAndIndicesEqual);
        }
    }
    function LinearBuilder(structure) { return new LinearBuilderImpl(structure); }
    StructureSelection.LinearBuilder = LinearBuilder;
    function UniqueBuilder(structure) { return new HashBuilderImpl(structure); }
    StructureSelection.UniqueBuilder = UniqueBuilder;
    // TODO: build timeout checking into this?
    function forEach(sel, fn) {
        let idx = 0;
        if (StructureSelection.isSingleton(sel)) {
            for (const unit of sel.structure.units) {
                const { elements } = unit;
                for (let i = 0, _i = elements.length; i < _i; i++) {
                    // TODO: optimize this somehow???
                    const s = structure_1.Structure.create([unit.getChild(int_1.SortedArray.ofSingleton(elements[i]))], { parent: sel.source });
                    fn(s, idx++);
                }
            }
        }
        else {
            for (const s of sel.structures) {
                fn(s, idx++);
            }
        }
    }
    StructureSelection.forEach = forEach;
    function withInputStructure(selection, structure) {
        if (isSingleton(selection))
            return Singletons(structure, selection.structure);
        return Sequence(structure, selection.structures);
    }
    StructureSelection.withInputStructure = withInputStructure;
    // TODO: spatial lookup?
})(StructureSelection || (exports.StructureSelection = StructureSelection = {}));
