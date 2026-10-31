"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrincipalAxes = void 0;
const matrix_1 = require("./matrix");
const vec3_1 = require("../3d/vec3");
const svd_1 = require("./svd");
const geometry_1 = require("../../geometry");
const common_1 = require("../3d/common");
var PrincipalAxes;
(function (PrincipalAxes) {
    function ofPositions(positions) {
        const momentsAxes = calculateMomentsAxes(positions);
        const boxAxes = calculateBoxAxes(positions, momentsAxes);
        return { momentsAxes, boxAxes };
    }
    PrincipalAxes.ofPositions = ofPositions;
    function calculateMomentsAxes(positions) {
        if (positions.length === 3) {
            return geometry_1.Axes3D.create(vec3_1.Vec3.fromArray((0, vec3_1.Vec3)(), positions, 0), vec3_1.Vec3.create(1, 0, 0), vec3_1.Vec3.create(0, 1, 0), vec3_1.Vec3.create(0, 0, 1));
        }
        const points = matrix_1.Matrix.fromArray(positions, 3, positions.length / 3);
        const n = points.rows;
        const n3 = n / 3;
        const A = matrix_1.Matrix.create(3, 3);
        const W = matrix_1.Matrix.create(1, 3);
        const U = matrix_1.Matrix.create(3, 3);
        const V = matrix_1.Matrix.create(3, 3);
        // calculate
        const mean = matrix_1.Matrix.meanRows(points);
        const pointsM = matrix_1.Matrix.subRows(matrix_1.Matrix.clone(points), mean);
        const pointsT = matrix_1.Matrix.transpose(matrix_1.Matrix.create(n, 3), pointsM);
        matrix_1.Matrix.multiplyABt(A, pointsT, pointsT);
        (0, svd_1.svd)(A, W, U, V);
        // origin
        const origin = vec3_1.Vec3.create(mean[0], mean[1], mean[2]);
        // directions
        const dirA = vec3_1.Vec3.create(U.data[0], U.data[3], U.data[6]);
        const dirB = vec3_1.Vec3.create(U.data[1], U.data[4], U.data[7]);
        const dirC = vec3_1.Vec3.create(U.data[2], U.data[5], U.data[8]);
        vec3_1.Vec3.scale(dirA, dirA, Math.sqrt(W.data[0] / n3));
        vec3_1.Vec3.scale(dirB, dirB, Math.sqrt(W.data[1] / n3));
        vec3_1.Vec3.scale(dirC, dirC, Math.sqrt(W.data[2] / n3));
        return geometry_1.Axes3D.create(origin, dirA, dirB, dirC);
    }
    PrincipalAxes.calculateMomentsAxes = calculateMomentsAxes;
    function calculateNormalizedAxes(momentsAxes) {
        const a = geometry_1.Axes3D.clone(momentsAxes);
        if (vec3_1.Vec3.magnitude(a.dirC) < common_1.EPSILON) {
            vec3_1.Vec3.cross(a.dirC, a.dirA, a.dirB);
        }
        return geometry_1.Axes3D.normalize(a, a);
    }
    PrincipalAxes.calculateNormalizedAxes = calculateNormalizedAxes;
    const tmpBoxVec = (0, vec3_1.Vec3)();
    /**
     * Get the scale/length for each dimension for a box around the axes
     * to enclose the given positions
     */
    function calculateBoxAxes(positions, momentsAxes) {
        if (positions.length === 3) {
            return geometry_1.Axes3D.clone(momentsAxes);
        }
        let d1a = -Infinity;
        let d1b = -Infinity;
        let d2a = -Infinity;
        let d2b = -Infinity;
        let d3a = -Infinity;
        let d3b = -Infinity;
        const p = (0, vec3_1.Vec3)();
        const t = (0, vec3_1.Vec3)();
        const center = momentsAxes.origin;
        const a = calculateNormalizedAxes(momentsAxes);
        for (let i = 0, il = positions.length; i < il; i += 3) {
            vec3_1.Vec3.projectPointOnVector(p, vec3_1.Vec3.fromArray(p, positions, i), a.dirA, center);
            const dp1 = vec3_1.Vec3.dot(a.dirA, vec3_1.Vec3.normalize(t, vec3_1.Vec3.sub(t, p, center)));
            const dt1 = vec3_1.Vec3.distance(p, center);
            if (dp1 > 0) {
                if (dt1 > d1a)
                    d1a = dt1;
            }
            else {
                if (dt1 > d1b)
                    d1b = dt1;
            }
            vec3_1.Vec3.projectPointOnVector(p, vec3_1.Vec3.fromArray(p, positions, i), a.dirB, center);
            const dp2 = vec3_1.Vec3.dot(a.dirB, vec3_1.Vec3.normalize(t, vec3_1.Vec3.sub(t, p, center)));
            const dt2 = vec3_1.Vec3.distance(p, center);
            if (dp2 > 0) {
                if (dt2 > d2a)
                    d2a = dt2;
            }
            else {
                if (dt2 > d2b)
                    d2b = dt2;
            }
            vec3_1.Vec3.projectPointOnVector(p, vec3_1.Vec3.fromArray(p, positions, i), a.dirC, center);
            const dp3 = vec3_1.Vec3.dot(a.dirC, vec3_1.Vec3.normalize(t, vec3_1.Vec3.sub(t, p, center)));
            const dt3 = vec3_1.Vec3.distance(p, center);
            if (dp3 > 0) {
                if (dt3 > d3a)
                    d3a = dt3;
            }
            else {
                if (dt3 > d3b)
                    d3b = dt3;
            }
        }
        const dirA = vec3_1.Vec3.setMagnitude((0, vec3_1.Vec3)(), a.dirA, (d1a + d1b) / 2);
        const dirB = vec3_1.Vec3.setMagnitude((0, vec3_1.Vec3)(), a.dirB, (d2a + d2b) / 2);
        const dirC = vec3_1.Vec3.setMagnitude((0, vec3_1.Vec3)(), a.dirC, (d3a + d3b) / 2);
        const okDirA = vec3_1.Vec3.isFinite(dirA);
        const okDirB = vec3_1.Vec3.isFinite(dirB);
        const okDirC = vec3_1.Vec3.isFinite(dirC);
        const origin = (0, vec3_1.Vec3)();
        const addCornerHelper = function (d1, d2, d3) {
            vec3_1.Vec3.copy(tmpBoxVec, center);
            if (okDirA)
                vec3_1.Vec3.scaleAndAdd(tmpBoxVec, tmpBoxVec, a.dirA, d1);
            if (okDirB)
                vec3_1.Vec3.scaleAndAdd(tmpBoxVec, tmpBoxVec, a.dirB, d2);
            if (okDirC)
                vec3_1.Vec3.scaleAndAdd(tmpBoxVec, tmpBoxVec, a.dirC, d3);
            vec3_1.Vec3.add(origin, origin, tmpBoxVec);
        };
        addCornerHelper(d1a, d2a, d3a);
        addCornerHelper(d1a, d2a, -d3b);
        addCornerHelper(d1a, -d2b, -d3b);
        addCornerHelper(d1a, -d2b, d3a);
        addCornerHelper(-d1b, -d2b, -d3b);
        addCornerHelper(-d1b, -d2b, d3a);
        addCornerHelper(-d1b, d2a, d3a);
        addCornerHelper(-d1b, d2a, -d3b);
        vec3_1.Vec3.scale(origin, origin, 1 / 8);
        return geometry_1.Axes3D.create(origin, dirA, dirB, dirC);
    }
    PrincipalAxes.calculateBoxAxes = calculateBoxAxes;
})(PrincipalAxes || (exports.PrincipalAxes = PrincipalAxes = {}));
