"use strict";
/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.all = exports.none = void 0;
exports.residues = residues;
exports.chains = chains;
exports.atoms = atoms;
exports.rings = rings;
exports.querySelection = querySelection;
exports.bondedAtomicPairs = bondedAtomicPairs;
const generic_1 = require("../../../../mol-data/generic");
const int_1 = require("../../../../mol-data/int");
const structure_1 = require("../../structure");
const structure_2 = require("../../structure/structure");
const selection_1 = require("../selection");
const builders_1 = require("../utils/builders");
const structure_set_1 = require("../utils/structure-set");
const none = ctx => selection_1.StructureSelection.Sequence(ctx.inputStructure, []);
exports.none = none;
const all = ctx => selection_1.StructureSelection.Singletons(ctx.inputStructure, ctx.inputStructure);
exports.all = all;
function residues(params) { return atoms({ ...params, groupBy: ctx => structure_1.StructureProperties.residue.key(ctx.element) }); }
function chains(params) { return atoms({ ...params, groupBy: ctx => structure_1.StructureProperties.chain.key(ctx.element) }); }
function _true(ctx) { return true; }
function _zero(ctx) { return 0; }
function atoms(params) {
    if (!params || (!params.atomTest && !params.residueTest && !params.chainTest && !params.entityTest && !params.unitTest && !params.groupBy))
        return exports.all;
    if (!!params.atomTest && !params.residueTest && !params.chainTest && !params.entityTest && !params.unitTest && !params.groupBy)
        return atomGroupsLinear(params.atomTest);
    const normalized = {
        unitTest: params.unitTest || _true,
        entityTest: params.entityTest || _true,
        chainTest: params.chainTest || _true,
        residueTest: params.residueTest || _true,
        atomTest: params.atomTest || _true,
        groupBy: params.groupBy || _zero,
    };
    if (!params.groupBy)
        return atomGroupsSegmented(normalized);
    return atomGroupsGrouped(normalized);
}
function atomGroupsLinear(atomTest) {
    return function query_atomGroupsLinear(ctx) {
        const { inputStructure } = ctx;
        const { units } = inputStructure;
        const l = ctx.pushCurrentElement();
        const builder = inputStructure.subsetBuilder(true);
        l.structure = inputStructure;
        for (const unit of units) {
            l.unit = unit;
            const elements = unit.elements;
            builder.beginUnit(unit.id);
            for (let j = 0, _j = elements.length; j < _j; j++) {
                l.element = elements[j];
                if (atomTest(ctx))
                    builder.addElement(l.element);
            }
            builder.commitUnit();
            ctx.throwIfTimedOut();
        }
        ctx.popCurrentElement();
        return selection_1.StructureSelection.Singletons(inputStructure, builder.getStructure());
    };
}
function atomGroupsSegmented({ unitTest, entityTest, chainTest, residueTest, atomTest }) {
    return function query_atomGroupsSegmented(ctx) {
        const { inputStructure } = ctx;
        const { units } = inputStructure;
        const l = ctx.pushCurrentElement();
        const builder = inputStructure.subsetBuilder(true);
        const chainLevel = residueTest === _true && atomTest === _true;
        const residueLevel = atomTest === _true;
        l.structure = inputStructure;
        for (const unit of units) {
            l.unit = unit;
            if (!unitTest(ctx))
                continue;
            const { elements, model } = unit;
            builder.beginUnit(unit.id);
            if (unit.kind === 0 /* Unit.Kind.Atomic */) {
                const chainsIt = int_1.Segmentation.transientSegments(unit.model.atomicHierarchy.chainAtomSegments, elements);
                const residuesIt = int_1.Segmentation.transientSegments(unit.model.atomicHierarchy.residueAtomSegments, elements);
                while (chainsIt.hasNext) {
                    const chainSegment = chainsIt.move();
                    l.element = elements[chainSegment.start];
                    // test entity and chain
                    if (!entityTest(ctx) || !chainTest(ctx))
                        continue;
                    if (chainLevel) {
                        builder.addElementRange(elements, chainSegment.start, chainSegment.end);
                        continue;
                    }
                    residuesIt.setSegment(chainSegment);
                    while (residuesIt.hasNext) {
                        const residueSegment = residuesIt.move();
                        l.element = elements[residueSegment.start];
                        // test residue
                        if (!residueTest(ctx))
                            continue;
                        if (residueLevel) {
                            builder.addElementRange(elements, residueSegment.start, residueSegment.end);
                            continue;
                        }
                        for (let j = residueSegment.start, _j = residueSegment.end; j < _j; j++) {
                            l.element = elements[j];
                            // test atom
                            if (atomTest(ctx)) {
                                builder.addElement(l.element);
                            }
                        }
                    }
                }
            }
            else {
                const { chainElementSegments } = unit.kind === 1 /* Unit.Kind.Spheres */ ? model.coarseHierarchy.spheres : model.coarseHierarchy.gaussians;
                const chainsIt = int_1.Segmentation.transientSegments(chainElementSegments, elements);
                while (chainsIt.hasNext) {
                    const chainSegment = chainsIt.move();
                    l.element = elements[chainSegment.start];
                    // test entity and chain
                    if (!entityTest(ctx) || !chainTest(ctx))
                        continue;
                    if (chainLevel) {
                        builder.addElementRange(elements, chainSegment.start, chainSegment.end);
                        continue;
                    }
                    for (let j = chainSegment.start, _j = chainSegment.end; j < _j; j++) {
                        l.element = elements[j];
                        // test residue/coarse element
                        if (residueTest(ctx)) {
                            builder.addElement(l.element);
                        }
                    }
                }
            }
            builder.commitUnit();
            ctx.throwIfTimedOut();
        }
        ctx.popCurrentElement();
        return selection_1.StructureSelection.Singletons(inputStructure, builder.getStructure());
    };
}
function atomGroupsGrouped({ unitTest, entityTest, chainTest, residueTest, atomTest, groupBy }) {
    return function query_atomGroupsGrouped(ctx) {
        const { inputStructure } = ctx;
        const { units } = inputStructure;
        const l = ctx.pushCurrentElement();
        const builder = new builders_1.LinearGroupingBuilder(inputStructure);
        l.structure = inputStructure;
        for (const unit of units) {
            l.unit = unit;
            if (!unitTest(ctx))
                continue;
            const { elements, model } = unit;
            if (unit.kind === 0 /* Unit.Kind.Atomic */) {
                const chainsIt = int_1.Segmentation.transientSegments(model.atomicHierarchy.chainAtomSegments, elements);
                const residuesIt = int_1.Segmentation.transientSegments(model.atomicHierarchy.residueAtomSegments, elements);
                while (chainsIt.hasNext) {
                    const chainSegment = chainsIt.move();
                    l.element = elements[chainSegment.start];
                    // test entity and chain
                    if (!entityTest(ctx) || !chainTest(ctx))
                        continue;
                    residuesIt.setSegment(chainSegment);
                    while (residuesIt.hasNext) {
                        const residueSegment = residuesIt.move();
                        l.element = elements[residueSegment.start];
                        // test residue
                        if (!residueTest(ctx))
                            continue;
                        for (let j = residueSegment.start, _j = residueSegment.end; j < _j; j++) {
                            l.element = elements[j];
                            // test atom
                            if (atomTest(ctx)) {
                                builder.add(groupBy(ctx), unit.id, l.element);
                            }
                        }
                    }
                }
            }
            else {
                const { chainElementSegments } = unit.kind === 1 /* Unit.Kind.Spheres */ ? model.coarseHierarchy.spheres : model.coarseHierarchy.gaussians;
                const chainsIt = int_1.Segmentation.transientSegments(chainElementSegments, elements);
                while (chainsIt.hasNext) {
                    const chainSegment = chainsIt.move();
                    l.element = elements[chainSegment.start];
                    // test entity and chain
                    if (!entityTest(ctx) || !chainTest(ctx))
                        continue;
                    for (let j = chainSegment.start, _j = chainSegment.end; j < _j; j++) {
                        l.element = elements[j];
                        // test residue/coarse element
                        if (residueTest(ctx)) {
                            builder.add(groupBy(ctx), unit.id, l.element);
                        }
                    }
                }
            }
            ctx.throwIfTimedOut();
        }
        ctx.popCurrentElement();
        return builder.getSelection();
    };
}
function getRingStructure(unit, ring, inputStructure) {
    const elements = new Int32Array(ring.length);
    for (let i = 0, _i = ring.length; i < _i; i++)
        elements[i] = unit.elements[ring[i]];
    return structure_2.Structure.create([unit.getChild(int_1.SortedArray.ofSortedArray(elements))], { parent: inputStructure });
}
function rings(fingerprints, onlyAromatic) {
    return function query_rings(ctx) {
        const { units } = ctx.inputStructure;
        const ret = selection_1.StructureSelection.LinearBuilder(ctx.inputStructure);
        if (!fingerprints || fingerprints.length === 0) {
            for (const u of units) {
                if (!structure_1.Unit.isAtomic(u))
                    continue;
                if (onlyAromatic) {
                    for (const r of u.rings.aromaticRings) {
                        ret.add(getRingStructure(u, u.rings.all[r], ctx.inputStructure));
                    }
                }
                else {
                    for (const r of u.rings.all) {
                        ret.add(getRingStructure(u, r, ctx.inputStructure));
                    }
                }
            }
        }
        else {
            const uniqueFps = generic_1.UniqueArray.create();
            for (let i = 0; i < fingerprints.length; i++)
                generic_1.UniqueArray.add(uniqueFps, fingerprints[i], fingerprints[i]);
            for (const u of units) {
                if (!structure_1.Unit.isAtomic(u))
                    continue;
                const rings = u.rings;
                for (const fp of uniqueFps.array) {
                    if (!rings.byFingerprint.has(fp))
                        continue;
                    for (const r of rings.byFingerprint.get(fp)) {
                        if (onlyAromatic && !rings.aromaticRings.includes(r))
                            continue;
                        ret.add(getRingStructure(u, rings.all[r], ctx.inputStructure));
                    }
                }
            }
        }
        return ret.getSelection();
    };
}
function querySelection(selection, query, inComplement = false) {
    return function query_querySelection(ctx) {
        const targetSel = selection(ctx);
        if (selection_1.StructureSelection.structureCount(targetSel) === 0)
            return targetSel;
        const target = inComplement
            ? (0, structure_set_1.structureSubtract)(ctx.inputStructure, selection_1.StructureSelection.unionStructure(targetSel))
            : selection_1.StructureSelection.unionStructure(targetSel);
        if (target.elementCount === 0)
            return selection_1.StructureSelection.Empty(ctx.inputStructure);
        ctx.throwIfTimedOut();
        ctx.pushInputStructure(target);
        const result = query(ctx);
        ctx.popInputStructure();
        return selection_1.StructureSelection.withInputStructure(result, ctx.inputStructure);
    };
}
function bondedAtomicPairs(bondTest) {
    return function query_bondedAtomicPairs(ctx) {
        const structure = ctx.inputStructure;
        const interBonds = structure.interUnitBonds;
        // Note: each bond is called twice, that's why we need the unique builder.
        const ret = selection_1.StructureSelection.UniqueBuilder(ctx.inputStructure);
        ctx.pushCurrentBond();
        const atomicBond = ctx.atomicBond;
        atomicBond.setTestFn(bondTest);
        atomicBond.setStructure(structure);
        // Process intra unit bonds
        for (const unit of structure.units) {
            if (unit.kind !== 0 /* Unit.Kind.Atomic */)
                continue;
            const { offset: intraBondOffset, b: intraBondB, edgeProps: { flags, order, key } } = unit.bonds;
            atomicBond.a.unit = unit;
            atomicBond.b.unit = unit;
            for (let i = 0, _i = unit.elements.length; i < _i; i++) {
                atomicBond.aIndex = i;
                atomicBond.a.element = unit.elements[i];
                // check intra unit bonds
                for (let lI = intraBondOffset[i], _lI = intraBondOffset[i + 1]; lI < _lI; lI++) {
                    atomicBond.bIndex = intraBondB[lI];
                    atomicBond.b.element = unit.elements[intraBondB[lI]];
                    atomicBond.type = flags[lI];
                    atomicBond.order = order[lI];
                    atomicBond.key = key[lI];
                    // No need to "swap test" because each bond direction will be visited eventually.
                    if (atomicBond.test(ctx, false)) {
                        const b = structure.subsetBuilder(false);
                        b.beginUnit(unit.id);
                        b.addElement(atomicBond.a.element);
                        b.addElement(atomicBond.b.element);
                        b.commitUnit();
                        ret.add(b.getStructure());
                    }
                }
            }
        }
        // Process inter unit bonds
        for (const bond of interBonds.edges) {
            atomicBond.a.unit = structure.unitMap.get(bond.unitA);
            atomicBond.a.element = atomicBond.a.unit.elements[bond.indexA];
            atomicBond.aIndex = bond.indexA;
            atomicBond.b.unit = structure.unitMap.get(bond.unitB);
            atomicBond.b.element = atomicBond.b.unit.elements[bond.indexB];
            atomicBond.bIndex = bond.indexB;
            atomicBond.order = bond.props.order;
            atomicBond.type = bond.props.flag;
            atomicBond.key = bond.props.key;
            // No need to "swap test" because each bond direction will be visited eventually.
            if (atomicBond.test(ctx, false)) {
                const b = structure.subsetBuilder(false);
                b.addToUnit(atomicBond.a.unit.id, atomicBond.a.element);
                b.addToUnit(atomicBond.b.unit.id, atomicBond.b.element);
                ret.add(b.getStructure());
            }
        }
        ctx.popCurrentBond();
        return ret.getSelection();
    };
}
