/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { PolymerTypeAtomRoleId, getMoleculeType } from './model/types';
import { Vec3 } from '../../mol-math/linear-algebra';
export function getCoarseBegCompId(unit, element) {
    const entityKey = unit.coarseElements.entityKey[element];
    const seq = unit.model.sequence.byEntityKey[entityKey].sequence;
    const seq_id_begin = unit.coarseElements.seq_id_begin.value(element);
    return seq.compId.value(seq_id_begin - 1); // 1-indexed
}
export function getElementMoleculeType(unit, element) {
    switch (unit.kind) {
        case 0 /* Unit.Kind.Atomic */:
            return unit.model.atomicHierarchy.derived.residue.moleculeType[unit.residueIndex[element]];
        case 1 /* Unit.Kind.Spheres */:
        case 2 /* Unit.Kind.Gaussians */:
            // TODO add unit.model.coarseHierarchy.derived.residue.moleculeType
            const compId = getCoarseBegCompId(unit, element);
            const cc = unit.model.properties.chemicalComponentMap.get(compId);
            if (cc)
                return getMoleculeType(cc.type, compId);
    }
    return 0 /* MoleculeType.Unknown */;
}
export function getAtomicMoleculeType(model, rI) {
    return model.atomicHierarchy.derived.residue.moleculeType[rI];
}
const EmptyAtomIds = new Set();
export function getAtomIdForAtomRole(polymerType, atomRole) {
    const p = PolymerTypeAtomRoleId[polymerType];
    if (p !== undefined) {
        const a = p[atomRole];
        if (a !== undefined)
            return a;
    }
    return EmptyAtomIds;
}
const tmpPositionsVec = Vec3.zero();
export function getPositions(unit, indices) {
    const c = unit.conformation;
    const positions = new Float32Array(indices.length * 3);
    const { elements } = unit;
    for (let i = 0, il = indices.length; i < il; ++i) {
        c.position(elements[indices[i]], tmpPositionsVec);
        Vec3.toArray(tmpPositionsVec, positions, i * 3);
    }
    return positions;
}
