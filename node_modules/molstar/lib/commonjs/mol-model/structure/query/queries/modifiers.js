"use strict";
/**
 * Copyright (c) 2017-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.wholeResidues = wholeResidues;
exports.includeSurroundings = includeSurroundings;
exports.querySelection = querySelection;
exports.intersectBy = intersectBy;
exports.exceptBy = exceptBy;
exports.union = union;
exports.expandProperty = expandProperty;
exports.includeConnected = includeConnected;
exports.surroundingLigands = surroundingLigands;
const int_1 = require("../../../../mol-data/int");
const selection_1 = require("../selection");
const builders_1 = require("../utils/builders");
const unique_subset_builder_1 = require("../../structure/util/unique-subset-builder");
const structure_set_1 = require("../utils/structure-set");
const generic_1 = require("../../../../mol-data/generic");
const element_1 = require("../../structure/element");
const mmcif_1 = require("../../../../mol-model-formats/structure/mmcif");
const residue_set_1 = require("../../model/properties/utils/residue-set");
const properties_1 = require("../../structure/properties");
const array_1 = require("../../../../mol-util/array");
function getWholeResidues(ctx, source, structure) {
    const builder = source.subsetBuilder(true);
    for (const unit of structure.units) {
        if (unit.kind !== 0 /* Unit.Kind.Atomic */) {
            // just copy non-atomic units.
            builder.setUnit(unit.id, unit.elements);
            continue;
        }
        const { residueAtomSegments } = unit.model.atomicHierarchy;
        const sourceElements = source.unitMap.get(unit.id).elements;
        const elements = unit.elements;
        builder.beginUnit(unit.id);
        const residuesIt = int_1.Segmentation.transientSegments(residueAtomSegments, elements);
        while (residuesIt.hasNext) {
            const rI = residuesIt.move().index;
            for (let j = residueAtomSegments.offsets[rI], _j = residueAtomSegments.offsets[rI + 1]; j < _j; j++) {
                if (int_1.SortedArray.has(sourceElements, j))
                    builder.addElement(j);
            }
        }
        builder.commitUnit();
        ctx.throwIfTimedOut();
    }
    return builder.getStructure();
}
function wholeResidues(query) {
    return function query_wholeResidues(ctx) {
        const inner = query(ctx);
        if (selection_1.StructureSelection.isSingleton(inner)) {
            return selection_1.StructureSelection.Singletons(ctx.inputStructure, getWholeResidues(ctx, ctx.inputStructure, inner.structure));
        }
        else {
            const builder = new builders_1.UniqueStructuresBuilder(ctx.inputStructure);
            for (const s of inner.structures) {
                builder.add(getWholeResidues(ctx, ctx.inputStructure, s));
            }
            return builder.getSelection();
        }
    };
}
function getIncludeSurroundings(ctx, source, structure, params) {
    const builder = new unique_subset_builder_1.StructureUniqueSubsetBuilder(source);
    const lookup = source.lookup3d;
    const r = params.radius;
    for (const unit of structure.units) {
        const c = unit.conformation;
        const elements = unit.elements;
        for (let i = 0, _i = elements.length; i < _i; i++) {
            const e = elements[i];
            lookup.findIntoBuilder(c.x(e), c.y(e), c.z(e), r, builder);
        }
        ctx.throwIfTimedOut();
    }
    return !!params.wholeResidues ? getWholeResidues(ctx, source, builder.getStructure()) : builder.getStructure();
}
function getIncludeSurroundingsWithRadius(ctx, source, structure, params) {
    const builder = new unique_subset_builder_1.StructureUniqueSubsetBuilder(source);
    const lookup = source.lookup3d;
    const { elementRadius, elementRadiusClosure, sourceMaxRadius, radius } = params;
    ctx.pushCurrentElement();
    ctx.element.structure = structure;
    for (const unit of structure.units) {
        ctx.element.unit = unit;
        const c = unit.conformation;
        const elements = unit.elements;
        for (let i = 0, _i = elements.length; i < _i; i++) {
            const e = elements[i];
            ctx.element.element = e;
            const eRadius = elementRadius(ctx);
            lookup.findIntoBuilderWithRadius(c.x(e), c.y(e), c.z(e), eRadius, sourceMaxRadius, radius, elementRadiusClosure, builder);
        }
        ctx.throwIfTimedOut();
    }
    ctx.popCurrentElement();
    return !!params.wholeResidues ? getWholeResidues(ctx, source, builder.getStructure()) : builder.getStructure();
}
function createElementRadiusFn(ctx, eRadius) {
    return e => {
        ctx.element.structure = e.structure;
        ctx.element.unit = e.unit;
        ctx.element.element = e.element;
        return eRadius(ctx);
    };
}
function findStructureRadius(ctx, eRadius) {
    let r = 0;
    ctx.element.structure = ctx.inputStructure;
    for (const unit of ctx.inputStructure.units) {
        ctx.element.unit = unit;
        const elements = unit.elements;
        for (let i = 0, _i = elements.length; i < _i; i++) {
            const e = elements[i];
            ctx.element.element = e;
            const eR = eRadius(ctx);
            if (eR > r)
                r = eR;
        }
    }
    ctx.throwIfTimedOut();
    return r;
}
function includeSurroundings(query, params) {
    return function query_includeSurroundings(ctx) {
        const inner = query(ctx);
        if (params.elementRadius) {
            const prms = {
                ...params,
                elementRadius: params.elementRadius,
                elementRadiusClosure: createElementRadiusFn(ctx, params.elementRadius),
                sourceMaxRadius: findStructureRadius(ctx, params.elementRadius)
            };
            if (selection_1.StructureSelection.isSingleton(inner)) {
                const surr = getIncludeSurroundingsWithRadius(ctx, ctx.inputStructure, inner.structure, prms);
                const ret = selection_1.StructureSelection.Singletons(ctx.inputStructure, surr);
                return ret;
            }
            else {
                const builder = new builders_1.UniqueStructuresBuilder(ctx.inputStructure);
                for (const s of inner.structures) {
                    builder.add(getIncludeSurroundingsWithRadius(ctx, ctx.inputStructure, s, prms));
                }
                return builder.getSelection();
            }
        }
        if (selection_1.StructureSelection.isSingleton(inner)) {
            const surr = getIncludeSurroundings(ctx, ctx.inputStructure, inner.structure, params);
            const ret = selection_1.StructureSelection.Singletons(ctx.inputStructure, surr);
            return ret;
        }
        else {
            const builder = new builders_1.UniqueStructuresBuilder(ctx.inputStructure);
            for (const s of inner.structures) {
                builder.add(getIncludeSurroundings(ctx, ctx.inputStructure, s, params));
            }
            return builder.getSelection();
        }
    };
}
function querySelection(selection, query) {
    return function query_querySelection(ctx) {
        const targetSel = selection(ctx);
        if (selection_1.StructureSelection.structureCount(targetSel) === 0)
            return targetSel;
        const ret = selection_1.StructureSelection.UniqueBuilder(ctx.inputStructure);
        const add = (s) => ret.add(s);
        selection_1.StructureSelection.forEach(targetSel, (s, sI) => {
            ctx.pushInputStructure(s);
            selection_1.StructureSelection.forEach(query(ctx), add);
            ctx.popInputStructure();
            if (sI % 10 === 0)
                ctx.throwIfTimedOut();
        });
        return ret.getSelection();
    };
}
function intersectBy(query, by) {
    return function query_intersectBy(ctx) {
        const selection = query(ctx);
        if (selection_1.StructureSelection.structureCount(selection) === 0)
            return selection;
        const bySel = by(ctx);
        if (selection_1.StructureSelection.structureCount(bySel) === 0)
            return selection_1.StructureSelection.Empty(ctx.inputStructure);
        const unionBy = selection_1.StructureSelection.unionStructure(bySel);
        const ret = selection_1.StructureSelection.UniqueBuilder(ctx.inputStructure);
        selection_1.StructureSelection.forEach(selection, (s, sI) => {
            const ii = (0, structure_set_1.structureIntersect)(unionBy, s);
            if (ii.elementCount !== 0)
                ret.add(ii);
            if (sI % 50 === 0)
                ctx.throwIfTimedOut();
        });
        return ret.getSelection();
    };
}
function exceptBy(query, by) {
    return function query_exceptBy(ctx) {
        const selection = query(ctx);
        if (selection_1.StructureSelection.structureCount(selection) === 0)
            return selection;
        const bySel = by(ctx);
        if (selection_1.StructureSelection.structureCount(bySel) === 0)
            return selection;
        const subtractBy = selection_1.StructureSelection.unionStructure(bySel);
        const ret = selection_1.StructureSelection.UniqueBuilder(ctx.inputStructure);
        selection_1.StructureSelection.forEach(selection, (s, sI) => {
            const diff = (0, structure_set_1.structureSubtract)(s, subtractBy);
            if (diff.elementCount !== 0)
                ret.add(diff);
            if (sI % 50 === 0)
                ctx.throwIfTimedOut();
        });
        return ret.getSelection();
    };
}
function union(query) {
    return function query_union(ctx) {
        const ret = selection_1.StructureSelection.LinearBuilder(ctx.inputStructure);
        ret.add(selection_1.StructureSelection.unionStructure(query(ctx)));
        return ret.getSelection();
    };
}
function expandProperty(query, property) {
    return function query_expandProperty(ctx) {
        const src = query(ctx);
        const propertyToStructureIndexMap = new Map();
        const builders = [];
        ctx.pushCurrentElement();
        selection_1.StructureSelection.forEach(src, (s, sI) => {
            ctx.element.structure = s;
            for (const unit of s.units) {
                ctx.element.unit = unit;
                const elements = unit.elements;
                for (let i = 0, _i = elements.length; i < _i; i++) {
                    ctx.element.element = elements[i];
                    const p = property(ctx);
                    let arr;
                    if (propertyToStructureIndexMap.has(p))
                        arr = propertyToStructureIndexMap.get(p);
                    else {
                        arr = generic_1.UniqueArray.create();
                        propertyToStructureIndexMap.set(p, arr);
                    }
                    generic_1.UniqueArray.add(arr, sI, sI);
                }
            }
            builders[sI] = ctx.inputStructure.subsetBuilder(true);
            if (sI % 10 === 0)
                ctx.throwIfTimedOut();
        });
        ctx.element.structure = ctx.inputStructure;
        for (const unit of ctx.inputStructure.units) {
            ctx.element.unit = unit;
            const elements = unit.elements;
            for (let i = 0, _i = elements.length; i < _i; i++) {
                ctx.element.element = elements[i];
                const p = property(ctx);
                if (!propertyToStructureIndexMap.has(p))
                    continue;
                const indices = propertyToStructureIndexMap.get(p).array;
                for (let _sI = 0, __sI = indices.length; _sI < __sI; _sI++) {
                    builders[indices[_sI]].addToUnit(unit.id, elements[i]);
                }
            }
        }
        ctx.popCurrentElement();
        const ret = selection_1.StructureSelection.UniqueBuilder(ctx.inputStructure);
        for (const b of builders)
            ret.add(b.getStructure());
        return ret.getSelection();
    };
}
function includeConnected({ query, layerCount, wholeResidues, bondTest, fixedPoint }) {
    const lc = Math.max(layerCount, 0);
    return function query_includeConnected(ctx) {
        const builder = selection_1.StructureSelection.UniqueBuilder(ctx.inputStructure);
        const src = query(ctx);
        ctx.pushCurrentBond();
        ctx.atomicBond.setTestFn(bondTest);
        selection_1.StructureSelection.forEach(src, (s, sI) => {
            let incl = s;
            if (fixedPoint) {
                while (true) {
                    const prevCount = incl.elementCount;
                    incl = includeConnectedStep(ctx, wholeResidues, incl);
                    if (incl.elementCount === prevCount)
                        break;
                }
            }
            else {
                for (let i = 0; i < lc; i++) {
                    incl = includeConnectedStep(ctx, wholeResidues, incl);
                }
            }
            builder.add(incl);
            if (sI % 10 === 0)
                ctx.throwIfTimedOut();
        });
        ctx.popCurrentBond();
        return builder.getSelection();
    };
}
function includeConnectedStep(ctx, wholeResidues, structure) {
    const expanded = expandConnected(ctx, structure);
    if (wholeResidues)
        return getWholeResidues(ctx, ctx.inputStructure, expanded);
    return expanded;
}
function expandConnected(ctx, structure) {
    const inputStructure = ctx.inputStructure;
    const interBonds = inputStructure.interUnitBonds;
    const builder = new unique_subset_builder_1.StructureUniqueSubsetBuilder(inputStructure);
    const atomicBond = ctx.atomicBond;
    // Process intra unit bonds
    for (const unit of structure.units) {
        if (unit.kind !== 0 /* Unit.Kind.Atomic */) {
            // add the whole unit
            builder.beginUnit(unit.id);
            for (let i = 0, _i = unit.elements.length; i < _i; i++) {
                builder.addElement(unit.elements[i]);
            }
            builder.commitUnit();
            continue;
        }
        const inputUnitA = inputStructure.unitMap.get(unit.id);
        const { offset: intraBondOffset, b: intraBondB, edgeProps: { flags, order, key } } = inputUnitA.bonds;
        atomicBond.setStructure(inputStructure);
        // Process intra unit bonds
        atomicBond.a.unit = inputUnitA;
        atomicBond.b.unit = inputUnitA;
        for (let i = 0, _i = unit.elements.length; i < _i; i++) {
            // add the current element
            builder.addToUnit(unit.id, unit.elements[i]);
            const aIndex = int_1.SortedArray.indexOf(inputUnitA.elements, unit.elements[i]);
            // check intra unit bonds
            for (let lI = intraBondOffset[aIndex], _lI = intraBondOffset[aIndex + 1]; lI < _lI; lI++) {
                const bIndex = intraBondB[lI];
                const bElement = inputUnitA.elements[bIndex];
                // Check if the element is already present:
                if (int_1.SortedArray.has(unit.elements, bElement) || builder.has(unit.id, bElement))
                    continue;
                atomicBond.aIndex = aIndex;
                atomicBond.a.element = unit.elements[i];
                atomicBond.bIndex = bIndex;
                atomicBond.b.element = bElement;
                atomicBond.type = flags[lI];
                atomicBond.order = order[lI];
                atomicBond.key = key[lI];
                if (atomicBond.test(ctx, true)) {
                    builder.addToUnit(unit.id, bElement);
                }
            }
        }
        // Process inter unit bonds
        for (const bondedUnit of interBonds.getConnectedUnits(inputUnitA.id)) {
            const currentUnitB = structure.unitMap.get(bondedUnit.unitB);
            const inputUnitB = inputStructure.unitMap.get(bondedUnit.unitB);
            for (const aI of bondedUnit.connectedIndices) {
                // check if the element is in the expanded structure
                if (!int_1.SortedArray.has(unit.elements, inputUnitA.elements[aI]))
                    continue;
                for (const bond of bondedUnit.getEdges(aI)) {
                    const bElement = inputUnitB.elements[bond.indexB];
                    // Check if the element is already present:
                    if ((currentUnitB && int_1.SortedArray.has(currentUnitB.elements, bElement)) || builder.has(bondedUnit.unitB, bElement))
                        continue;
                    atomicBond.a.unit = inputUnitA;
                    atomicBond.aIndex = aI;
                    atomicBond.a.element = inputUnitA.elements[aI];
                    atomicBond.b.unit = inputUnitB;
                    atomicBond.bIndex = bond.indexB;
                    atomicBond.b.element = bElement;
                    atomicBond.type = bond.props.flag;
                    atomicBond.order = bond.props.order;
                    atomicBond.key = bond.props.key;
                    if (atomicBond.test(ctx, true)) {
                        builder.addToUnit(bondedUnit.unitB, bElement);
                    }
                }
            }
        }
    }
    return builder.getStructure();
}
/**
 * Includes expanded surrounding ligands based on radius from the source, struct_conn entries & pdbx_molecule entries.
 */
