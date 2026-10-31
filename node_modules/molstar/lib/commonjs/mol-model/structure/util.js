"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCoarseBegCompId = getCoarseBegCompId;
exports.getElementMoleculeType = getElementMoleculeType;
exports.getAtomicMoleculeType = getAtomicMoleculeType;
exports.getAtomIdForAtomRole = getAtomIdForAtomRole;
exports.getPositions = getPositions;
const types_1 = require("./model/types");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
function getCoarseBegCompId(unit, element) {
    const entityKey = unit.coarseElements.entityKey[element];
    const seq = unit.model.sequence.byEntityKey[entityKey].sequence;
    const seq_id_begin = unit.coarseElements.seq_id_begin.value(element);
    return seq.compId.value(seq_id_begin - 1); // 1-indexed
}
function getElementMoleculeType(unit, element) {
    switch (unit.kind) {
        case 0 /* Unit.Kind.Atomic */:
            return unit.model.atomicHierarchy.derived.residue.moleculeType[unit.residueIndex[element]];
        case 1 /* Unit.Kind.Spheres */:
        case 2 /* Unit.Kind.Gaussians */:
            // TODO add unit.model.coarseHierarchy.derived.residue.moleculeType
            const compId = getCoarseBegCompId(unit, element);
            const cc = unit.model.properties.chemicalComponentMap.get(compId);
            if (cc)
                return (0, types_1.getMoleculeType)(cc.type, compId);
    }
    return 0 /* MoleculeType.Unknown */;
}
function getAtomicMoleculeType(model, rI) {
    return model.atomicHierarchy.derived.residue.moleculeType[rI];
}
const EmptyAtomIds = new Set();
function getAtomIdForAtomRole(polymerType, atomRole) {
    const p = types_1.PolymerTypeAtomRoleId[polymerType];
    if (p !== undefined) {
        const a = p[atomRole];
        if (a !== undefined)
            return a;
    }
    return EmptyAtomIds;
}
const tmpPositionsVec = linear_algebra_1.Vec3.zero();
function getPositions(unit, indices) {
    const c = unit.conformation;
    const positions = new Float32Array(indices.length * 3);
    const { elements } = unit;
    for (let i = 0, il = indices.length; i < il; ++i) {
        c.position(elements[indices[i]], tmpPositionsVec);
        linear_algebra_1.Vec3.toArray(tmpPositionsVec, positions, i * 3);
    }
    return positions;
}
