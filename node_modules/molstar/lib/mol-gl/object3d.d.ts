/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Vec3, Mat4 } from '../mol-math/linear-algebra';
export interface Object3D {
    readonly view: Mat4;
    readonly position: Vec3;
    readonly direction: Vec3;
    readonly up: Vec3;
}
export declare namespace Object3D {
    function create(): Object3D;
    function update(object3d: Object3D): void;
}
