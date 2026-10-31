"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.structureUnion = structureUnion;
exports.structureAreEqual = structureAreEqual;
exports.structureAreIntersecting = structureAreIntersecting;
exports.structureIntersect = structureIntersect;
exports.structureSubtract = structureSubtract;
const structure_1 = require("../../structure");
const int_1 = require("../../../../mol-data/int");
function structureUnion(source, structures) {
    if (structures.length === 0)
        return structure_1.Structure.Empty;
    if (structures.length === 1)
        return structures[0];
    const unitMap = new Map();
    const fullUnits = new Set();
    for (const { units } of structures) {
        for (let i = 0, _i = units.length; i < _i; i++) {
            const u = units[i];
            if (unitMap.has(u.id)) {
                // check if there is anything more to union in this particual unit.
                if (fullUnits.has(u.id))
                    continue;
                const merged = int_1.SortedArray.union(unitMap.get(u.id), u.elements);
                unitMap.set(u.id, merged);
                if (merged.length === source.unitMap.get(u.id).elements.length)
                    fullUnits.add(u.id);
            }
            else {
                unitMap.set(u.id, u.elements);
                if (u.elements.length === source.unitMap.get(u.id).elements.length)
                    fullUnits.add(u.id);
            }
        }
    }
    const builder = source.subsetBuilder(true);
    unitMap.forEach(buildUnion, builder);
    return builder.getStructure();
}
function buildUnion(elements, id) {
    this.setUnit(id, elements);
}
function structureAreEqual(sA, sB) {
    if (sA === sB)
        return true;
    if (sA.units.length !== sB.units.length)
        return false;
    const aU = sA.units, bU = sB.unitMap;
    for (let i = 0, _i = aU.length; i < _i; i++) {
        const u = aU[i];
        if (!bU.has(u.id))
            return false;
        const v = bU.get(u.id);
        if (!int_1.SortedArray.areEqual(u.elements, v.elements))
            return false;
    }
    return true;
}
function structureAreIntersecting(sA, sB) {
    if (sA === sB)
        return true;
    let a, b;
    if (sA.units.length < sB.units.length) {
        a = sA;
        b = sB;
    }
    else {
        a = sB;
        b = sA;
    }
    const aU = a.units, bU = b.unitMap;
    for (let i = 0, _i = aU.length; i < _i; i++) {
        const u = aU[i];
        if (!bU.has(u.id))
            continue;
        const v = bU.get(u.id);
        if (int_1.SortedArray.areIntersecting(u.elements, v.elements))
            return true;
    }
    return false;
}
function structureIntersect(sA, sB) {
    if (sA === sB)
        return sA;
    if (!structureAreIntersecting(sA, sB))
        return structure_1.Structure.Empty;
    let a, b;
    if (sA.units.length < sB.units.length) {
        a = sA;
        b = sB;
    }
    else {
        a = sB;
        b = sA;
    }
    const aU = a.units, bU = b.unitMap;
    const units = [];
    for (let i = 0, _i = aU.length; i < _i; i++) {
        const u = aU[i];
        if (!bU.has(u.id))
            continue;
        const v = bU.get(u.id);
        if (int_1.SortedArray.areIntersecting(u.elements, v.elements)) {
            const int = int_1.SortedArray.intersect(u.elements, v.elements);
            units[units.length] = u.getChild(int);
        }
    }
    return structure_1.Structure.create(units, { parent: sA.parent || sB.parent });
}
function structureSubtract(a, b) {
    if (a === b)
        return structure_1.Structure.Empty;
    if (!structureAreIntersecting(a, b))
        return a;
    const aU = a.units, bU = b.unitMap;
    const units = [];
    for (let i = 0, _i = aU.length; i < _i; i++) {
        const u = aU[i];
        if (!bU.has(u.id)) {
            units[units.length] = u;
            continue;
        }
        const v = bU.get(u.id);
        const sub = int_1.SortedArray.subtract(u.elements, v.elements);
        if (sub.length > 0) {
            units[units.length] = u.getChild(sub);
        }
    }
    return structure_1.Structure.create(units, { parent: a.parent || b.parent });
}
