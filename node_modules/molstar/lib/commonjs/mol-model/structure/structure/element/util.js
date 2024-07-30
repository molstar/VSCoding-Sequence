"use strict";
/**
 * Copyright (c) 2017-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.property = property;
exports.atomicProperty = atomicProperty;
exports.coarseProperty = coarseProperty;
exports.residueIndex = residueIndex;
exports.chainIndex = chainIndex;
exports.entityIndex = entityIndex;
const unit_1 = require("../unit");
const properties_1 = require("../properties");
function property(p) { return p; }
function _wrongUnitKind(kind) { throw new Error(`Property only available for ${kind} models.`); }
function atomicProperty(p) {
    return property(l => unit_1.Unit.isAtomic(l.unit) ? p(l) : _wrongUnitKind('atomic'));
}
function coarseProperty(p) {
    return property(l => unit_1.Unit.isCoarse(l.unit) ? p(l) : _wrongUnitKind('coarse'));
}
function residueIndex(e) {
    if (unit_1.Unit.isAtomic(e.unit)) {
        return e.unit.residueIndex[e.element];
    }
    else {
        // TODO: throw error instead?
        return -1;
    }
}
function chainIndex(e) {
    if (unit_1.Unit.isAtomic(e.unit)) {
        return e.unit.chainIndex[e.element];
    }
    else {
        // TODO: throw error instead?
        return -1;
    }
}
function entityIndex(l) {
    return properties_1.StructureProperties.entity.key(l);
}
