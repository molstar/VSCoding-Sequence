"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeSymbol = typeSymbol;
exports.formalCharge = formalCharge;
exports.atomId = atomId;
exports.altLoc = altLoc;
exports.compId = compId;
exports.interBondCount = interBondCount;
exports.intraBondCount = intraBondCount;
exports.bondCount = bondCount;
exports.bondToElementCount = bondToElementCount;
exports.intraConnectedTo = intraConnectedTo;
exports.interConnectedTo = interConnectedTo;
exports.connectedTo = connectedTo;
exports.eachInterBondedAtom = eachInterBondedAtom;
exports.eachIntraBondedAtom = eachIntraBondedAtom;
exports.eachBondedAtom = eachBondedAtom;
exports.eachResidueAtom = eachResidueAtom;
const types_1 = require("../../../mol-model/structure/model/types");
const int_1 = require("../../../mol-data/int");
function typeSymbol(unit, index) {
    return unit.model.atomicHierarchy.atoms.type_symbol.value(unit.elements[index]);
}
function formalCharge(unit, index) {
    return unit.model.atomicHierarchy.atoms.pdbx_formal_charge.value(unit.elements[index]);
}
function atomId(unit, index) {
    return unit.model.atomicHierarchy.atoms.label_atom_id.value(unit.elements[index]);
}
function altLoc(unit, index) {
    return unit.model.atomicHierarchy.atoms.label_alt_id.value(unit.elements[index]);
}
function compId(unit, index) {
    return unit.model.atomicHierarchy.atoms.label_comp_id.value(unit.elements[index]);
}
//
function interBondCount(structure, unit, index) {
    let count = 0;
    const indices = structure.interUnitBonds.getEdgeIndices(index, unit.id);
    for (let i = 0, il = indices.length; i < il; ++i) {
        const b = structure.interUnitBonds.edges[indices[i]];
        if (types_1.BondType.isCovalent(b.props.flag))
            count += 1;
    }
    return count;
}
function intraBondCount(unit, index) {
    let count = 0;
    const { offset, edgeProps: { flags } } = unit.bonds;
    for (let i = offset[index], il = offset[index + 1]; i < il; ++i) {
        if (types_1.BondType.isCovalent(flags[i]))
            count += 1;
    }
    return count;
}
function bondCount(structure, unit, index) {
    return interBondCount(structure, unit, index) + intraBondCount(unit, index);
}
function bondToElementCount(structure, unit, index, element) {
    let count = 0;
    eachBondedAtom(structure, unit, index, (unit, index) => {
        if (typeSymbol(unit, index) === element)
            count += 1;
    });
    return count;
}
//
function intraConnectedTo(unit, indexA, indexB) {
    const { offset, b, edgeProps: { flags } } = unit.bonds;
    types_1.BondType.is;
    for (let i = offset[indexA], il = offset[indexA + 1]; i < il; ++i) {
        if (b[i] === indexB && types_1.BondType.isCovalent(flags[i]))
            return true;
    }
    return false;
}
function interConnectedTo(structure, unitA, indexA, unitB, indexB) {
    const b = structure.interUnitBonds.getEdge(indexA, unitA.id, indexB, unitB.id);
    return b && types_1.BondType.isCovalent(b.props.flag);
}
function connectedTo(structure, unitA, indexA, unitB, indexB) {
    return unitA === unitB ? intraConnectedTo(unitA, indexA, indexB) : interConnectedTo(structure, unitA, indexA, unitB, indexB);
}
//
function eachInterBondedAtom(structure, unit, index, cb) {
    const indices = structure.interUnitBonds.getEdgeIndices(index, unit.id);
    for (let i = 0, il = indices.length; i < il; ++i) {
        const b = structure.interUnitBonds.edges[indices[i]];
        const uB = structure.unitMap.get(b.unitB);
        if (types_1.BondType.isCovalent(b.props.flag))
            cb(uB, b.indexB);
    }
}
function eachIntraBondedAtom(unit, index, cb) {
    const { offset, b, edgeProps: { flags } } = unit.bonds;
    for (let i = offset[index], il = offset[index + 1]; i < il; ++i) {
        if (types_1.BondType.isCovalent(flags[i]))
            cb(unit, b[i]);
    }
}
function eachBondedAtom(structure, unit, index, cb) {
    eachInterBondedAtom(structure, unit, index, cb);
    eachIntraBondedAtom(unit, index, cb);
}
//
function eachResidueAtom(unit, index, cb) {
    const { offsets } = unit.model.atomicHierarchy.residueAtomSegments;
    const rI = unit.getResidueIndex(index);
    for (let i = offsets[rI], il = offsets[rI + 1]; i < il; ++i) {
        // TODO optimize, avoid search with .indexOf
        const idx = int_1.SortedArray.indexOf(unit.elements, i);
        if (idx !== -1)
            cb(idx);
    }
}
