/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Vec3, Mat4 } from '../../linear-algebra';
interface Axes3D {
    origin: Vec3;
    dirA: Vec3;
    dirB: Vec3;
    dirC: Vec3;
}
declare function Axes3D(): Axes3D;
declare namespace Axes3D {
    function create(origin: Vec3, dirA: Vec3, dirB: Vec3, dirC: Vec3): Axes3D;
    function empty(): Axes3D;
    function copy(out: Axes3D, a: Axes3D): Axes3D;
    function clone(a: Axes3D): Axes3D;
    /** Get size of each direction */
    function size(size: Vec3, axes: Axes3D): Vec3;
    /** Get volume of the oriented box wrapping the axes */
    function volume(axes: Axes3D): number;
    function normalize(out: Axes3D, a: Axes3D): Axes3D;
    /** Transform axes with a Mat4 */
    function transform(out: Axes3D, a: Axes3D, m: Mat4): Axes3D;
    function scale(out: Axes3D, a: Axes3D, scale: number): Axes3D;
}
export { Axes3D };
