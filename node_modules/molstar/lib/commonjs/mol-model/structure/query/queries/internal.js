"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultBondTest = defaultBondTest;
exports.atomicSequence = atomicSequence;
exports.water = water;
exports.atomicHet = atomicHet;
exports.spheres = spheres;
exports.bundleElementImpl = bundleElementImpl;
exports.bundleGenerator = bundleGenerator;
const int_1 = require("../../../../mol-data/int");
const element_1 = require("../../../../mol-model/structure/structure/element");
const structure_1 = require("../../structure");
const structure_2 = require("../../structure/structure");
const selection_1 = require("../selection");
const types_1 = require("../../model/types");
const bundle_1 = require("../../structure/element/bundle");
function defaultBondTest(ctx) {
    return types_1.BondType.isCovalent(ctx.atomicBond.type);
}
function atomicSequence() {
    return function query_atomicSequence(ctx) {
        const { inputStructure } = ctx;
        const l = element_1.StructureElement.Location.create(inputStructure);
        const units = [];
        for (const unit of inputStructure.units) {
            if (unit.kind !== 0 /* Unit.Kind.Atomic */)
                continue;
            l.unit = unit;
            const elements = unit.elements;
            l.element = elements[0];
            if (structure_1.StructureProperties.entity.type(l) !== 'polymer')
                continue;
            const residuesIt = int_1.Segmentation.transientSegments(unit.model.atomicHierarchy.residueAtomSegments, elements);
            let residueCount = 0;
            while (residuesIt.hasNext) {
                residueCount++;
                residuesIt.move();
            }
            if (residueCount < 8)
                continue;
            units.push(unit);
        }
        return selection_1.StructureSelection.Singletons(inputStructure, structure_2.Structure.create(units, { parent: inputStructure }));
    };
}
function water() {
    return function query_water(ctx) {
        const { inputStructure } = ctx;
        const l = element_1.StructureElement.Location.create(inputStructure);
        const units = [];
        for (const unit of inputStructure.units) {
            if (unit.kind !== 0 /* Unit.Kind.Atomic */)
                continue;
            l.unit = unit;
            const elements = unit.elements;
            l.element = elements[0];
            if (structure_1.StructureProperties.entity.type(l) !== 'water')
                continue;
            units.push(unit);
        }
        return selection_1.StructureSelection.Singletons(inputStructure, structure_2.Structure.create(units, { parent: inputStructure }));
    };
}
function atomicHet() {
    return function query_atomicHet(ctx) {
        const { inputStructure } = ctx;
        const l = element_1.StructureElement.Location.create(inputStructure);
        const units = [];
        for (const unit of inputStructure.units) {
            if (unit.kind !== 0 /* Unit.Kind.Atomic */)
                continue;
            l.unit = unit;
            const elements = unit.elements;
            l.element = elements[0];
            if (structure_1.StructureProperties.entity.type(l) === 'water')
                continue;
            if (structure_1.StructureProperties.entity.type(l) === 'polymer') {
                const residuesIt = int_1.Segmentation.transientSegments(unit.model.atomicHierarchy.residueAtomSegments, elements);
                let residueCount = 0;
                while (residuesIt.hasNext) {
                    residueCount++;
                    residuesIt.move();
                }
                if (residueCount >= 8)
                    continue;
            }
            units.push(unit);
        }
        return selection_1.StructureSelection.Singletons(inputStructure, structure_2.Structure.create(units, { parent: inputStructure }));
    };
}
function spheres() {
    return function query_spheres(ctx) {
        const { inputStructure } = ctx;
        const units = [];
        for (const unit of inputStructure.units) {
            if (unit.kind !== 1 /* Unit.Kind.Spheres */)
                continue;
            units.push(unit);
        }
        return selection_1.StructureSelection.Singletons(inputStructure, structure_2.Structure.create(units, { parent: inputStructure }));
    };
}
function bundleElementImpl(groupedUnits, ranges, set) {
    return {
        groupedUnits: groupedUnits,
        ranges: ranges,
        set: set
    };
}
function bundleGenerator(elements) {
    return function query_bundleGenerator(ctx) {
        const bundle = {
            hash: ctx.inputStructure.hashCode,
            elements
        };
        return selection_1.StructureSelection.Sequence(ctx.inputStructure, [bundle_1.Bundle.toStructure(bundle, ctx.inputStructure)]);
    };
}
