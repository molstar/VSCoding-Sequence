/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Vec3 } from '../../linear-algebra';
export { Cell };
function Cell() {
    return Cell.empty();
}
(function (Cell) {
    function create(size, anglesInRadians) {
        return { size, anglesInRadians };
    }
    Cell.create = create;
    function empty() {
        return create(Vec3(), Vec3());
    }
    Cell.empty = empty;
    function fromBasis(x, y, z) {
        const a = Vec3.magnitude(x);
        const b = Vec3.magnitude(y);
        const c = Vec3.magnitude(z);
        const alpha = Math.acos(Vec3.dot(y, z) / (b * c));
        const beta = Math.acos(Vec3.dot(x, z) / (a * c));
        const gamma = Math.acos(Vec3.dot(x, y) / (a * b));
        if (a <= 0 || b <= 0 || c <= 0 || alpha >= Math.PI || beta >= Math.PI || gamma >= Math.PI) {
            return empty();
        }
        else {
            return create(Vec3.create(a, b, c), Vec3.create(alpha, beta, gamma));
        }
    }
    Cell.fromBasis = fromBasis;
})(Cell || (Cell = {}));
