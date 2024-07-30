"use strict";
/**
 * Copyright (c) 2017-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bond = void 0;
const tslib_1 = require("tslib");
const structure_1 = require("../../structure");
const types_1 = require("../../model/types");
const int_1 = require("../../../../mol-data/int");
const centroid_helper_1 = require("../../../../mol-math/geometry/centroid-helper");
tslib_1.__exportStar(require("./bonds/data"), exports);
tslib_1.__exportStar(require("./bonds/intra-compute"), exports);
tslib_1.__exportStar(require("./bonds/inter-compute"), exports);
var Bond;
(function (Bond) {
    function Location(aStructure, aUnit, aIndex, bStructure, bUnit, bIndex) {
        return {
            kind: 'bond-location',
            aStructure: aStructure,
            aUnit: aUnit,
            aIndex: aIndex,
            bStructure: bStructure,
            bUnit: bUnit,
            bIndex: bIndex
        };
    }
    Bond.Location = Location;
    function isLocation(x) {
        return !!x && x.kind === 'bond-location';
    }
    Bond.isLocation = isLocation;
    function areLocationsEqual(locA, locB) {
        return (locA.aStructure.label === locB.aStructure.label && locA.bStructure.label === locB.bStructure.label &&
            locA.aIndex === locB.aIndex && locA.bIndex === locB.bIndex &&
            locA.aUnit.id === locB.aUnit.id && locA.bUnit.id === locB.bUnit.id);
    }
    Bond.areLocationsEqual = areLocationsEqual;
    function Loci(structure, bonds) {
        return { kind: 'bond-loci', structure, bonds: bonds };
    }
    Bond.Loci = Loci;
    function isLoci(x) {
        return !!x && x.kind === 'bond-loci';
    }
    Bond.isLoci = isLoci;
    function areLociEqual(a, b) {
        if (a.structure !== b.structure)
            return false;
        if (a.bonds.length !== b.bonds.length)
            return false;
        for (let i = 0, il = a.bonds.length; i < il; ++i) {
            if (!areLocationsEqual(a.bonds[i], b.bonds[i]))
                return false;
        }
        return true;
    }
    Bond.areLociEqual = areLociEqual;
    function isLociEmpty(loci) {
        return loci.bonds.length === 0 ? true : false;
    }
    Bond.isLociEmpty = isLociEmpty;
    function remapLoci(loci, structure) {
        if (structure === loci.structure)
            return loci;
        const bonds = [];
        loci.bonds.forEach(l => {
            const unitA = structure.unitMap.get(l.aUnit.id);
            if (!unitA)
                return;
            const unitB = structure.unitMap.get(l.bUnit.id);
            if (!unitB)
                return;
            const elementA = l.aUnit.elements[l.aIndex];
            const indexA = int_1.SortedArray.indexOf(unitA.elements, elementA);
            if (indexA === -1)
                return;
            const elementB = l.bUnit.elements[l.bIndex];
            const indexB = int_1.SortedArray.indexOf(unitB.elements, elementB);
            if (indexB === -1)
                return;
            bonds.push(Location(loci.structure, unitA, indexA, loci.structure, unitB, indexB));
        });
        return Loci(structure, bonds);
    }
    Bond.remapLoci = remapLoci;
    function toStructureElementLoci(loci) {
        const elements = [];
        const map = new Map();
        for (const lociBond of loci.bonds) {
            const { aIndex, aUnit, bIndex, bUnit } = lociBond;
            if (aUnit === bUnit) {
                if (map.has(aUnit.id))
                    map.get(aUnit.id).push(aIndex, bIndex);
                else
                    map.set(aUnit.id, [aIndex, bIndex]);
            }
            else {
                if (map.has(aUnit.id))
                    map.get(aUnit.id).push(aIndex);
                else
                    map.set(aUnit.id, [aIndex]);
                if (map.has(bUnit.id))
                    map.get(bUnit.id).push(bIndex);
                else
                    map.set(bUnit.id, [bIndex]);
            }
        }
        map.forEach((indices, id) => {
            elements.push({
                unit: loci.structure.unitMap.get(id),
                indices: int_1.SortedArray.deduplicate(int_1.SortedArray.ofUnsortedArray(indices))
            });
        });
        return structure_1.StructureElement.Loci(loci.structure, elements);
    }
    Bond.toStructureElementLoci = toStructureElementLoci;
    function toFirstStructureElementLoci(loci) {
        const { aUnit, aIndex } = loci.bonds[0];
        return structure_1.StructureElement.Loci(loci.structure, [{ unit: aUnit, indices: int_1.OrderedSet.ofSingleton(aIndex) }]);
    }
    Bond.toFirstStructureElementLoci = toFirstStructureElementLoci;
    function getType(structure, location) {
        if (location.aUnit === location.bUnit) {
            const bonds = location.aUnit.bonds;
            const idx = bonds.getEdgeIndex(location.aIndex, location.bIndex);
            if (idx < 0)
                return types_1.BondType.create(0 /* BondType.Flag.None */);
            return types_1.BondType.create(bonds.edgeProps.flags[idx]);
        }
        else {
            const bond = structure.interUnitBonds.getBondFromLocation(location);
            if (bond)
                return types_1.BondType.create(bond.props.flag);
            return types_1.BondType.create(0 /* BondType.Flag.None */);
        }
    }
    Bond.getType = getType;
    function getOrder(structure, location) {
        if (location.aUnit === location.bUnit) {
            const bonds = location.aUnit.bonds;
            const idx = bonds.getEdgeIndex(location.aIndex, location.bIndex);
            if (idx < 0)
                return 0;
            return bonds.edgeProps.order[idx];
        }
        else {
            const bond = structure.interUnitBonds.getBondFromLocation(location);
            if (bond)
                return bond.props.order;
            return 0;
        }
    }
    Bond.getOrder = getOrder;
    function getIntraUnitBondCount(structure) {
        let count = 0;
        for (let i = 0, il = structure.units.length; i < il; ++i) {
            const u = structure.units[i];
            if (structure_1.Unit.isAtomic(u))
                count += u.bonds.edgeCount;
        }
        return count;
    }
    Bond.getIntraUnitBondCount = getIntraUnitBondCount;
    class ElementBondIterator {
        move() {
            this.advance();
            return this.current;
        }
        setElement(structure, unit, index) {
            this.structure = structure;
            this.unit = unit;
            this.index = index;
            this.interBondIndices = structure.interUnitBonds.getEdgeIndices(index, unit.id);
            this.interBondCount = this.interBondIndices.length;
            this.interBondIndex = 0;
            this.intraBondEnd = unit.bonds.offset[index + 1];
            this.intraBondIndex = unit.bonds.offset[index];
            this.hasNext = this.interBondIndex < this.interBondCount || this.intraBondIndex < this.intraBondEnd;
        }
        advance() {
            if (this.intraBondIndex < this.intraBondEnd) {
                this.current.otherUnit = this.unit;
                this.current.otherIndex = this.unit.bonds.b[this.intraBondIndex];
                this.current.type = this.unit.bonds.edgeProps.flags[this.intraBondIndex];
                this.current.order = this.unit.bonds.edgeProps.order[this.intraBondIndex];
                this.intraBondIndex += 1;
            }
            else if (this.interBondIndex < this.interBondCount) {
                const b = this.structure.interUnitBonds.edges[this.interBondIndex];
                this.current.otherUnit = this.structure.unitMap.get(b.unitA !== this.unit.id ? b.unitA : b.unitB);
                this.current.otherIndex = b.indexA !== this.index ? b.indexA : b.indexB;
                this.current.type = b.props.flag;
                this.current.order = b.props.order;
                this.interBondIndex += 1;
            }
            else {
                this.hasNext = false;
                return;
            }
            this.hasNext = this.interBondIndex < this.interBondCount || this.intraBondIndex < this.intraBondEnd;
        }
        constructor() {
            this.current = {};
            this.hasNext = false;
        }
    }
    Bond.ElementBondIterator = ElementBondIterator;
    function getBoundingSphere(loci, boundingSphere) {
        return centroid_helper_1.CentroidHelper.fromPairProvider(loci.bonds.length, (i, pA, pB) => {
            const { aUnit, aIndex, bUnit, bIndex } = loci.bonds[i];
            aUnit.conformation.position(aUnit.elements[aIndex], pA);
            bUnit.conformation.position(bUnit.elements[bIndex], pB);
        }, boundingSphere);
    }
    Bond.getBoundingSphere = getBoundingSphere;
})(Bond || (exports.Bond = Bond = {}));
