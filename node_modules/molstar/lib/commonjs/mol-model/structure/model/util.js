"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcModelCenter = calcModelCenter;
exports.getAsymIdCount = getAsymIdCount;
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const array_1 = require("../../../mol-util/array");
function calcModelCenter(atomicConformation, coarseConformation) {
    const rangesX = [];
    const rangesY = [];
    const rangesZ = [];
    if (atomicConformation.x.length) {
        rangesX.push(...(0, array_1.arrayMinMax)(atomicConformation.x));
        rangesY.push(...(0, array_1.arrayMinMax)(atomicConformation.y));
        rangesZ.push(...(0, array_1.arrayMinMax)(atomicConformation.z));
    }
    if (coarseConformation) {
        if (coarseConformation.spheres.x.length) {
            rangesX.push(...(0, array_1.arrayMinMax)(coarseConformation.spheres.x));
            rangesY.push(...(0, array_1.arrayMinMax)(coarseConformation.spheres.y));
            rangesZ.push(...(0, array_1.arrayMinMax)(coarseConformation.spheres.z));
        }
        if (coarseConformation.gaussians.x.length) {
            rangesX.push(...(0, array_1.arrayMinMax)(coarseConformation.gaussians.x));
            rangesY.push(...(0, array_1.arrayMinMax)(coarseConformation.gaussians.y));
            rangesZ.push(...(0, array_1.arrayMinMax)(coarseConformation.gaussians.z));
        }
    }
    const [minX, maxX] = (0, array_1.arrayMinMax)(rangesX);
    const [minY, maxY] = (0, array_1.arrayMinMax)(rangesY);
    const [minZ, maxZ] = (0, array_1.arrayMinMax)(rangesZ);
    const x = minX + (maxX - minX) / 2;
    const y = minY + (maxY - minY) / 2;
    const z = minZ + (maxZ - minZ) / 2;
    return linear_algebra_1.Vec3.create(x, y, z);
}
function getAsymIdCount(model) {
    const auth = new Set();
    const label = new Set();
    model.properties.structAsymMap.forEach(({ auth_id }, label_id) => {
        auth.add(auth_id);
        label.add(label_id);
    });
    return { auth: auth.size, label: label.size };
}
