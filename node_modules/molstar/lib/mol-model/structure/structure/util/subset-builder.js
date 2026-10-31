/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { IntMap, SortedArray } from '../../../../mol-data/int';
import { sortArray } from '../../../../mol-data/util';
import { StructureSymmetry } from '../symmetry';
import { Structure } from '../structure';
export class StructureSubsetBuilder {
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
            return Structure.Empty;
        const newUnits = [];
        sortArray(this.ids);
        const symmGroups = StructureSymmetry.UnitEquivalenceBuilder();
        for (let i = 0, _i = this.ids.length; i < _i; i++) {
            const id = this.ids[i];
            const parent = this.parent.unitMap.get(id);
            let unit = this.unitMap.get(id);
            let sorted = false;
            if (deduplicateElements) {
                if (!this.isSorted)
                    sortArray(unit);
                unit = SortedArray.deduplicate(SortedArray.ofSortedArray(this.currentUnit));
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
                sortArray(unit);
            let child = parent.getChild(SortedArray.ofSortedArray(unit));
            const pivot = symmGroups.add(child.id, child);
            if (child !== pivot)
                child = pivot.applyOperator(child.id, child.conformation.operator, true);
            newUnits[newUnits.length] = child;
        }
        return Structure.create(newUnits, { parent: this.parent });
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
        this.unitMap = IntMap.Mutable();
        this.parentId = -1;
        this.currentUnit = [];
        this.elementCount = 0;
    }
}
