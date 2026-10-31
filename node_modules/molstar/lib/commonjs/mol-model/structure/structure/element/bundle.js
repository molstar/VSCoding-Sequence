"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bundle = void 0;
const int_1 = require("../../../../mol-data/int");
const structure_1 = require("../structure");
const util_1 = require("../../../../mol-data/util");
const sorted_ranges_1 = require("../../../../mol-data/int/sorted-ranges");
const loci_1 = require("./loci");
const builder_1 = require("../../../../mol-script/language/builder");
const query_1 = require("../../query");
var Bundle;
(function (Bundle) {
    Bundle.Empty = { hash: -1, elements: [] };
    function fromSubStructure(parent, structure) {
        return fromLoci(query_1.StructureSelection.toLociWithSourceUnits(query_1.StructureSelection.Singletons(parent, structure)));
    }
    Bundle.fromSubStructure = fromSubStructure;
    function fromSelection(selection) {
        return fromLoci(query_1.StructureSelection.toLociWithSourceUnits(selection));
    }
    Bundle.fromSelection = fromSelection;
    function fromLoci(loci) {
        const _elements = [];
        for (const e of loci.elements) {
            const { unit, indices } = e;
            if (int_1.OrderedSet.size(indices) === 0)
                continue;
            const ranges = [];
            const set = [];
            if (int_1.OrderedSet.isInterval(indices)) {
                if (int_1.OrderedSet.size(indices) === 1) {
                    set.push(int_1.Interval.min(indices));
                }
                else {
                    ranges.push(int_1.Interval.min(indices), int_1.Interval.max(indices));
                }
            }
            else {
                let i = 0;
                const len = indices.length;
                while (i < len) {
                    const start = i;
                    i++;
                    while (i < len && indices[i - 1] + 1 === indices[i])
                        i++;
                    const end = i;
                    if (end - start > 2) {
                        ranges.push(indices[start], indices[end - 1]);
                    }
                    else {
                        for (let j = start; j < end; j++) {
                            set[set.length] = indices[j];
                        }
                    }
                }
            }
            _elements.push({
                unit,
                set: int_1.SortedArray.ofSortedArray(set),
                ranges: sorted_ranges_1.SortedRanges.ofSortedRanges(ranges)
            });
        }
        const elementGroups = new Map();
        for (let i = 0, il = _elements.length; i < il; ++i) {
            const e = _elements[i];
            const key = (0, util_1.hash2)((0, util_1.hashFnv32a)(e.ranges), (0, util_1.hashFnv32a)(e.set));
            if (elementGroups.has(key)) {
                const { groupedUnits } = elementGroups.get(key);
                if (groupedUnits.has(e.unit.invariantId)) {
                    groupedUnits.get(e.unit.invariantId).push(e.unit.id);
                }
                else {
                    groupedUnits.set(e.unit.invariantId, [e.unit.id]);
                }
            }
            else {
                const groupedUnits = new Map();
                groupedUnits.set(e.unit.invariantId, [e.unit.id]);
                elementGroups.set(key, { groupedUnits, set: e.set, ranges: e.ranges });
            }
        }
        const elements = [];
        elementGroups.forEach(e => {
            const groupedUnits = [];
            e.groupedUnits.forEach(g => groupedUnits.push(int_1.SortedArray.ofUnsortedArray(g)));
            groupedUnits.sort((a, b) => a[0] - b[0]); // sort by first unit id of each group
            elements.push({ groupedUnits, set: e.set, ranges: e.ranges });
        });
        return { hash: loci.structure.hashCode, elements };
    }
    Bundle.fromLoci = fromLoci;
    function getUnitsFromIds(unitIds, structure) {
        const units = [];
        for (let i = 0, il = unitIds.length; i < il; ++i) {
            const unitId = unitIds[i];
            if (structure.unitMap.has(unitId))
                units.push(structure.unitMap.get(unitId));
        }
        return units;
    }
    function toLoci(bundle, structure) {
        if (bundle.hash !== -1 && bundle.hash !== structure.hashCode) {
            new Error('Bundle not compatible with given structure');
        }
        const elements = [];
        for (const e of bundle.elements) {
            for (const g of e.groupedUnits) {
                const units = getUnitsFromIds(g, structure);
                if (units.length === 0)
                    continue;
                let indices;
                if (e.ranges.length === 0) {
                    indices = e.set;
                }
                else if (e.set.length === 0) {
                    if (e.ranges.length === 2) {
                        indices = int_1.Interval.ofRange(e.ranges[0], e.ranges[1]);
                    }
                    else {
                        const _indices = new Int32Array(sorted_ranges_1.SortedRanges.size(e.ranges));
                        sorted_ranges_1.SortedRanges.forEach(e.ranges, (v, i) => _indices[i] = v);
                        indices = int_1.SortedArray.ofSortedArray(_indices);
                    }
                }
                else {
                    const rangesSize = sorted_ranges_1.SortedRanges.size(e.ranges);
                    const _indices = new Int32Array(e.set.length + rangesSize);
                    sorted_ranges_1.SortedRanges.forEach(e.ranges, (v, i) => _indices[i] = v);
                    _indices.set(e.set, rangesSize);
                    indices = int_1.SortedArray.ofUnsortedArray(_indices); // requires sort
                }
                for (const unit of units) {
                    elements.push({ unit, indices });
                }
            }
        }
        return (0, loci_1.Loci)(structure, elements);
    }
    Bundle.toLoci = toLoci;
    function toStructure(bundle, parent) {
        if (bundle.hash !== -1 && bundle.hash !== parent.hashCode) {
            new Error('Bundle not compatible with given structure');
        }
        const units = [];
        for (const e of bundle.elements) {
            for (const g of e.groupedUnits) {
                const _units = getUnitsFromIds(g, parent);
                if (_units.length === 0)
                    continue;
                const ue = _units[0].elements; // the elements are grouped by unit.invariantId
                const rangesSize = sorted_ranges_1.SortedRanges.size(e.ranges);
                const setSize = e.set.length;
                const _indices = new Int32Array(setSize + rangesSize);
                let indices;
                if (rangesSize === 0) {
                    for (let i = 0, il = setSize; i < il; ++i) {
                        _indices[i] = ue[e.set[i]];
                    }
                    indices = int_1.SortedArray.ofSortedArray(_indices);
                }
                else if (setSize === 0) {
                    sorted_ranges_1.SortedRanges.forEach(e.ranges, (v, i) => _indices[i] = ue[v]);
                    indices = int_1.SortedArray.ofSortedArray(_indices);
                }
                else {
                    if (int_1.SortedArray.min(e.set) > sorted_ranges_1.SortedRanges.max(e.ranges)) {
                        sorted_ranges_1.SortedRanges.forEach(e.ranges, (v, i) => _indices[i] = ue[v]);
                        for (let i = 0, il = setSize; i < il; ++i) {
                            _indices[i + rangesSize] = ue[e.set[i]];
                        }
                        indices = int_1.SortedArray.ofSortedArray(_indices);
                    }
                    else if (sorted_ranges_1.SortedRanges.min(e.ranges) > int_1.SortedArray.max(e.set)) {
                        for (let i = 0, il = setSize; i < il; ++i) {
                            _indices[i] = ue[e.set[i]];
                        }
                        sorted_ranges_1.SortedRanges.forEach(e.ranges, (v, i) => _indices[i + setSize] = ue[v]);
                        indices = int_1.SortedArray.ofSortedArray(_indices);
                    }
                    else {
                        sorted_ranges_1.SortedRanges.forEach(e.ranges, (v, i) => _indices[i] = ue[v]);
                        for (let i = 0, il = setSize; i < il; ++i) {
                            _indices[i + rangesSize] = ue[e.set[i]];
                        }
                        indices = int_1.SortedArray.ofUnsortedArray(_indices); // requires sort
                    }
                }
                for (const unit of _units) {
                    units.push(unit.getChild(indices));
                }
            }
        }
        return structure_1.Structure.create(units, { parent });
    }
    Bundle.toStructure = toStructure;
    function elementToExpression(e) {
        return builder_1.MolScriptBuilder.internal.generator.bundleElement({
            groupedUnits: builder_1.MolScriptBuilder.core.type.list(e.groupedUnits.map(u => builder_1.MolScriptBuilder.core.type.list(u))),
            ranges: builder_1.MolScriptBuilder.core.type.list(e.ranges),
            set: builder_1.MolScriptBuilder.core.type.list(e.set),
        });
    }
    function toExpression(bundle) {
        return builder_1.MolScriptBuilder.internal.generator.bundle({
            elements: builder_1.MolScriptBuilder.core.type.list(bundle.elements.map(elementToExpression))
        });
    }
    Bundle.toExpression = toExpression;
    function areEqual(a, b) {
        if (a.elements.length !== b.elements.length)
            return false;
        for (let i = 0, il = a.elements.length; i < il; ++i) {
            const elementA = a.elements[i], elementB = b.elements[i];
            if (elementA.groupedUnits.length !== elementB.groupedUnits.length)
                return false;
            for (let j = 0, jl = elementB.groupedUnits.length; j < jl; ++j) {
                if (!int_1.SortedArray.areEqual(elementA.groupedUnits[j], elementB.groupedUnits[j]))
                    return false;
            }
            if (!int_1.SortedArray.areEqual(elementA.set, elementB.set))
                return false;
            if (!sorted_ranges_1.SortedRanges.areEqual(elementA.ranges, elementB.ranges))
                return false;
        }
        return true;
    }
    Bundle.areEqual = areEqual;
})(Bundle || (exports.Bundle = Bundle = {}));
