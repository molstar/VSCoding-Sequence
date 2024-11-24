"use strict";
/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCurveSegmentState = createCurveSegmentState;
exports.interpolateCurveSegment = interpolateCurveSegment;
exports.interpolatePointsAndTangents = interpolatePointsAndTangents;
exports.interpolateNormals = interpolateNormals;
exports.interpolateSizes = interpolateSizes;
const linear_algebra_1 = require("../../../../../mol-math/linear-algebra");
const interpolate_1 = require("../../../../../mol-math/interpolate");
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
const v3fromArray = linear_algebra_1.Vec3.fromArray;
const v3toArray = linear_algebra_1.Vec3.toArray;
const v3normalize = linear_algebra_1.Vec3.normalize;
const v3sub = linear_algebra_1.Vec3.sub;
const v3spline = linear_algebra_1.Vec3.spline;
const v3slerp = linear_algebra_1.Vec3.slerp;
const v3copy = linear_algebra_1.Vec3.copy;
const v3cross = linear_algebra_1.Vec3.cross;
const v3orthogonalize = linear_algebra_1.Vec3.orthogonalize;
const v3matchDirection = linear_algebra_1.Vec3.matchDirection;
const v3scale = linear_algebra_1.Vec3.scale;
const v3add = linear_algebra_1.Vec3.add;
function createCurveSegmentState(linearSegments) {
    const n = linearSegments + 1;
    const pn = n * 3;
    return {
        curvePoints: new Float32Array(pn),
        tangentVectors: new Float32Array(pn),
        normalVectors: new Float32Array(pn),
        binormalVectors: new Float32Array(pn),
        widthValues: new Float32Array(n),
        heightValues: new Float32Array(n),
        linearSegments
    };
}
function interpolateCurveSegment(state, controls, tension, shift) {
    interpolatePointsAndTangents(state, controls, tension, shift);
    interpolateNormals(state, controls);
}
const tanA = (0, linear_algebra_1.Vec3)();
const tanB = (0, linear_algebra_1.Vec3)();
const curvePoint = (0, linear_algebra_1.Vec3)();
function interpolatePointsAndTangents(state, controls, tension, shift) {
    const { curvePoints, tangentVectors, linearSegments } = state;
    const { p0, p1, p2, p3, p4, secStrucFirst, secStrucLast } = controls;
    const shift1 = 1 - shift;
    const tensionBeg = secStrucFirst ? 0.5 : tension;
    const tensionEnd = secStrucLast ? 0.5 : tension;
    for (let j = 0; j <= linearSegments; ++j) {
        const t = j * 1.0 / linearSegments;
        if (t < shift1) {
            const te = (0, interpolate_1.lerp)(tensionBeg, tension, t);
            v3spline(curvePoint, p0, p1, p2, p3, t + shift, te);
            v3spline(tanA, p0, p1, p2, p3, t + shift + 0.01, tensionBeg);
            v3spline(tanB, p0, p1, p2, p3, t + shift - 0.01, tensionBeg);
        }
        else {
            const te = (0, interpolate_1.lerp)(tension, tensionEnd, t);
            v3spline(curvePoint, p1, p2, p3, p4, t - shift1, te);
            v3spline(tanA, p1, p2, p3, p4, t - shift1 + 0.01, te);
            v3spline(tanB, p1, p2, p3, p4, t - shift1 - 0.01, te);
        }
        v3toArray(curvePoint, curvePoints, j * 3);
        v3normalize(tangentVec, v3sub(tangentVec, tanA, tanB));
        v3toArray(tangentVec, tangentVectors, j * 3);
    }
}
const tmpNormal = (0, linear_algebra_1.Vec3)();
const tangentVec = (0, linear_algebra_1.Vec3)();
const normalVec = (0, linear_algebra_1.Vec3)();
const binormalVec = (0, linear_algebra_1.Vec3)();
const prevNormal = (0, linear_algebra_1.Vec3)();
const nextNormal = (0, linear_algebra_1.Vec3)();
const firstTangentVec = (0, linear_algebra_1.Vec3)();
const lastTangentVec = (0, linear_algebra_1.Vec3)();
const firstNormalVec = (0, linear_algebra_1.Vec3)();
const lastNormalVec = (0, linear_algebra_1.Vec3)();
/**
 * Populate normalVectors by interpolating from firstDirection to lastDirection with
 * resulting vector perpendicular to tangentVectors and binormalVectors
 */
function interpolateNormals(state, controls) {
    const { curvePoints, tangentVectors, normalVectors, binormalVectors } = state;
    const { d12: firstDirection, d23: lastDirection } = controls;
    const n = curvePoints.length / 3;
    v3fromArray(firstTangentVec, tangentVectors, 0);
    v3fromArray(lastTangentVec, tangentVectors, (n - 1) * 3);
    v3orthogonalize(firstNormalVec, firstTangentVec, firstDirection);
    v3orthogonalize(lastNormalVec, lastTangentVec, lastDirection);
    v3matchDirection(lastNormalVec, lastNormalVec, firstNormalVec);
    v3copy(prevNormal, firstNormalVec);
    const n1 = n - 1;
    for (let i = 0; i < n; ++i) {
        const j = (0, interpolate_1.smoothstep)(0, n1, i) * n1;
        const t = i === 0 ? 0 : 1 / (n - j);
        v3fromArray(tangentVec, tangentVectors, i * 3);
        v3orthogonalize(normalVec, tangentVec, v3slerp(tmpNormal, prevNormal, lastNormalVec, t));
        v3toArray(normalVec, normalVectors, i * 3);
        v3copy(prevNormal, normalVec);
        v3normalize(binormalVec, v3cross(binormalVec, tangentVec, normalVec));
        v3toArray(binormalVec, binormalVectors, i * 3);
    }
    for (let i = 1; i < n1; ++i) {
        v3fromArray(prevNormal, normalVectors, (i - 1) * 3);
        v3fromArray(normalVec, normalVectors, i * 3);
        v3fromArray(nextNormal, normalVectors, (i + 1) * 3);
        v3scale(normalVec, v3add(normalVec, prevNormal, v3add(normalVec, nextNormal, normalVec)), 1 / 3);
        v3toArray(normalVec, normalVectors, i * 3);
        v3fromArray(tangentVec, tangentVectors, i * 3);
        v3normalize(binormalVec, v3cross(binormalVec, tangentVec, normalVec));
        v3toArray(binormalVec, binormalVectors, i * 3);
    }
}
function interpolateSizes(state, w0, w1, w2, h0, h1, h2, shift) {
    const { widthValues, heightValues, linearSegments } = state;
    const shift1 = 1 - shift;
    for (let i = 0; i <= linearSegments; ++i) {
        const t = i * 1.0 / linearSegments;
        if (t < shift1) {
            widthValues[i] = (0, interpolate_1.lerp)(w0, w1, t + shift);
            heightValues[i] = (0, interpolate_1.lerp)(h0, h1, t + shift);
        }
        else {
            widthValues[i] = (0, interpolate_1.lerp)(w1, w2, t - shift1);
            heightValues[i] = (0, interpolate_1.lerp)(h1, h2, t - shift1);
        }
    }
}
