/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * This code has been modified from https://github.com/mrdoob/three.js/,
 * copyright (c) 2010-2023 three.js authors. MIT License
 */
import { Mat4 } from './mat4';
import { NumberArray } from '../../../mol-util/type-helpers';
import { Quat } from './quat';
import { Vec3 } from './vec3';
interface Euler extends Array<number> {
    [d: number]: number;
    '@type': 'euler';
    length: 3;
}
declare function Euler(): Euler;
declare namespace Euler {
    type Order = 'XYZ' | 'YXZ' | 'ZXY' | 'ZYX' | 'YZX' | 'XZY';
    function zero(): Euler;
    function create(x: number, y: number, z: number): Euler;
    function set(out: Euler, x: number, y: number, z: number): Euler;
    function clone(a: Euler): Euler;
    function copy(out: Euler, a: Euler): Euler;
    /**
     * Assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
     */
    function fromMat4(out: Euler, m: Mat4, order: Order): Euler;
    function fromQuat(out: Euler, q: Quat, order: Order): Euler;
    function fromVec3(out: Euler, v: Vec3): Euler;
    function exactEquals(a: Euler, b: Euler): boolean;
    function fromArray(e: Euler, array: ArrayLike<number>, offset: number): Euler;
    function toArray<T extends NumberArray>(e: Euler, out: T, offset: number): T;
}
export { Euler };
