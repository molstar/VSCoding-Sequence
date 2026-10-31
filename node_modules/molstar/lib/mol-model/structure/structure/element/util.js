/**
 * Copyright (c) 2017-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Unit } from '../unit';
import { StructureProperties } from '../properties';
export function property(p) { return p; }
function _wrongUnitKind(kind) { throw new Error(`Property only available for ${kind} models.`); }
export function atomicProperty(p) {
    return property(l => Unit.isAtomic(l.unit) ? p(l) : _wrongUnitKind('atomic'));
}
export function coarseProperty(p) {
    return property(l => Unit.isCoarse(l.unit) ? p(l) : _wrongUnitKind('coarse'));
}
export function residueIndex(e) {
    if (Unit.isAtomic(e.unit)) {
        return e.unit.residueIndex[e.element];
    }
    else {
        // TODO: throw error instead?
        return -1;
    }
}
export function chainIndex(e) {
    if (Unit.isAtomic(e.unit)) {
        return e.unit.chainIndex[e.element];
    }
    else {
        // TODO: throw error instead?
        return -1;
    }
}
export function entityIndex(l) {
    return StructureProperties.entity.key(l);
}
