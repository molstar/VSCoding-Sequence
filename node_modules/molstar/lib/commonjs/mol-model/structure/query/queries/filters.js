"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.pick = pick;
exports.first = first;
exports.getCurrentStructureProperties = getCurrentStructureProperties;
exports.withSameAtomProperties = withSameAtomProperties;
exports.areIntersectedBy = areIntersectedBy;
exports.within = within;
exports.isConnectedTo = isConnectedTo;
const set_1 = require("../../../../mol-util/set");
const structure_1 = require("../../structure");
const selection_1 = require("../selection");
const structure_set_1 = require("../utils/structure-set");
const linear_algebra_1 = require("../../../../mol-math/linear-algebra");
const structure_distance_1 = require("../utils/structure-distance");
const structure_2 = require("../../structure/structure");
const int_1 = require("../../../../mol-data/int");
function pick(query, pred) {
    return ctx => {
        const sel = query(ctx);
        const ret = selection_1.StructureSelection.LinearBuilder(ctx.inputStructure);
        ctx.pushCurrentElement();
        selection_1.StructureSelection.forEach(sel, (s, i) => {
            ctx.currentStructure = s;
            if (pred(ctx))
                ret.add(s);
            if (i % 100)
                ctx.throwIfTimedOut();
        });
        ctx.popCurrentStructure();
        return ret.getSelection();
    };
}
function first(query) {
    return ctx => {
        const sel = query(ctx);
        const ret = selection_1.StructureSelection.LinearBuilder(ctx.inputStructure);
        if (sel.kind === 'singletons') {
            if (sel.structure.elementCount > 0) {
                const u = sel.structure.units[0];
                const s = structure_2.Structure.create([u.getChild(int_1.SortedArray.ofSingleton(u.elements[0]))], { parent: ctx.inputStructure });
                ret.add(s);
            }
        }
        else {
            if (sel.structures.length > 0) {
                ret.add(sel.structures[0]);
            }
        }
        return ret.getSelection();
    };
}
function getCurrentStructureProperties(ctx, props, set) {
    const { units } = ctx.currentStructure;
    const l = ctx.pushCurrentElement();
    l.structure = ctx.currentStructure;
    for (const unit of units) {
        l.unit = unit;
        const elements = unit.elements;
        const fn = props;
        //        if (Unit.isAtomic(unit)) fn = props.atomic;
        //        else fn = props.coarse;
        if (!fn)
            continue;
        for (let j = 0, _j = elements.length; j < _j; j++) {
            l.element = elements[j];
            set.add(fn(ctx));
        }
        ctx.throwIfTimedOut();
    }
    ctx.popCurrentElement();
    return set;
}
function getSelectionProperties(ctx, query, props) {
    const set = new Set();
    const sel = query(ctx);
    ctx.pushCurrentElement();
    selection_1.StructureSelection.forEach(sel, (s, i) => {
        ctx.currentStructure = s;
        getCurrentStructureProperties(ctx, props, set);
        if (i % 10)
            ctx.throwIfTimedOut();
    });
    ctx.popCurrentElement();
    return set;
}
function withSameAtomProperties(query, propertySource, props) {
    return ctx => {
        const sel = query(ctx);
        const propSet = getSelectionProperties(ctx, propertySource, props);
        const ret = selection_1.StructureSelection.LinearBuilder(ctx.inputStructure);
        ctx.pushCurrentStructure();
        selection_1.StructureSelection.forEach(sel, (s, i) => {
            ctx.currentStructure = s;
            const currentProps = getCurrentStructureProperties(ctx, props, new Set());
            if (set_1.SetUtils.isSuperset(propSet, currentProps)) {
                ret.add(s);
            }
            if (i % 10)
                ctx.throwIfTimedOut();
        });
        ctx.popCurrentStructure();
        return ret.getSelection();
    };
}
function areIntersectedBy(query, by) {
    return ctx => {
        const mask = selection_1.StructureSelection.unionStructure(by(ctx));
        const ret = selection_1.StructureSelection.LinearBuilder(ctx.inputStructure);
        selection_1.StructureSelection.forEach(query(ctx), (s, i) => {
            if ((0, structure_set_1.structureAreIntersecting)(mask, s))
                ret.add(s);
            if (i % 10)
                ctx.throwIfTimedOut();
        });
        return ret.getSelection();
    };
}
function within(params) {
    return queryCtx => {
        const ctx = {
            queryCtx,
            selection: params.query(queryCtx),
            target: params.target(queryCtx),
            maxRadius: params.maxRadius,
            minRadius: params.minRadius ? Math.max(0, params.minRadius) : 0,
            elementRadius: params.elementRadius,
            invert: !!params.invert,
        };
        if (ctx.minRadius === 0 && typeof params.minRadius === 'undefined') {
            return withinMaxRadiusLookup(ctx);
        }
        else if (ctx.minRadius === 0) {
            return withinMaxRadius(ctx);
        }
        else {
            return withinMinMaxRadius(ctx);
        }
    };
}
function withinMaxRadiusLookup({ queryCtx, selection, target, maxRadius, invert }) {
    const targetLookup = selection_1.StructureSelection.unionStructure(target).lookup3d;
    const ret = selection_1.StructureSelection.LinearBuilder(queryCtx.inputStructure);
    const pos = linear_algebra_1.Vec3.zero();
    selection_1.StructureSelection.forEach(selection, (s, sI) => {
        const { units } = s;
        let withinRadius = false;
        for (let i = 0, _i = units.length; i < _i; i++) {
            const unit = units[i];
            const { elements, conformation: c } = unit;
            for (let i = 0, _i = elements.length; i < _i; i++) {
                const e = elements[i];
                c.position(e, pos);
                if (targetLookup.check(pos[0], pos[1], pos[2], maxRadius + c.r(e))) {
                    withinRadius = true;
                    break;
                }
            }
            if (withinRadius)
                break;
        }
        if (invert)
            withinRadius = !withinRadius;
        if (withinRadius)
            ret.add(s);
        if (sI % 10 === 0)
            queryCtx.throwIfTimedOut();
    });
    return ret.getSelection();
}
function withinMaxRadius({ queryCtx, selection, target, maxRadius, invert, elementRadius }) {
    const targetStructure = selection_1.StructureSelection.unionStructure(target);
    const ret = selection_1.StructureSelection.LinearBuilder(queryCtx.inputStructure);
    queryCtx.pushCurrentElement();
    selection_1.StructureSelection.forEach(selection, (s, sI) => {
        let withinRadius = (0, structure_distance_1.checkStructureMaxRadiusDistance)(queryCtx, targetStructure, s, maxRadius, elementRadius);
        if (invert)
            withinRadius = !withinRadius;
        if (withinRadius)
            ret.add(s);
        if (sI % 10 === 0)
            queryCtx.throwIfTimedOut();
    });
    queryCtx.popCurrentElement();
    return ret.getSelection();
}
function withinMinMaxRadius({ queryCtx, selection, target, minRadius, maxRadius, invert, elementRadius }) {
    const targetStructure = selection_1.StructureSelection.unionStructure(target);
    const ret = selection_1.StructureSelection.LinearBuilder(queryCtx.inputStructure);
    queryCtx.pushCurrentElement();
    selection_1.StructureSelection.forEach(selection, (s, sI) => {
        let withinRadius = (0, structure_distance_1.checkStructureMinMaxDistance)(queryCtx, targetStructure, s, minRadius, maxRadius, elementRadius);
        if (invert)
            withinRadius = !withinRadius;
        if (withinRadius)
            ret.add(s);
        if (sI % 10 === 0)
            queryCtx.throwIfTimedOut();
    });
    queryCtx.popCurrentElement();
    return ret.getSelection();
}
function checkConnected(ctx, structure) {
    const { queryCtx, input, target, disjunct } = ctx;
    const atomicBond = queryCtx.atomicBond;
    const interBonds = input.interUnitBonds;
    atomicBond.setStructure(input);
    for (const unit of structure.units) {
        if (!structure_1.Unit.isAtomic(unit))
            continue;
        const inputUnit = input.unitMap.get(unit.id);
        const { offset, b, edgeProps: { flags, order, key } } = inputUnit.bonds;
        const bondedUnits = interBonds.getConnectedUnits(unit.id);
        const buCount = bondedUnits.length;
        const srcElements = unit.elements;
        const inputElements = inputUnit.elements;
        for (let i = 0, _i = srcElements.length; i < _i; i++) {
            const inputIndex = int_1.SortedArray.indexOf(inputElements, srcElements[i]);
            atomicBond.a.unit = inputUnit;
            atomicBond.b.unit = inputUnit;
            // tElement.unit = unit;
            for (let l = offset[inputIndex], _l = offset[inputIndex + 1]; l < _l; l++) {
                // tElement.element = inputElements[b[l]];
                atomicBond.b.element = inputUnit.elements[b[l]];
                if (disjunct && int_1.SortedArray.has(unit.elements, atomicBond.b.element))
                    continue;
                if (!target.hasElement(atomicBond.b))
                    continue;
                atomicBond.aIndex = inputIndex;
                atomicBond.a.element = srcElements[i];
                atomicBond.bIndex = b[l];
                atomicBond.type = flags[l];
                atomicBond.order = order[l];
                atomicBond.key = key[l];
                if (atomicBond.test(queryCtx, true))
                    return true;
            }
            for (let li = 0; li < buCount; li++) {
                const lu = bondedUnits[li];
                const bUnit = input.unitMap.get(lu.unitB);
                const bElements = bUnit.elements;
                const bonds = lu.getEdges(inputIndex);
                for (let bi = 0, _bi = bonds.length; bi < _bi; bi++) {
                    const bond = bonds[bi];
                    atomicBond.b.unit = bUnit;
                    atomicBond.b.element = bElements[bond.indexB];
                    if (!target.hasElement(atomicBond.b))
                        continue;
                    if (disjunct && structure.hasElement(atomicBond.b))
                        continue;
                    atomicBond.a.unit = inputUnit;
                    atomicBond.aIndex = inputIndex;
                    atomicBond.a.element = srcElements[i];
                    atomicBond.bIndex = bond.indexB;
                    atomicBond.type = bond.props.flag;
                    atomicBond.order = bond.props.order;
                    atomicBond.key = bond.props.key;
                    if (atomicBond.test(queryCtx, true))
                        return true;
                }
            }
        }
    }
    return false;
}
function isConnectedTo({ query, target, disjunct, invert, bondTest }) {
    return ctx => {
        const targetSel = target(ctx);
        if (selection_1.StructureSelection.isEmpty(targetSel))
            return targetSel;
        const selection = query(ctx);
        if (selection_1.StructureSelection.isEmpty(selection))
            return selection;
        const connCtx = {
            queryCtx: ctx,
            input: ctx.inputStructure,
            disjunct,
            target: selection_1.StructureSelection.unionStructure(targetSel)
        };
        const ret = selection_1.StructureSelection.LinearBuilder(ctx.inputStructure);
        ctx.pushCurrentBond();
        ctx.atomicBond.setTestFn(bondTest);
        selection_1.StructureSelection.forEach(selection, (s, sI) => {
            if (checkConnected(connCtx, s)) {
                ret.add(s);
            }
            else if (invert) {
                ret.add(s);
            }
            if (sI % 5 === 0)
                ctx.throwIfTimedOut();
        });
        ctx.popCurrentBond();
        return ret.getSelection();
    };
}
