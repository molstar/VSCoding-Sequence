"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRegularGrid3dDelta = getRegularGrid3dDelta;
exports.fillGridDim = fillGridDim;
const linear_algebra_1 = require("../linear-algebra");
const geometry_1 = require("../geometry");
function getRegularGrid3dDelta({ box, dimensions }) {
    return linear_algebra_1.Vec3.div((0, linear_algebra_1.Vec3)(), geometry_1.Box3D.size((0, linear_algebra_1.Vec3)(), box), linear_algebra_1.Vec3.subScalar((0, linear_algebra_1.Vec3)(), dimensions, 1));
}
function fillGridDim(length, start, step) {
    const a = new Float32Array(length);
    for (let i = 0; i < a.length; i++) {
        a[i] = start + (step * i);
    }
    return a;
}
