/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Vec3 } from '../../mol-math/linear-algebra/3d/vec3';
import { Sphere3D } from './primitives/sphere3d';
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
const v3add = Vec3.add;
const v3squaredDistance = Vec3.squaredDistance;
const v3distance = Vec3.distance;
export { CentroidHelper };
class CentroidHelper {
    reset() {
        Vec3.set(this.center, 0, 0, 0);
        this.radiusSq = 0;
        this.count = 0;
    }
    includeStep(p) {
        v3add(this.center, this.center, p);
        this.count++;
    }
    finishedIncludeStep() {
        if (this.count === 0)
            return;
        Vec3.scale(this.center, this.center, 1 / this.count);
    }
    radiusStep(p) {
        const d = v3squaredDistance(p, this.center);
        if (d > this.radiusSq)
            this.radiusSq = d;
    }
    radiusSphereStep(center, radius) {
        const _d = v3distance(center, this.center) + radius;
        const d = _d * _d;
        if (d > this.radiusSq)
            this.radiusSq = d;
    }
    getSphere(sphere) {
        if (!sphere)
            sphere = Sphere3D();
        Vec3.copy(sphere.center, this.center);
        sphere.radius = Math.sqrt(this.radiusSq);
        return sphere;
    }
    getCount() {
        return this.count;
    }
    constructor() {
        this.count = 0;
        this.center = Vec3();
        this.radiusSq = 0;
    }
}
(function (CentroidHelper) {
    const helper = new CentroidHelper();
    const posA = Vec3();
    const posB = Vec3();
    function fromArrays({ x, y, z }, to) {
        helper.reset();
        const n = x.length;
        for (let i = 0; i < n; i++) {
            Vec3.set(posA, x[i], y[i], z[i]);
            helper.includeStep(posA);
        }
        helper.finishedIncludeStep();
        for (let i = 0; i < n; i++) {
            Vec3.set(posA, x[i], y[i], z[i]);
            helper.radiusStep(posA);
        }
        Vec3.copy(to.center, helper.center);
        to.radius = Math.sqrt(helper.radiusSq);
        return to;
    }
    CentroidHelper.fromArrays = fromArrays;
    function fromProvider(count, getter, to) {
        helper.reset();
        for (let i = 0; i < count; i++) {
            getter(i, posA);
            helper.includeStep(posA);
        }
        helper.finishedIncludeStep();
        for (let i = 0; i < count; i++) {
            getter(i, posA);
            helper.radiusStep(posA);
        }
        Vec3.copy(to.center, helper.center);
        to.radius = Math.sqrt(helper.radiusSq);
        return to;
    }
    CentroidHelper.fromProvider = fromProvider;
    function fromPairProvider(count, getter, to) {
        helper.reset();
        for (let i = 0; i < count; i++) {
            getter(i, posA, posB);
            helper.includeStep(posA);
            helper.includeStep(posB);
        }
        helper.finishedIncludeStep();
        for (let i = 0; i < count; i++) {
            getter(i, posA, posB);
            helper.radiusStep(posA);
            helper.radiusStep(posB);
        }
        Vec3.copy(to.center, helper.center);
        to.radius = Math.sqrt(helper.radiusSq);
        return to;
    }
    CentroidHelper.fromPairProvider = fromPairProvider;
})(CentroidHelper || (CentroidHelper = {}));
