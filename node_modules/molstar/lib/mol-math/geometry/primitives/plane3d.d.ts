/**
 * Copyright (c) 2022-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * This code has been modified from https://github.com/mrdoob/three.js/,
 * copyright (c) 2010-2022 three.js authors. MIT License
 */
import { NumberArray } from '../../../mol-util/type-helpers';
import { Vec3 } from '../../linear-algebra/3d/vec3';
import { Sphere3D } from './sphere3d';
interface Plane3D {
    normal: Vec3;
    constant: number;
}
declare function Plane3D(): Plane3D;
declare namespace Plane3D {
    function create(normal: Vec3, constant: number): Plane3D;
    function copy(out: Plane3D, p: Plane3D): Plane3D;
    function clone(p: Plane3D): Plane3D;
    function normalize(out: Plane3D, p: Plane3D): Plane3D;
    function negate(out: Plane3D, p: Plane3D): Plane3D;
    function toArray<T extends NumberArray>(p: Plane3D, out: T, offset: number): T;
    function fromArray(out: Plane3D, array: NumberArray, offset: number): Plane3D;
    function fromNormalAndCoplanarPoint(out: Plane3D, normal: Vec3, point: Vec3): Plane3D;
    function fromCoplanarPoints(out: Plane3D, a: Vec3, b: Vec3, c: Vec3): Plane3D;
    function setUnnormalized(out: Plane3D, nx: number, ny: number, nz: number, constant: number): Plane3D;
    function distanceToPoint(plane: Plane3D, point: Vec3): number;
    function distanceToSpher3D(plane: Plane3D, sphere: Sphere3D): number;
    function projectPoint(out: Vec3, plane: Plane3D, point: Vec3): Vec3;
}
export { Plane3D };
