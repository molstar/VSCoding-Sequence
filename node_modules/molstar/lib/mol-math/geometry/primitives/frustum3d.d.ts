/**
 * Copyright (c) 2022-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * This code has been modified from https://github.com/mrdoob/three.js/,
 * copyright (c) 2010-2022 three.js authors. MIT License
 */
import { Mat4 } from '../../linear-algebra/3d/mat4';
import { Vec3 } from '../../linear-algebra/3d/vec3';
import { Box3D } from './box3d';
import { Plane3D } from './plane3d';
import { Sphere3D } from './sphere3d';
interface Frustum3D {
    0: Plane3D;
    1: Plane3D;
    2: Plane3D;
    3: Plane3D;
    4: Plane3D;
    5: Plane3D;
    length: 6;
}
declare function Frustum3D(): Frustum3D;
declare namespace Frustum3D {
    const enum PlaneIndex {
        Right = 0,
        Left = 1,
        Bottom = 2,
        Top = 3,
        Far = 4,
        Near = 5
    }
    function create(right: Plane3D, left: Plane3D, bottom: Plane3D, top: Plane3D, far: Plane3D, near: Plane3D): Frustum3D;
    function copy(out: Frustum3D, f: Frustum3D): Frustum3D;
    function clone(f: Frustum3D): Frustum3D;
    function fromProjectionMatrix(out: Frustum3D, m: Mat4): Frustum3D;
    function intersectsSphere3D(frustum: Frustum3D, sphere: Sphere3D): boolean;
    function intersectsBox3D(frustum: Frustum3D, box: Box3D): boolean;
    function containsPoint(frustum: Frustum3D, point: Vec3): boolean;
}
export { Frustum3D };
