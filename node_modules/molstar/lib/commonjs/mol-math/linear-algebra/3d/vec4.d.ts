/**
 * Copyright (c) 2017-2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Mat4 } from './mat4';
import { NumberArray } from '../../../mol-util/type-helpers';
import { Sphere3D } from '../../geometry/primitives/sphere3d';
interface Vec4 extends Array<number> {
    [d: number]: number;
    '@type': 'vec4';
    length: 4;
}
declare function Vec4(): Vec4;
declare namespace Vec4 {
    function zero(): Vec4;
    function clone(a: Vec4): Vec4;
    function create(x: number, y: number, z: number, w: number): Vec4;
    function fromSphere(out: Vec4, sphere: Sphere3D): Vec4;
    function ofSphere(sphere: Sphere3D): Vec4;
    function hasNaN(a: Vec4): boolean;
    function toArray<T extends NumberArray>(a: Vec4, out: T, offset: number): T;
    function fromArray(a: Vec4, array: NumberArray, offset: number): Vec4;
    function toVec3Array(a: Vec4, out: NumberArray, offset: number): void;
    function fromVec3Array(a: Vec4, array: NumberArray, offset: number): Vec4;
    function copy(out: Vec4, a: Vec4): Vec4;
    function set(out: Vec4, x: number, y: number, z: number, w: number): Vec4;
    function add(out: Vec4, a: Vec4, b: Vec4): Vec4;
    function distance(a: Vec4, b: Vec4): number;
    function scale(out: Vec4, a: Vec4, b: number): Vec4;
    /**
     * Math.round the components of a Vec4
     */
    function round(out: Vec4, a: Vec4): Vec4;
    /**
     * Math.ceil the components of a Vec4
     */
    function ceil(out: Vec4, a: Vec4): Vec4;
    /**
     * Math.floor the components of a Vec3
     */
    function floor(out: Vec4, a: Vec4): Vec4;
    function squaredDistance(a: Vec4, b: Vec4): number;
    function norm(a: Vec4): number;
    function squaredNorm(a: Vec4): number;
    function transformMat4(out: Vec4, a: Vec4, m: Mat4): Vec4;
    function dot(a: Vec4, b: Vec4): number;
    /**
     * Returns the inverse of the components of a Vec4
     */
    function inverse(out: Vec4, a: Vec4): Vec4;
    /**
     * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
     */
    function exactEquals(a: Vec4, b: Vec4): boolean;
    /**
     * Returns whether or not the vectors have approximately the same elements in the same position.
     */
    function equals(a: Vec4, b: Vec4): boolean;
    function toString(a: Vec4, precision?: number): string;
}
export { Vec4 };
