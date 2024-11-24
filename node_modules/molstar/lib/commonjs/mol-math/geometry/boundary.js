"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFastBoundary = getFastBoundary;
exports.getBoundary = getBoundary;
const linear_algebra_1 = require("../linear-algebra");
const int_1 = require("../../mol-data/int");
const boundary_helper_1 = require("./boundary-helper");
const geometry_1 = require("../geometry");
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
const v3set = linear_algebra_1.Vec3.set;
const boundaryHelperCoarse = new boundary_helper_1.BoundaryHelper('14');
const boundaryHelperFine = new boundary_helper_1.BoundaryHelper('98');
function getBoundaryHelper(count) {
    return count > 10000 ? boundaryHelperCoarse : boundaryHelperFine;
}
function getFastBoundary(data) {
    const box = geometry_1.Box3D.computeBounding(data);
    return { box, sphere: geometry_1.Sphere3D.fromBox3D((0, geometry_1.Sphere3D)(), box) };
}
const p = (0, linear_algebra_1.Vec3)();
function getBoundary(data) {
    const { x, y, z, radius, indices } = data;
    const n = int_1.OrderedSet.size(indices);
    if (n > 250000) {
        return getFastBoundary(data);
    }
    const boundaryHelper = getBoundaryHelper(n);
    boundaryHelper.reset();
    for (let t = 0; t < n; t++) {
        const i = int_1.OrderedSet.getAt(indices, t);
        v3set(p, x[i], y[i], z[i]);
        boundaryHelper.includePositionRadius(p, (radius && radius[i]) || 0);
    }
    boundaryHelper.finishedIncludeStep();
    for (let t = 0; t < n; t++) {
        const i = int_1.OrderedSet.getAt(indices, t);
        v3set(p, x[i], y[i], z[i]);
        boundaryHelper.radiusPositionRadius(p, (radius && radius[i]) || 0);
    }
    const sphere = boundaryHelper.getSphere();
    if (!radius && geometry_1.Sphere3D.hasExtrema(sphere) && n <= sphere.extrema.length) {
        const extrema = [];
        for (let t = 0; t < n; t++) {
            const i = int_1.OrderedSet.getAt(indices, t);
            extrema.push(linear_algebra_1.Vec3.create(x[i], y[i], z[i]));
        }
        geometry_1.Sphere3D.setExtrema(sphere, extrema);
    }
    return { box: boundaryHelper.getBox(), sphere };
}
