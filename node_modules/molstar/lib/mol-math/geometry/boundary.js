/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Vec3 } from '../linear-algebra';
import { OrderedSet } from '../../mol-data/int';
import { BoundaryHelper } from './boundary-helper';
import { Box3D, Sphere3D } from '../geometry';
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
const v3set = Vec3.set;
const boundaryHelperCoarse = new BoundaryHelper('14');
const boundaryHelperFine = new BoundaryHelper('98');
function getBoundaryHelper(count) {
    return count > 10000 ? boundaryHelperCoarse : boundaryHelperFine;
}
export function getFastBoundary(data) {
    const box = Box3D.computeBounding(data);
    return { box, sphere: Sphere3D.fromBox3D(Sphere3D(), box) };
}
const p = Vec3();
export function getBoundary(data) {
    const { x, y, z, radius, indices } = data;
    const n = OrderedSet.size(indices);
    if (n > 250000) {
        return getFastBoundary(data);
    }
    const boundaryHelper = getBoundaryHelper(n);
    boundaryHelper.reset();
    for (let t = 0; t < n; t++) {
        const i = OrderedSet.getAt(indices, t);
        v3set(p, x[i], y[i], z[i]);
        boundaryHelper.includePositionRadius(p, (radius && radius[i]) || 0);
    }
    boundaryHelper.finishedIncludeStep();
    for (let t = 0; t < n; t++) {
        const i = OrderedSet.getAt(indices, t);
        v3set(p, x[i], y[i], z[i]);
        boundaryHelper.radiusPositionRadius(p, (radius && radius[i]) || 0);
    }
    const sphere = boundaryHelper.getSphere();
    if (!radius && Sphere3D.hasExtrema(sphere) && n <= sphere.extrema.length) {
        const extrema = [];
        for (let t = 0; t < n; t++) {
            const i = OrderedSet.getAt(indices, t);
            extrema.push(Vec3.create(x[i], y[i], z[i]));
        }
        Sphere3D.setExtrema(sphere, extrema);
    }
    return { box: boundaryHelper.getBox(), sphere };
}
