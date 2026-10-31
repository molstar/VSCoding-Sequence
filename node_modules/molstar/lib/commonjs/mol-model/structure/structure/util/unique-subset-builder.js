"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureUniqueSubsetBuilder = void 0;
const int_1 = require("../../../../mol-data/int");
const util_1 = require("../../../../mol-data/util");
const symmetry_1 = require("../symmetry");
const structure_1 = require("../structure");
const generic_1 = require("../../../../mol-data/generic");
class StructureUniqueSubsetBuilder {
    addToUnit(parentId, e) {
        const unit = this.unitMap.get(parentId);
        if (!!unit) {
            if (generic_1.UniqueArray.add(unit, e, e))
                this.elementCount++;
        }
        else {
            const arr = generic_1.UniqueArray.create();
            generic_1.UniqueArray.add(arr, e, e);
            this.unitMap.set(parentId, arr);
            this.ids[this.ids.length] = parentId;
            this.elementCount++;
        }
    }
    has(parentId, e) {
        const unit = this.unitMap.get(parentId);
        if (!unit)
            return false;
        return generic_1.UniqueArray.has(unit, e);
    }
    beginUnit(parentId) {
        this.parentId = parentId;
        if (this.unitMap.has(parentId)) {
            this.currentUnit = this.unitMap.get(parentId);
        }
        else {
            this.currentUnit = this.currentUnit.array.length > 0 ? generic_1.UniqueArray.create() : this.currentUnit;
        }
    }
    addElement(e) {
        if (generic_1.UniqueArray.add(this.currentUnit, e, e))
            this.elementCount++;
    }
    commitUnit() {
        if (this.currentUnit.array.length === 0 || this.unitMap.has(this.parentId))
            return;
        this.ids[this.ids.length] = this.parentId;
        this.unitMap.set(this.parentId, this.currentUnit);
        this.parentId = -1;
    }
    getStructure() {
        if (this.isEmpty)
            return structure_1.Structure.Empty;
        const newUnits = [];
        (0, util_1.sortArray)(this.ids);
        const symmGroups = symmetry_1.StructureSymmetry.UnitEquivalenceBuilder();
        for (let i = 0, _i = this.ids.length; i < _i; i++) {
            const id = this.ids[i];
            const parent = this.parent.unitMap.get(id);
            const unit = this.unitMap.get(id).array;
            const l = unit.length;
            // if the length is the same, just copy the old unit.
            if (unit.length === parent.elements.length) {
                newUnits[newUnits.length] = parent;
                symmGroups.add(parent.id, parent);
                continue;
            }
            if (l > 1)
                (0, util_1.sortArray)(unit);
            let child = parent.getChild(int_1.SortedArray.ofSortedArray(unit));
            const pivot = symmGroups.add(child.id, child);
            if (child !== pivot)
                child = pivot.applyOperator(child.id, child.conformation.operator, true);
            newUnits[newUnits.length] = child;
        }
        return structure_1.Structure.create(newUnits, { parent: this.parent });
    }
    get isEmpty() {
        return this.elementCount === 0;
    }
    constructor(parent) {
        this.parent = parent;
        this.ids = [];
        this.unitMap = int_1.IntMap.Mutable();
        this.parentId = -1;
        this.currentUnit = generic_1.UniqueArray.create();
        this.elementCount = 0;
    }
}
exports.StructureUniqueSubsetBuilder = StructureUniqueSubsetBuilder;
