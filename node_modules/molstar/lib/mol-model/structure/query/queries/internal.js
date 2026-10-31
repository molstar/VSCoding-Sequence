/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Segmentation } from '../../../../mol-data/int';
import { StructureElement } from '../../../../mol-model/structure/structure/element';
import { StructureProperties as P } from '../../structure';
import { Structure } from '../../structure/structure';
import { StructureSelection } from '../selection';
import { BondType } from '../../model/types';
import { Bundle } from '../../structure/element/bundle';
export function defaultBondTest(ctx) {
    return BondType.isCovalent(ctx.atomicBond.type);
}
export function atomicSequence() {
    return function query_atomicSequence(ctx) {
        const { inputStructure } = ctx;
        const l = StructureElement.Location.create(inputStructure);
        const units = [];
        for (const unit of inputStructure.units) {
            if (unit.kind !== 0 /* Unit.Kind.Atomic */)
                continue;
            l.unit = unit;
            const elements = unit.elements;
            l.element = elements[0];
            if (P.entity.type(l) !== 'polymer')
                continue;
            const residuesIt = Segmentation.transientSegments(unit.model.atomicHierarchy.residueAtomSegments, elements);
            let residueCount = 0;
            while (residuesIt.hasNext) {
                residueCount++;
                residuesIt.move();
            }
            if (residueCount < 8)
                continue;
            units.push(unit);
        }
        return StructureSelection.Singletons(inputStructure, Structure.create(units, { parent: inputStructure }));
    };
}
export function water() {
    return function query_water(ctx) {
        const { inputStructure } = ctx;
        const l = StructureElement.Location.create(inputStructure);
        const units = [];
        for (const unit of inputStructure.units) {
            if (unit.kind !== 0 /* Unit.Kind.Atomic */)
                continue;
            l.unit = unit;
            const elements = unit.elements;
            l.element = elements[0];
            if (P.entity.type(l) !== 'water')
                continue;
            units.push(unit);
        }
        return StructureSelection.Singletons(inputStructure, Structure.create(units, { parent: inputStructure }));
    };
}
export function atomicHet() {
    return function query_atomicHet(ctx) {
        const { inputStructure } = ctx;
        const l = StructureElement.Location.create(inputStructure);
        const units = [];
        for (const unit of inputStructure.units) {
            if (unit.kind !== 0 /* Unit.Kind.Atomic */)
                continue;
            l.unit = unit;
            const elements = unit.elements;
            l.element = elements[0];
            if (P.entity.type(l) === 'water')
                continue;
            if (P.entity.type(l) === 'polymer') {
                const residuesIt = Segmentation.transientSegments(unit.model.atomicHierarchy.residueAtomSegments, elements);
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
        return StructureSelection.Singletons(inputStructure, Structure.create(units, { parent: inputStructure }));
    };
}
export function spheres() {
    return function query_spheres(ctx) {
        const { inputStructure } = ctx;
        const units = [];
        for (const unit of inputStructure.units) {
            if (unit.kind !== 1 /* Unit.Kind.Spheres */)
                continue;
            units.push(unit);
        }
        return StructureSelection.Singletons(inputStructure, Structure.create(units, { parent: inputStructure }));
    };
}
export function bundleElementImpl(groupedUnits, ranges, set) {
    return {
        groupedUnits: groupedUnits,
        ranges: ranges,
        set: set
    };
}
export function bundleGenerator(elements) {
    return function query_bundleGenerator(ctx) {
        const bundle = {
            hash: ctx.inputStructure.hashCode,
            elements
        };
        return StructureSelection.Sequence(ctx.inputStructure, [Bundle.toStructure(bundle, ctx.inputStructure)]);
    };
}
