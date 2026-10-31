/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Vec3, Mat4 } from '../../linear-algebra';
import { PositionData } from '../common';
import { NumberArray, PickRequired } from '../../../mol-util/type-helpers';
import { Box3D } from './box3d';
import { Axes3D } from './axes3d';
interface Sphere3D {
    center: Vec3;
    radius: number;
    extrema?: Vec3[];
}
declare function Sphere3D(): Sphere3D;
declare namespace Sphere3D {
    function hasExtrema(sphere: Sphere3D): sphere is PickRequired<Sphere3D, 'extrema'>;
    function create(center: Vec3, radius: number): Sphere3D;
    function zero(): Sphere3D;
    function clone(a: Sphere3D): Sphere3D;
    function set(out: Sphere3D, center: Vec3, radius: number): Sphere3D;
    function copy(out: Sphere3D, a: Sphere3D): Sphere3D;
    /** Note that `extrema` must not be reused elsewhere */
    function setExtrema(out: Sphere3D, extrema: Vec3[]): Sphere3D;
    function computeBounding(data: PositionData): Sphere3D;
    /** Transform sphere with a Mat4 */
    function transform(out: Sphere3D, sphere: Sphere3D, m: Mat4): Sphere3D;
    /** Translate sphere by Vec3 */
    function translate(out: Sphere3D, sphere: Sphere3D, v: Vec3): Sphere3D;
    function toArray<T extends NumberArray>(s: Sphere3D, out: T, offset: number): T;
    function fromArray(out: Sphere3D, array: NumberArray, offset: number): Sphere3D;
    function fromBox3D(out: Sphere3D, box: Box3D): Sphere3D;
    function fromAxes3D(out: Sphere3D, axes: Axes3D): Sphere3D;
    /** Get a tight sphere around a transformed box */
    function fromDimensionsAndTransform(out: Sphere3D, dimensions: Vec3, transform: Mat4): Sphere3D;
    function addVec3(out: Sphere3D, s: Sphere3D, v: Vec3): Sphere3D;
    /** Expand sphere radius by another sphere */
    function expandBySphere(out: Sphere3D, sphere: Sphere3D, by: Sphere3D): Sphere3D;
    /** Expand sphere radius by delta */
    function expand(out: Sphere3D, sphere: Sphere3D, delta: number): Sphere3D;
    /**
     * Returns whether or not the spheres have exactly the same center and radius (when compared with ===)
     */
    function exactEquals(a: Sphere3D, b: Sphere3D): boolean;
    /**
     * Returns whether or not the spheres have approximately the same center and radius.
     */
    function equals(a: Sphere3D, b: Sphere3D): boolean;
    /**
     * Check if `a` includes `b`, use `extrema` of `b` when available
     */
    function includes(a: Sphere3D, b: Sphere3D): boolean;
    /** Check if `a` and `b` are overlapping */
    function overlaps(a: Sphere3D, b: Sphere3D): boolean;
    /** Get the signed distance of `a` and `b` */
    function distance(a: Sphere3D, b: Sphere3D): number;
    /** Get the distance of v from sphere. If negative, v is inside sphere */
    function distanceToVec(sphere: Sphere3D, v: Vec3): number;
}
export { Sphere3D };
