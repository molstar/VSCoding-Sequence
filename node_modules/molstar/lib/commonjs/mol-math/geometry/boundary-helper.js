"use strict";
/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoundaryHelper = void 0;
const vec3_1 = require("../linear-algebra/3d/vec3");
const centroid_helper_1 = require("./centroid-helper");
const geometry_1 = require("../geometry");
const box3d_1 = require("./primitives/box3d");
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
const v3dot = vec3_1.Vec3.dot;
const v3copy = vec3_1.Vec3.copy;
const v3scaleAndSub = vec3_1.Vec3.scaleAndSub;
const v3scaleAndAdd = vec3_1.Vec3.scaleAndAdd;
// implementing http://www.ep.liu.se/ecp/034/009/ecp083409.pdf
class BoundaryHelper {
    computeExtrema(i, p) {
        const d = v3dot(this.dir[i], p);
        if (d < this.minDist[i]) {
            this.minDist[i] = d;
            v3copy(this.extrema[i * 2], p);
        }
        if (d > this.maxDist[i]) {
            this.maxDist[i] = d;
            v3copy(this.extrema[i * 2 + 1], p);
        }
    }
    computeSphereExtrema(i, center, radius) {
        const di = this.dir[i];
        const d = v3dot(di, center);
        if (d - radius < this.minDist[i]) {
            this.minDist[i] = d - radius;
            v3scaleAndSub(this.extrema[i * 2], center, di, radius);
        }
        if (d + radius > this.maxDist[i]) {
            this.maxDist[i] = d + radius;
            v3scaleAndAdd(this.extrema[i * 2 + 1], center, di, radius);
        }
    }
    includeSphere(s) {
        if (geometry_1.Sphere3D.hasExtrema(s) && s.extrema.length > 1) {
            for (const e of s.extrema) {
                this.includePosition(e);
            }
        }
        else {
            this.includePositionRadius(s.center, s.radius);
        }
    }
    includePosition(p) {
        for (let i = 0; i < this.dirLength; ++i) {
            this.computeExtrema(i, p);
        }
    }
    includePositionRadius(center, radius) {
        for (let i = 0; i < this.dirLength; ++i) {
            this.computeSphereExtrema(i, center, radius);
        }
    }
    finishedIncludeStep() {
        for (let i = 0; i < this.extrema.length; i++) {
            this.centroidHelper.includeStep(this.extrema[i]);
        }
        this.centroidHelper.finishedIncludeStep();
    }
    radiusSphere(s) {
        if (geometry_1.Sphere3D.hasExtrema(s) && s.extrema.length > 1) {
            for (const e of s.extrema) {
                this.radiusPosition(e);
            }
        }
        else {
            this.radiusPositionRadius(s.center, s.radius);
        }
    }
    radiusPosition(p) {
        this.centroidHelper.radiusStep(p);
    }
    radiusPositionRadius(center, radius) {
        this.centroidHelper.radiusSphereStep(center, radius);
    }
    getSphere(sphere) {
        return geometry_1.Sphere3D.setExtrema(this.centroidHelper.getSphere(sphere), this.extrema.slice());
    }
    getBox(box) {
        return box3d_1.Box3D.fromVec3Array(box || (0, box3d_1.Box3D)(), this.extrema);
    }
    reset() {
        for (let i = 0; i < this.dirLength; ++i) {
            this.minDist[i] = Infinity;
            this.maxDist[i] = -Infinity;
            this.extrema[i * 2] = (0, vec3_1.Vec3)();
            this.extrema[i * 2 + 1] = (0, vec3_1.Vec3)();
        }
        this.centroidHelper.reset();
    }
    constructor(quality) {
        this.minDist = [];
        this.maxDist = [];
        this.extrema = [];
        this.centroidHelper = new centroid_helper_1.CentroidHelper();
        this.dir = getEposDir(quality);
        this.dirLength = this.dir.length;
        this.reset();
    }
}
exports.BoundaryHelper = BoundaryHelper;
function getEposDir(quality) {
    let dir;
    switch (quality) {
        case '6':
            dir = [...Type001];
            break;
        case '14':
            dir = [...Type001, ...Type111];
            break;
        case '26':
            dir = [...Type001, ...Type111, ...Type011];
            break;
        case '98':
            dir = [...Type001, ...Type111, ...Type011, ...Type012, ...Type112, ...Type122];
            break;
    }
    return dir.map(a => {
        const v = vec3_1.Vec3.create(a[0], a[1], a[2]);
        return vec3_1.Vec3.normalize(v, v);
    });
}
const Type001 = [
    [1, 0, 0], [0, 1, 0], [0, 0, 1]
];
const Type111 = [
    [1, 1, 1], [-1, 1, 1], [-1, -1, 1], [1, -1, 1]
];
const Type011 = [
    [1, 1, 0], [1, -1, 0], [1, 0, 1], [1, 0, -1], [0, 1, 1], [0, 1, -1]
];
const Type012 = [
    [0, 1, 2], [0, 2, 1], [1, 0, 2], [2, 0, 1], [1, 2, 0], [2, 1, 0],
    [0, 1, -2], [0, 2, -1], [1, 0, -2], [2, 0, -1], [1, -2, 0], [2, -1, 0]
];
const Type112 = [
    [1, 1, 2], [2, 1, 1], [1, 2, 1], [1, -1, 2], [1, 1, -2], [1, -1, -2],
    [2, -1, 1], [2, 1, -1], [2, -1, -1], [1, -2, 1], [1, 2, -1], [1, -2, -1]
];
const Type122 = [
    [2, 2, 1], [1, 2, 2], [2, 1, 2], [2, -2, 1], [2, 2, -1], [2, -2, -1],
    [1, -2, 2], [1, 2, -2], [1, -2, -2], [2, -1, 2], [2, 1, -2], [2, -1, -2]
];
