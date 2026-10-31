"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cell = Cell;
const linear_algebra_1 = require("../../linear-algebra");
function Cell() {
    return Cell.empty();
}
(function (Cell) {
    function create(size, anglesInRadians) {
        return { size, anglesInRadians };
    }
    Cell.create = create;
    function empty() {
        return create((0, linear_algebra_1.Vec3)(), (0, linear_algebra_1.Vec3)());
    }
    Cell.empty = empty;
    function fromBasis(x, y, z) {
        const a = linear_algebra_1.Vec3.magnitude(x);
        const b = linear_algebra_1.Vec3.magnitude(y);
        const c = linear_algebra_1.Vec3.magnitude(z);
        const alpha = Math.acos(linear_algebra_1.Vec3.dot(y, z) / (b * c));
        const beta = Math.acos(linear_algebra_1.Vec3.dot(x, z) / (a * c));
        const gamma = Math.acos(linear_algebra_1.Vec3.dot(x, y) / (a * b));
        if (a <= 0 || b <= 0 || c <= 0 || alpha >= Math.PI || beta >= Math.PI || gamma >= Math.PI) {
            return empty();
        }
        else {
            return create(linear_algebra_1.Vec3.create(a, b, c), linear_algebra_1.Vec3.create(alpha, beta, gamma));
        }
    }
    Cell.fromBasis = fromBasis;
})(Cell || (exports.Cell = Cell = {}));
