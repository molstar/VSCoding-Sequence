"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureSubsetBuilder = void 0;
const int_1 = require("../../../../mol-data/int");
const util_1 = require("../../../../mol-data/util");
const symmetry_1 = require("../symmetry");
const structure_1 = require("../structure");
class StructureSubsetBuilder {
    addToUnit(parentId, e) {
        const unit = this.unitMap.get(parentId);
        if (!!unit) {
            unit[unit.length] = e;
        }
        else {
            this.unitMap.set(parentId, [e]);
            this.ids[this.ids.length] = parentId;
        }
        this.elementCount++;
    }
    beginUnit(parentId) {
        this.parentId = parentId;
        this.currentUnit = this.currentUnit.length > 0 ? [] : this.currentUnit;
    }
    addElement(e) {
        this.currentUnit[this.currentUnit.length] = e;
        this.elementCount++;
    }
    addElementRange(elements, start, end) {
        for (let i = start; i < end; i++) {
            this.currentUnit[this.currentUnit.length] = elements[i];
            this.elementCount++;
        }
    }
    commitUnit() {
        if (this.currentUnit.length === 0)
            return;
        this.ids[this.ids.length] = this.parentId;
        this.unitMap.set(this.parentId, this.currentUnit);
        this.parentId = -1;
    }
    setUnit(parentId, elements) {
        this.ids[this.ids.length] = parentId;
        this.unitMap.set(parentId, elements);
        this.elementCount += elements.length;
    }
    _getStructure(deduplicateElements) {
        if (this.isEmpty)
            return structure_1.Structure.Empty;
        const newUnits = [];
        (0, util_1.sortArray)(this.ids);
        const symmGroups = symmetry_1.StructureSymmetry.UnitEquivalenceBuilder();
        for (let i = 0, _i = this.ids.length; i < _i; i++) {
            const id = this.ids[i];
            const parent = this.parent.unitMap.get(id);
            let unit = this.unitMap.get(id);
            let sorted = false;
            if (deduplicateElements) {
                if (!this.isSorted)
                    (0, util_1.sortArray)(unit);
                unit = int_1.SortedArray.deduplicate(int_1.SortedArray.ofSortedArray(this.currentUnit));
                sorted = true;
            }
            const l = unit.length;
            // if the length is the same, just copy the old unit.
            if (unit.length === parent.elements.length) {
                newUnits[newUnits.length] = parent;
                symmGroups.add(parent.id, parent);
                continue;
            }
            if (!this.isSorted && !sorted && l > 1)
                (0, util_1.sortArray)(unit);
            let child = parent.getChild(int_1.SortedArray.ofSortedArray(unit));
            const pivot = symmGroups.add(child.id, child);
            if (child !== pivot)
                child = pivot.applyOperator(child.id, child.conformation.operator, true);
            newUnits[newUnits.length] = child;
        }
        return structure_1.Structure.create(newUnits, { parent: this.parent });
    }
    getStructure() {
        return this._getStructure(false);
    }
    getStructureDeduplicate() {
        return this._getStructure(true);
    }
    setSingletonLocation(location) {
        const id = this.ids[0];
        location.unit = this.parent.unitMap.get(id);
        location.element = this.unitMap.get(id)[0];
    }
    get isEmpty() {
        return this.elementCount === 0;
    }
    constructor(parent, isSorted) {
        this.parent = parent;
        this.isSorted = isSorted;
        this.ids = [];
        this.unitMap = int_1.IntMap.Mutable();
        this.parentId = -1;
        this.currentUnit = [];
        this.elementCount = 0;
    }
}
exports.StructureSubsetBuilder = StructureSubsetBuilder;
