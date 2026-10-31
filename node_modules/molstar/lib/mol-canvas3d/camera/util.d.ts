/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Mat4, Vec3, Vec4 } from '../../mol-math/linear-algebra';
export { Viewport };
type Viewport = {
    x: number;
    y: number;
    width: number;
    height: number;
};
declare function Viewport(): Viewport;
declare namespace Viewport {
    function zero(): Viewport;
    function create(x: number, y: number, width: number, height: number): Viewport;
    function clone(viewport: Viewport): Viewport;
    function copy(target: Viewport, source: Viewport): Viewport;
    function set(viewport: Viewport, x: number, y: number, width: number, height: number): Viewport;
    function toVec4(v4: Vec4, viewport: Viewport): Vec4;
    function equals(a: Viewport, b: Viewport): boolean;
}
/** Transform point into 2D window coordinates. */
export declare function cameraProject(out: Vec4, point: Vec3, viewport: Viewport, projectionView: Mat4): Vec4;
/**
 * Transform point from screen space to 3D coordinates.
 * The point must have `x` and `y` set to 2D window coordinates
 * and `z` between 0 (near) and 1 (far); the optional `w` is not used.
 */
export declare function cameraUnproject(out: Vec3, point: Vec3 | Vec4, viewport: Viewport, inverseProjectionView: Mat4): Vec3;
