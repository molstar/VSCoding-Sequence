"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinearGroupingBuilder = exports.UniqueStructuresBuilder = void 0;
const structure_1 = require("../../structure");
const selection_1 = require("../selection");
const generic_1 = require("../../../../mol-data/generic");
const structure_set_1 = require("./structure-set");
class UniqueStructuresBuilder {
    add(s) {
        if (!s.elementCount)
            return;
        if (s.elementCount !== 1)
            this.allSingletons = false;
        if (this.set.add(s)) {
            this.structures[this.structures.length] = s;
        }
    }
    getSelection() {
        if (this.allSingletons)
            return selection_1.StructureSelection.Singletons(this.source, (0, structure_set_1.structureUnion)(this.source, this.structures));
        return selection_1.StructureSelection.Sequence(this.source, this.structures);
    }
    constructor(source) {
        this.source = source;
        this.set = (0, generic_1.HashSet)(structure_1.Structure.hashCode, structure_1.Structure.areUnitIdsAndIndicesEqual);
        this.structures = [];
        this.allSingletons = true;
    }
}
exports.UniqueStructuresBuilder = UniqueStructuresBuilder;
class LinearGroupingBuilder {
    add(key, unit, element) {
        let b = this.builderMap.get(key);
        if (!b) {
            b = this.source.subsetBuilder(true);
            this.builders[this.builders.length] = b;
            this.builderMap.set(key, b);
        }
        b.addToUnit(unit, element);
    }
    allSingletons() {
        for (let i = 0, _i = this.builders.length; i < _i; i++) {
            if (this.builders[i].elementCount > 1)
                return false;
        }
        return true;
    }
    singletonSelection() {
        const builder = this.source.subsetBuilder(true);
        const loc = structure_1.StructureElement.Location.create(this.source);
        for (let i = 0, _i = this.builders.length; i < _i; i++) {
            this.builders[i].setSingletonLocation(loc);
            builder.addToUnit(loc.unit.id, loc.element);
        }
        return selection_1.StructureSelection.Singletons(this.source, builder.getStructure());
    }
    fullSelection() {
        const structures = new Array(this.builders.length);
        for (let i = 0, _i = this.builders.length; i < _i; i++) {
            structures[i] = this.builders[i].getStructure();
        }
        return selection_1.StructureSelection.Sequence(this.source, structures);
    }
    getSelection() {
        const len = this.builders.length;
        if (len === 0)
            return selection_1.StructureSelection.Empty(this.source);
        if (this.allSingletons())
            return this.singletonSelection();
        return this.fullSelection();
    }
    constructor(source) {
        this.source = source;
        this.builders = [];
        this.builderMap = new Map();
    }
}
exports.LinearGroupingBuilder = LinearGroupingBuilder;
