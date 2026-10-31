"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexedCustomProperty = void 0;
const structure_1 = require("../../../structure");
const int_1 = require("../../../../../mol-data/int");
const mol_util_1 = require("../../../../../mol-util");
var IndexedCustomProperty;
(function (IndexedCustomProperty) {
    function getCifDataSource(structure, prop, cache) {
        if (!prop)
            return { rowCount: 0 };
        if (cache && cache[prop.id])
            return cache[prop.id];
        const data = prop.getElements(structure);
        const ret = { data, rowCount: data.elements.length };
        if (cache)
            cache[prop.id] = ret;
        return ret;
    }
    IndexedCustomProperty.getCifDataSource = getCifDataSource;
    function fromAtomMap(map) {
        return new ElementMappedCustomProperty(map);
    }
    IndexedCustomProperty.fromAtomMap = fromAtomMap;
    function fromAtomArray(array) {
        // TODO: create "array based custom property" as optimization
        return new ElementMappedCustomProperty(arrayToMap(array));
    }
    IndexedCustomProperty.fromAtomArray = fromAtomArray;
    const getResidueSegments = (model) => model.atomicHierarchy.residueAtomSegments;
    function fromResidueMap(map) {
        return new SegmentedMappedIndexedCustomProperty('residue', map, getResidueSegments, 0 /* Unit.Kind.Atomic */);
    }
    IndexedCustomProperty.fromResidueMap = fromResidueMap;
    function fromResidueArray(array) {
        // TODO: create "array based custom property" as optimization
        return new SegmentedMappedIndexedCustomProperty('residue', arrayToMap(array), getResidueSegments, 0 /* Unit.Kind.Atomic */);
    }
    IndexedCustomProperty.fromResidueArray = fromResidueArray;
    const getChainSegments = (model) => model.atomicHierarchy.chainAtomSegments;
    function fromChainMap(map) {
        return new SegmentedMappedIndexedCustomProperty('chain', map, getChainSegments, 0 /* Unit.Kind.Atomic */);
    }
    IndexedCustomProperty.fromChainMap = fromChainMap;
    function fromChainArray(array) {
        // TODO: create "array based custom property" as optimization
        return new SegmentedMappedIndexedCustomProperty('chain', arrayToMap(array), getChainSegments, 0 /* Unit.Kind.Atomic */);
    }
    IndexedCustomProperty.fromChainArray = fromChainArray;
    function fromEntityMap(map) {
        return new EntityMappedCustomProperty(map);
    }
    IndexedCustomProperty.fromEntityMap = fromEntityMap;
})(IndexedCustomProperty || (exports.IndexedCustomProperty = IndexedCustomProperty = {}));
function arrayToMap(array) {
    const ret = new Map();
    for (let i = 0, _i = array.length; i < _i; i++)
        ret.set(i, array[i]);
    return ret;
}
class SegmentedMappedIndexedCustomProperty {
    has(idx) { return this.map.has(idx); }
    get(idx) { return this.map.get(idx); }
    getStructureElements(structure) {
        const models = structure.models;
        if (models.length !== 1)
            throw new Error(`Only works on structures with a single model.`);
        const seenIndices = new Set();
        const unitGroups = structure.unitSymmetryGroups;
        const loci = [];
        const segments = this.segmentGetter(models[0]);
        for (const unitGroup of unitGroups) {
            const unit = unitGroup.units[0];
            if (unit.kind !== this.kind) {
                continue;
            }
            const chains = int_1.Segmentation.transientSegments(segments, unit.elements);
            while (chains.hasNext) {
                const seg = chains.move();
                if (!this.has(seg.index) || seenIndices.has(seg.index))
                    continue;
                seenIndices.add(seg.index);
                loci[loci.length] = structure_1.StructureElement.Location.create(structure, unit, unit.elements[seg.start]);
            }
        }
        loci.sort((x, y) => x.element - y.element);
        return loci;
    }
    getElements(structure) {
        const index = this.segmentGetter(structure.model).index;
        const elements = this.getStructureElements(structure);
        return { elements, property: i => this.get(index[elements[i].element]) };
    }
    constructor(level, map, segmentGetter, kind) {
        this.level = level;
        this.map = map;
        this.segmentGetter = segmentGetter;
        this.id = mol_util_1.UUID.create22();
        this.kind = kind;
    }
}
class ElementMappedCustomProperty {
    has(idx) { return this.map.has(idx); }
    get(idx) { return this.map.get(idx); }
    getStructureElements(structure) {
        const models = structure.models;
        if (models.length !== 1)
            throw new Error(`Only works on structures with a single model.`);
        const seenIndices = new Set();
        const unitGroups = structure.unitSymmetryGroups;
        const loci = [];
        for (const unitGroup of unitGroups) {
            const unit = unitGroup.units[0];
            if (unit.kind !== this.kind) {
                continue;
            }
            const elements = unit.elements;
            for (let i = 0, _i = elements.length; i < _i; i++) {
                const e = elements[i];
                if (!this.has(e) || seenIndices.has(e))
                    continue;
                seenIndices.add(elements[i]);
                loci[loci.length] = structure_1.StructureElement.Location.create(structure, unit, e);
            }
        }
        loci.sort((x, y) => x.element - y.element);
        return loci;
    }
    getElements(structure) {
        const elements = this.getStructureElements(structure);
        return { elements, property: i => this.get(elements[i].element) };
    }
    constructor(map) {
        this.map = map;
        this.id = mol_util_1.UUID.create22();
        this.level = 'atom';
        this.kind = 0 /* Unit.Kind.Atomic */;
    }
}
class EntityMappedCustomProperty {
    has(idx) { return this.map.has(idx); }
    get(idx) { return this.map.get(idx); }
    getStructureElements(structure) {
        const models = structure.models;
        if (models.length !== 1)
            throw new Error(`Only works on structures with a single model.`);
        const index = models[0].atomicHierarchy.index;
        const seenIndices = new Set();
        const unitGroups = structure.unitSymmetryGroups;
        const loci = [];
        const segments = models[0].atomicHierarchy.chainAtomSegments;
        for (const unitGroup of unitGroups) {
            const unit = unitGroup.units[0];
            if (unit.kind !== this.kind) {
                continue;
            }
            const chains = int_1.Segmentation.transientSegments(segments, unit.elements);
            while (chains.hasNext) {
                const seg = chains.move();
                const eI = index.getEntityFromChain(seg.index);
                if (!this.has(eI) || seenIndices.has(eI))
                    continue;
                seenIndices.add(eI);
                loci[loci.length] = structure_1.StructureElement.Location.create(structure, unit, unit.elements[seg.start]);
            }
        }
        loci.sort((x, y) => x.element - y.element);
        return loci;
    }
    getElements(structure) {
        const elements = this.getStructureElements(structure);
        const chainIndex = structure.model.atomicHierarchy.chainAtomSegments.index;
        const index = structure.model.atomicHierarchy.index;
        return { elements, property: i => this.get(index.getEntityFromChain(chainIndex[elements[i].element])) };
    }
    constructor(map) {
        this.map = map;
        this.id = mol_util_1.UUID.create22();
        this.level = 'entity';
        this.kind = 0 /* Unit.Kind.Atomic */;
    }
}
