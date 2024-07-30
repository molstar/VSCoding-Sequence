/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Vec3 } from '../../../../../mol-math/linear-algebra';
import { NumberArray } from '../../../../../mol-util/type-helpers';
export interface CurveSegmentState {
    curvePoints: NumberArray;
    tangentVectors: NumberArray;
    normalVectors: NumberArray;
    binormalVectors: NumberArray;
    widthValues: NumberArray;
    heightValues: NumberArray;
    linearSegments: number;
}
export interface CurveSegmentControls {
    secStrucFirst: boolean;
    secStrucLast: boolean;
    p0: Vec3;
    p1: Vec3;
    p2: Vec3;
    p3: Vec3;
    p4: Vec3;
    d12: Vec3;
    d23: Vec3;
}
export declare function createCurveSegmentState(linearSegments: number): CurveSegmentState;
export declare function interpolateCurveSegment(state: CurveSegmentState, controls: CurveSegmentControls, tension: number, shift: number): void;
export declare function interpolatePointsAndTangents(state: CurveSegmentState, controls: CurveSegmentControls, tension: number, shift: number): void;
/**
 * Populate normalVectors by interpolating from firstDirection to lastDirection with
 * resulting vector perpendicular to tangentVectors and binormalVectors
 */
export declare function interpolateNormals(state: CurveSegmentState, controls: CurveSegmentControls): void;
export declare function interpolateSizes(state: CurveSegmentState, w0: number, w1: number, w2: number, h0: number, h1: number, h2: number, shift: number): void;
