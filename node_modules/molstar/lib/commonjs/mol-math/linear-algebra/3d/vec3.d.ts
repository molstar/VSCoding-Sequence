/**
 * Copyright (c) 2017-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Mat4 } from './mat4';
import { NumberArray } from '../../../mol-util/type-helpers';
import { Mat3 } from './mat3';
import { Quat } from './quat';
export { ReadonlyVec3 };
interface Vec3 extends Array<number> {
    [d: number]: number;
    '@type': 'vec3';
    length: 3;
}
interface ReadonlyVec3 extends Array<number> {
    readonly [d: number]: number;
    '@type': 'vec3';
    length: 3;
}
declare function Vec3(): Vec3;
declare namespace Vec3 {
    function zero(): Vec3;
    function clone(a: Vec3): Vec3;
    function isFinite(a: Vec3): boolean;
    function hasNaN(a: Vec3): boolean;
    function setNaN(out: Vec3): Vec3;
    function fromObj(v: {
        x: number;
        y: number;
        z: number;
    }): Vec3;
    function toObj(v: Vec3): {
        x: number;
        y: number;
        z: number;
    };
    function fromArray(v: Vec3, array: ArrayLike<number>, offset: number): Vec3;
    function toArray<T extends NumberArray>(v: Vec3, out: T, offset: number): T;
    function create(x: number, y: number, z: number): Vec3;
    function ofArray(array: ArrayLike<number>): Vec3;
    function set(out: Vec3, x: number, y: number, z: number): Vec3;
    function copy(out: Vec3, a: Vec3): Vec3;
    function add(out: Vec3, a: Vec3, b: Vec3): Vec3;
    function sub(out: Vec3, a: Vec3, b: Vec3): Vec3;
    function mul(out: Vec3, a: Vec3, b: Vec3): Vec3;
    function div(out: Vec3, a: Vec3, b: Vec3): Vec3;
    function scale(out: Vec3, a: Vec3, b: number): Vec3;
    /** Scales b, then adds a and b together */
    function scaleAndAdd(out: Vec3, a: Vec3, b: Vec3, scale: number): Vec3;
    /** Scales b, then subtracts b from a */
    function scaleAndSub(out: Vec3, a: Vec3, b: Vec3, scale: number): Vec3;
    function addScalar(out: Vec3, a: Vec3, b: number): Vec3;
    function subScalar(out: Vec3, a: Vec3, b: number): Vec3;
    /**
     * Math.round the components of a Vec3
     */
    function round(out: Vec3, a: Vec3): Vec3;
    /**
     * Math.ceil the components of a Vec3
     */
    function ceil(out: Vec3, a: Vec3): Vec3;
    /**
     * Math.floor the components of a Vec3
     */
    function floor(out: Vec3, a: Vec3): Vec3;
    /**
     * Math.trunc the components of a Vec3
     */
    function trunc(out: Vec3, a: Vec3): Vec3;
    /**
     * Math.abs the components of a Vec3
     */
    function abs(out: Vec3, a: Vec3): Vec3;
    /**
     * Returns the minimum of two Vec3's
     */
    function min(out: Vec3, a: Vec3, b: Vec3): Vec3;
    /**
     * Returns the maximum of two Vec3's
     */
    function max(out: Vec3, a: Vec3, b: Vec3): Vec3;
    /**
     * Assumes min < max, componentwise
     */
    function clamp(out: Vec3, a: Vec3, min: Vec3, max: Vec3): Vec3;
    function distance(a: Vec3, b: Vec3): number;
    function squaredDistance(a: Vec3, b: Vec3): number;
    function magnitude(a: Vec3): number;
    function squaredMagnitude(a: Vec3): number;
    function setMagnitude(out: Vec3, a: Vec3, l: number): Vec3;
    /**
     * Negates the components of a vec3
     */
    function negate(out: Vec3, a: Vec3): Vec3;
    /**
     * Returns the inverse of the components of a Vec3
     */
    function inverse(out: Vec3, a: Vec3): Vec3;
    function normalize(out: Vec3, a: Vec3): Vec3;
    function dot(a: Vec3, b: Vec3): number;
    function cross(out: Vec3, a: Vec3, b: Vec3): Vec3;
    /**
     * Performs a linear interpolation between two Vec3's
     */
    function lerp(out: Vec3, a: Vec3, b: Vec3, t: number): Vec3;
    function slerp(out: Vec3, a: Vec3, b: Vec3, t: number): Vec3;
    /**
     * Performs a hermite interpolation with two control points
     */
    function hermite(out: Vec3, a: Vec3, b: Vec3, c: Vec3, d: Vec3, t: number): Vec3;
    /**
     * Performs a bezier interpolation with two control points
     */
    function bezier(out: Vec3, a: Vec3, b: Vec3, c: Vec3, d: Vec3, t: number): Vec3;
    function quadraticBezier(out: Vec3, a: Vec3, b: Vec3, c: Vec3, t: number): Vec3;
    /**
     * Performs a spline interpolation with two control points and a tension parameter
     */
    function spline(out: Vec3, a: Vec3, b: Vec3, c: Vec3, d: Vec3, t: number, tension: number): Vec3;
    /**
     * Generates a random vector with the given scale
     */
    function random(out: Vec3, scale: number): Vec3;
    /**
     * Transforms the Vec3 with a Mat4. 4th vector component is implicitly '1'
     */
    function transformMat4(out: Vec3, a: Vec3, m: Mat4): Vec3;
    function transformDirection(out: Vec3, a: Vec3, m: Mat4): Vec3;
    /**
     * Like `transformMat4` but with offsets into arrays
     */
    function transformMat4Offset(out: NumberArray, a: NumberArray, m: NumberArray, outO: number, aO: number, oM: number): NumberArray;
    /**
     * Transforms the direction vector with a Mat4. 4th vector component is implicitly '0'
     * This means the translation components of the matrix are ignored.
     * Assumes that m is already the transpose of the inverse matrix suitable for normal transformation.
     */
    function transformDirectionOffset(out: NumberArray, a: NumberArray, m: NumberArray, outO: number, aO: number, oM: number): NumberArray;
    /**
     * Transforms the Vec3 with a Mat3.
     */
    function transformMat3(out: Vec3, a: Vec3, m: Mat3): Vec3;
    /** Transforms the Vec3 with a quat */
    function transformQuat(out: Vec3, a: Vec3, q: Quat): Vec3;
    /** Computes the angle between 2 vectors, reports in radians. */
    function angle(a: Vec3, b: Vec3): number;
    /**
     * Computes the dihedral angles of 4 points, reports in radians.
     */
    function dihedralAngle(a: Vec3, b: Vec3, c: Vec3, d: Vec3): number;
    /**
     * @param inclination in radians [0, PI]
     * @param azimuth in radians [0, 2 * PI]
     * @param radius [0, +Inf]
     */
    function directionFromSpherical(out: Vec3, inclination: number, azimuth: number, radius: number): Vec3;
    /**
     * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
     */
    function exactEquals(a: Vec3, b: Vec3): boolean;
    /**
     * Returns whether or not the vectors have approximately the same elements in the same position.
     */
    function equals(a: Vec3, b: Vec3): boolean;
    function makeRotation(mat: Mat4, a: Vec3, b: Vec3): Mat4;
    function isZero(v: Vec3): boolean;
    /** Project `point` onto `vector` starting from `origin` */
    function projectPointOnVector(out: Vec3, point: Vec3, vector: Vec3, origin: Vec3): Vec3;
    /** Project `point` onto `plane` defined by `normal` starting from `origin` */
    function projectPointOnPlane(out: Vec3, point: Vec3, normal: Vec3, origin: Vec3): Vec3;
    function projectOnVector(out: Vec3, p: Vec3, vector: Vec3): Vec3;
    function projectOnPlane(out: Vec3, p: Vec3, normal: Vec3): Vec3;
    /** Get a vector that is similar to `b` but orthogonal to `a` */
    function orthogonalize(out: Vec3, a: Vec3, b: Vec3): Vec3;
    /**
     * Get a vector like `a` that point into the same general direction as `b`,
     * i.e. where the dot product is > 0
     */
    function matchDirection(out: Vec3, a: Vec3, b: Vec3): Vec3;
    /** Calculate normal for the triangle defined by `a`, `b` and `c` */
    function triangleNormal(out: Vec3, a: Vec3, b: Vec3, c: Vec3): Vec3;
    function toString(a: Vec3, precision?: number): string;
    const origin: ReadonlyVec3;
    const unit: ReadonlyVec3;
    const negUnit: ReadonlyVec3;
    const unitX: ReadonlyVec3;
    const unitY: ReadonlyVec3;
    const unitZ: ReadonlyVec3;
    const negUnitX: ReadonlyVec3;
    const negUnitY: ReadonlyVec3;
    const negUnitZ: ReadonlyVec3;
}
export { Vec3 };
