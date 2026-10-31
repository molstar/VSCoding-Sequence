/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Mat4, Vec3, Vec4 } from '../mol-math/linear-algebra';
import { Viewport } from './camera/util';
import { CameraTransitionManager } from './camera/transition';
import { BehaviorSubject } from 'rxjs';
import { Scene } from '../mol-gl/scene';
export { ICamera, Camera };
interface ICamera {
    readonly viewport: Viewport;
    readonly view: Mat4;
    readonly projection: Mat4;
    readonly projectionView: Mat4;
    readonly inverseProjectionView: Mat4;
    readonly state: Readonly<Camera.Snapshot>;
    readonly viewOffset: Camera.ViewOffset;
    readonly far: number;
    readonly near: number;
    readonly fogFar: number;
    readonly fogNear: number;
}
declare class Camera implements ICamera {
    readonly view: Mat4;
    readonly projection: Mat4;
    readonly projectionView: Mat4;
    readonly inverseProjectionView: Mat4;
    readonly viewport: Viewport;
    readonly state: Readonly<Camera.Snapshot>;
    readonly viewOffset: Camera.ViewOffset;
    near: number;
    far: number;
    fogNear: number;
    fogFar: number;
    zoom: number;
    readonly transition: CameraTransitionManager;
    readonly stateChanged: BehaviorSubject<Partial<Camera.Snapshot>>;
    get position(): Vec3;
    set position(v: Vec3);
    get up(): Vec3;
    set up(v: Vec3);
    get target(): Vec3;
    set target(v: Vec3);
    private prevProjection;
    private prevView;
    private deltaDirection;
    private newPosition;
    update(): boolean;
    setState(snapshot: Partial<Camera.Snapshot>, durationMs?: number): void;
    getSnapshot(): Camera.Snapshot;
    getTargetDistance(radius: number): number;
    getFocus(target: Vec3, radius: number, up?: Vec3, dir?: Vec3, snapshot?: Partial<Camera.Snapshot>): Partial<Camera.Snapshot>;
    getCenter(target: Vec3, radius?: number): Partial<Camera.Snapshot>;
    getInvariantFocus(target: Vec3, radius: number, up: Vec3, dir: Vec3): Partial<Camera.Snapshot>;
    focus(target: Vec3, radius: number, durationMs?: number, up?: Vec3, dir?: Vec3): void;
    center(target: Vec3, durationMs?: number): void;
    /** Transform point into 2D window coordinates. */
    project(out: Vec4, point: Vec3): Vec4;
    /**
     * Transform point from screen space to 3D coordinates.
     * The point must have `x` and `y` set to 2D window coordinates
     * and `z` between 0 (near) and 1 (far); the optional `w` is not used.
     */
    unproject(out: Vec3, point: Vec3 | Vec4): Vec3;
    /** World space pixel size at given `point` */
    getPixelSize(point: Vec3): number;
    constructor(state?: Partial<Camera.Snapshot>, viewport?: Viewport);
}
declare namespace Camera {
    type Mode = 'perspective' | 'orthographic';
    type SnapshotProvider = Partial<Snapshot> | ((scene: Scene, camera: Camera) => Partial<Snapshot>);
    /**
     * Sets an offseted view in a larger frustum. This is useful for
     * - multi-window or multi-monitor/multi-machine setups
     * - jittering the camera position for sampling
     */
    interface ViewOffset {
        enabled: boolean;
        fullWidth: number;
        fullHeight: number;
        offsetX: number;
        offsetY: number;
        width: number;
        height: number;
    }
    function ViewOffset(): ViewOffset;
    function setViewOffset(out: ViewOffset, fullWidth: number, fullHeight: number, offsetX: number, offsetY: number, width: number, height: number): void;
    function copyViewOffset(out: ViewOffset, view: ViewOffset): void;
    function targetDistance(radius: number, mode: Mode, fov: number, width: number, height: number): number;
    function createDefaultSnapshot(): Snapshot;
    interface Snapshot {
        mode: Mode;
        fov: number;
        position: Vec3;
        up: Vec3;
        target: Vec3;
        radius: number;
        radiusMax: number;
        fog: number;
        clipFar: boolean;
        minNear: number;
        minFar: number;
    }
    function copySnapshot(out: Snapshot, source?: Partial<Snapshot>): Snapshot;
    function areSnapshotsEqual(a: Snapshot, b: Snapshot): boolean;
}