function surroundingLigands({ query, radius, includeWater }) {
    return function query_surroundingLigands(ctx) {
        const inner = selection_1.StructureSelection.unionStructure(query(ctx));
        const surroundings = getWholeResidues(ctx, ctx.inputStructure, getIncludeSurroundings(ctx, ctx.inputStructure, inner, { radius }));
        const prd = getPrdAsymIdx(ctx.inputStructure);
        const graph = getStructConnInfo(ctx.inputStructure);
        const l = element_1.StructureElement.Location.create(surroundings);
        const includedPrdChains = new Map();
        const componentResidues = new residue_set_1.ResidueSet({ checkOperator: true });
        for (const unit of surroundings.units) {
            if (unit.kind !== 0 /* Unit.Kind.Atomic */)
                continue;
            l.unit = unit;
            const { elements } = unit;
            const chainsIt = int_1.Segmentation.transientSegments(unit.model.atomicHierarchy.chainAtomSegments, elements);
            const residuesIt = int_1.Segmentation.transientSegments(unit.model.atomicHierarchy.residueAtomSegments, elements);
            while (chainsIt.hasNext) {
                const chainSegment = chainsIt.move();
                l.element = elements[chainSegment.start];
                const asym_id = properties_1.StructureProperties.chain.label_asym_id(l);
                const op_name = properties_1.StructureProperties.unit.operator_name(l);
                // check for PRD molecules
                if (prd.has(asym_id)) {
                    if (includedPrdChains.has(asym_id)) {
                        (0, array_1.arraySetAdd)(includedPrdChains.get(asym_id), op_name);
                    }
                    else {
                        includedPrdChains.set(asym_id, [op_name]);
                    }
                    continue;
                }
                const entityType = properties_1.StructureProperties.entity.type(l);
                // test entity and chain
                if (entityType === 'water' || entityType === 'polymer')
                    continue;
                residuesIt.setSegment(chainSegment);
                while (residuesIt.hasNext) {
                    const residueSegment = residuesIt.move();
                    l.element = elements[residueSegment.start];
                    graph.addComponent(residue_set_1.ResidueSet.getEntryFromLocation(l), componentResidues);
                }
            }
            ctx.throwIfTimedOut();
        }
        // assemble the core structure
        const builder = ctx.inputStructure.subsetBuilder(true);
        for (const unit of ctx.inputStructure.units) {
            if (unit.kind !== 0 /* Unit.Kind.Atomic */)
                continue;
            l.unit = unit;
            const { elements } = unit;
            const chainsIt = int_1.Segmentation.transientSegments(unit.model.atomicHierarchy.chainAtomSegments, elements);
            const residuesIt = int_1.Segmentation.transientSegments(unit.model.atomicHierarchy.residueAtomSegments, elements);
            builder.beginUnit(unit.id);
            while (chainsIt.hasNext) {
                const chainSegment = chainsIt.move();
                l.element = elements[chainSegment.start];
                const asym_id = properties_1.StructureProperties.chain.label_asym_id(l);
                const op_name = properties_1.StructureProperties.unit.operator_name(l);
                if (includedPrdChains.has(asym_id) && includedPrdChains.get(asym_id).indexOf(op_name) >= 0) {
                    builder.addElementRange(elements, chainSegment.start, chainSegment.end);
                    continue;
                }
                if (!componentResidues.hasLabelAsymId(asym_id)) {
                    continue;
                }
                residuesIt.setSegment(chainSegment);
                while (residuesIt.hasNext) {
                    const residueSegment = residuesIt.move();
                    l.element = elements[residueSegment.start];
                    if (!componentResidues.has(l))
                        continue;
                    builder.addElementRange(elements, residueSegment.start, residueSegment.end);
                }
            }
            builder.commitUnit();
            ctx.throwIfTimedOut();
        }
        const components = (0, structure_set_1.structureUnion)(ctx.inputStructure, [builder.getStructure(), inner]);
        // add water
        if (includeWater) {
            const finalBuilder = new unique_subset_builder_1.StructureUniqueSubsetBuilder(ctx.inputStructure);
            const lookup = ctx.inputStructure.lookup3d;
            for (const unit of components.units) {
                const c = unit.conformation;
                const elements = unit.elements;
                for (let i = 0, _i = elements.length; i < _i; i++) {
                    const e = elements[i];
                    lookup.findIntoBuilderIf(c.x(e), c.y(e), c.z(e), radius, finalBuilder, testIsWater);
                    finalBuilder.addToUnit(unit.id, e);
                }
                ctx.throwIfTimedOut();
            }
            return selection_1.StructureSelection.Sequence(ctx.inputStructure, [finalBuilder.getStructure()]);
        }
        else {
            return selection_1.StructureSelection.Sequence(ctx.inputStructure, [components]);
        }
    };
}
const _entity_type = properties_1.StructureProperties.entity.type;
function testIsWater(l) {
    return _entity_type(l) === 'water';
}
function getPrdAsymIdx(structure) {
    const model = structure.models[0];
    const ids = new Set();
    if (!mmcif_1.MmcifFormat.is(model.sourceData))
        return ids;
    const { _rowCount, asym_id } = model.sourceData.data.db.pdbx_molecule;
    for (let i = 0; i < _rowCount; i++) {
        ids.add(asym_id.value(i));
    }
    return ids;
}
function getStructConnInfo(structure) {
    var _a, _b;
    const model = structure.models[0];
    const graph = new StructConnGraph();
    if (!mmcif_1.MmcifFormat.is(model.sourceData))
        return graph;
    const struct_conn = model.sourceData.data.db.struct_conn;
    const { conn_type_id } = struct_conn;
    const { ptnr1_label_asym_id, ptnr1_label_comp_id, ptnr1_label_seq_id, ptnr1_symmetry, pdbx_ptnr1_label_alt_id, pdbx_ptnr1_PDB_ins_code } = struct_conn;
    const { ptnr2_label_asym_id, ptnr2_label_comp_id, ptnr2_label_seq_id, ptnr2_symmetry, pdbx_ptnr2_label_alt_id, pdbx_ptnr2_PDB_ins_code } = struct_conn;
    for (let i = 0; i < struct_conn._rowCount; i++) {
        const bondType = conn_type_id.value(i);
        if (bondType !== 'covale' && bondType !== 'metalc')
            continue;
        const a = {
            label_asym_id: ptnr1_label_asym_id.value(i),
            label_comp_id: ptnr1_label_comp_id.value(i),
            label_seq_id: ptnr1_label_seq_id.value(i),
            label_alt_id: pdbx_ptnr1_label_alt_id.value(i),
            ins_code: pdbx_ptnr1_PDB_ins_code.value(i),
            operator_name: (_a = ptnr1_symmetry.value(i)) !== null && _a !== void 0 ? _a : '1_555'
        };
        const b = {
            label_asym_id: ptnr2_label_asym_id.value(i),
            label_comp_id: ptnr2_label_comp_id.value(i),
            label_seq_id: ptnr2_label_seq_id.value(i),
            label_alt_id: pdbx_ptnr2_label_alt_id.value(i),
            ins_code: pdbx_ptnr2_PDB_ins_code.value(i),
            operator_name: (_b = ptnr2_symmetry.value(i)) !== null && _b !== void 0 ? _b : '1_555'
        };
        graph.addEdge(a, b);
    }
    return graph;
}
class StructConnGraph {
    constructor() {
        this.vertices = new Map();
        this.edges = new Map();
    }
    addVertex(e, label) {
        if (this.vertices.has(label))
            return;
        this.vertices.set(label, e);
        this.edges.set(label, []);
    }
    addEdge(a, b) {
        const al = residue_set_1.ResidueSet.getLabel(a);
        const bl = residue_set_1.ResidueSet.getLabel(b);
        this.addVertex(a, al);
        this.addVertex(b, bl);
        (0, array_1.arraySetAdd)(this.edges.get(al), bl);
        (0, array_1.arraySetAdd)(this.edges.get(bl), al);
    }
    addComponent(start, set) {
        const startLabel = residue_set_1.ResidueSet.getLabel(start);
        if (!this.vertices.has(startLabel)) {
            set.add(start);
            return;
        }
        const visited = new Set();
        const added = new Set();
        const stack = [startLabel];
        added.add(startLabel);
        set.add(start);
        while (stack.length > 0) {
            const a = stack.pop();
            visited.add(a);
            const u = this.vertices.get(a);
            for (const b of this.edges.get(a)) {
                if (visited.has(b))
                    continue;
                stack.push(b);
                if (added.has(b))
                    continue;
                added.add(b);
                const v = this.vertices.get(b);
                if (u.operator_name === v.operator_name) {
                    set.add({ ...v, operator_name: start.operator_name });
                }
                else {
                    set.add(v);
                }
            }
        }
    }
}
// TODO: unionBy (skip this one?), cluster
