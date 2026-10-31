"use strict";
/**
 * Copyright (c) 2017-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Location = void 0;
const linear_algebra_1 = require("../../../../mol-math/linear-algebra");
var Location;
(function (Location) {
    function create(structure, unit, element) {
        return {
            kind: 'element-location',
            structure: structure,
            unit: unit,
            element: element || 0
        };
    }
    Location.create = create;
    function clone(l) {
        return create(l.structure, l.unit, l.element);
    }
    Location.clone = clone;
    function set(a, structure, unit, element) {
        if (structure)
            a.structure = structure;
        if (unit)
            a.unit = unit;
        if (element !== undefined)
            a.element = element;
        return a;
    }
    Location.set = set;
    function copy(out, a) {
        out.unit = a.unit;
        out.element = a.element;
        return out;
    }
    Location.copy = copy;
    function is(x) {
        return !!x && x.kind === 'element-location';
    }
    Location.is = is;
    function areEqual(a, b) {
        return a.unit === b.unit && a.element === b.element;
    }
    Location.areEqual = areEqual;
    const pA = (0, linear_algebra_1.Vec3)(), pB = (0, linear_algebra_1.Vec3)();
    function distance(a, b) {
        a.unit.conformation.position(a.element, pA);
        b.unit.conformation.position(b.element, pB);
        return linear_algebra_1.Vec3.distance(pA, pB);
    }
    Location.distance = distance;
    function position(out, l) {
        return l.unit.conformation.position(l.element, out);
    }
    Location.position = position;
    function residueIndex(l) {
        return l.unit.model.atomicHierarchy.residueAtomSegments.index[l.element];
    }
    Location.residueIndex = residueIndex;
    function chainIndex(l) {
        return l.unit.model.atomicHierarchy.chainAtomSegments.index[l.element];
    }
    Location.chainIndex = chainIndex;
})(Location || (exports.Location = Location = {}));
