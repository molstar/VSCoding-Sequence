"use strict";
/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPositionsArray = toPositionsArray;
exports.getPrincipalAxes = getPrincipalAxes;
const principal_axes_1 = require("../../../../mol-math/linear-algebra/matrix/principal-axes");
const linear_algebra_1 = require("../../../../mol-math/linear-algebra");
const tempPos = (0, linear_algebra_1.Vec3)();
function toPositionsArray(unit) {
    const { elements, conformation } = unit;
    const positions = new Float32Array(elements.length * 3);
    for (let i = 0, il = elements.length; i < il; i++) {
        conformation.invariantPosition(elements[i], tempPos);
        linear_algebra_1.Vec3.toArray(tempPos, positions, i * 3);
    }
    return positions;
}
function getPrincipalAxes(unit) {
    const positions = toPositionsArray(unit);
    return principal_axes_1.PrincipalAxes.ofPositions(positions);
}
