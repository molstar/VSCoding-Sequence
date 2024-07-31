/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Mat4, Vec3, Vec4, EPSILON } from '../mol-math/linear-algebra';
import { Viewport, cameraProject, cameraUnproject } from './camera/util';
import { CameraTransitionManager } from './camera/transition';
import { BehaviorSubject } from 'rxjs';
import { assertUnreachable } from '../mol-util/type-helpers';
export { Camera };
const tmpPos1 = Vec3();
const tmpPos2 = Vec3();
const tmpClip = Vec4();
class Camera {
    get position() { return this.state.position; }
    set position(v) { Vec3.copy(this.state.position, v); }
    get up() { return this.state.up; }
    set up(v) { Vec3.copy(this.state.up, v); }
    get target() { return this.state.target; }
    set target(v) { Vec3.copy(this.state.target, v); }
    update() {
        const snapshot = this.state;
        if (snapshot.radiusMax === 0) {
            return false;
        }
        const height = 2 * Math.tan(snapshot.fov / 2) * Vec3.distance(snapshot.position, snapshot.target);
        this.zoom = this.viewport.height / height;
        updateClip(this);
        switch (this.state.mode) {
            case 'orthographic':
                updateOrtho(this);
                break;
            case 'perspective':
                updatePers(this);
                break;
            default: assertUnreachable(this.state.mode);
        }
        const changed = !Mat4.areEqual(this.projection, this.prevProjection, EPSILON) || !Mat4.areEqual(this.view, this.prevView, EPSILON);
        if (changed) {
            Mat4.mul(this.projectionView, this.projection, this.view);
            if (!Mat4.tryInvert(this.inverseProjectionView, this.projectionView)) {
                Mat4.copy(this.view, this.prevView);
                Mat4.copy(this.projection, this.prevProjection);
                Mat4.mul(this.projectionView, this.projection, this.view);
                return false;
            }
            Mat4.copy(this.prevView, this.view);
            Mat4.copy(this.prevProjection, this.projection);
        }
        return changed;
    }
    setState(snapshot, durationMs) {
        this.transition.apply(snapshot, durationMs);
        this.stateChanged.next(snapshot);
    }
    getSnapshot() {
        return Camera.copySnapshot(Camera.createDefaultSnapshot(), this.state);
    }
    getTargetDistance(radius) {
        return Camera.targetDistance(radius, this.state.mode, this.state.fov, this.viewport.width, this.viewport.height);
    }
    getFocus(target, radius, up, dir, snapshot) {
        var _a, _b;
        const r = Math.max(radius, 0.01);
        const targetDistance = this.getTargetDistance(r);
        Vec3.sub(this.deltaDirection, (_a = snapshot === null || snapshot === void 0 ? void 0 : snapshot.target) !== null && _a !== void 0 ? _a : this.target, (_b = snapshot === null || snapshot === void 0 ? void 0 : snapshot.position) !== null && _b !== void 0 ? _b : this.position);
        if (dir)
            Vec3.matchDirection(this.deltaDirection, dir, this.deltaDirection);
        Vec3.setMagnitude(this.deltaDirection, this.deltaDirection, targetDistance);
        Vec3.sub(this.newPosition, target, this.deltaDirection);
        const state = Camera.copySnapshot(Camera.createDefaultSnapshot(), this.state);
        state.target = Vec3.clone(target);
        state.radius = r;
        state.position = Vec3.clone(this.newPosition);
        if (up)
            Vec3.matchDirection(state.up, up, state.up);
        return state;
    }
    getCenter(target, radius) {
        Vec3.sub(this.deltaDirection, this.target, this.position);
        Vec3.sub(this.newPosition, target, this.deltaDirection);
        const state = Camera.copySnapshot(Camera.createDefaultSnapshot(), this.state);
        state.target = Vec3.clone(target);
        state.position = Vec3.clone(this.newPosition);
        if (radius)
            state.radius = Math.max(radius, 0.01);
        return state;
    }
    getInvariantFocus(target, radius, up, dir) {
        const r = Math.max(radius, 0.01);
        const targetDistance = this.getTargetDistance(r);
        Vec3.copy(this.deltaDirection, dir);
        Vec3.setMagnitude(this.deltaDirection, this.deltaDirection, targetDistance);
        Vec3.sub(this.newPosition, target, this.deltaDirection);
        const state = Camera.copySnapshot(Camera.createDefaultSnapshot(), this.state);
        state.target = Vec3.clone(target);
        state.radius = r;
        state.position = Vec3.clone(this.newPosition);
        Vec3.copy(state.up, up);
        return state;
    }
    focus(target, radius, durationMs, up, dir) {
        if (radius > 0) {
            this.setState(this.getFocus(target, radius, up, dir), durationMs);
        }
    }
    center(target, durationMs) {
        this.setState(this.getCenter(target), durationMs);
    }
    /** Transform point into 2D window coordinates. */
    project(out, point) {
        return cameraProject(out, point, this.viewport, this.projectionView);
    }
    /**
     * Transform point from screen space to 3D coordinates.
     * The point must have `x` and `y` set to 2D window coordinates
     * and `z` between 0 (near) and 1 (far); the optional `w` is not used.
     */
    unproject(out, point) {
        return cameraUnproject(out, point, this.viewport, this.inverseProjectionView);
    }
    /** World space pixel size at given `point` */
    getPixelSize(point) {
        // project -> unproject of `point` does not exactly return the same
        // to get a sufficiently accurate measure we unproject the original
        // clip position in addition to the one shifted by one pixel
        this.project(tmpClip, point);
        this.unproject(tmpPos1, tmpClip);
        tmpClip[0] += 1;
        this.unproject(tmpPos2, tmpClip);
        return Vec3.distance(tmpPos1, tmpPos2);
    }
    constructor(state, viewport = Viewport.create(0, 0, 128, 128)) {
        this.view = Mat4.identity();
        this.projection = Mat4.identity();
        this.projectionView = Mat4.identity();
        this.inverseProjectionView = Mat4.identity();
        this.state = Camera.createDefaultSnapshot();
        this.viewOffset = Camera.ViewOffset();
        this.near = 1;
        this.far = 10000;
        this.fogNear = 5000;
        this.fogFar = 10000;
        this.zoom = 1;
        this.transition = new CameraTransitionManager(this);
        this.stateChanged = new BehaviorSubject(this.state);
        this.prevProjection = Mat4.identity();
        this.prevView = Mat4.identity();
        this.deltaDirection = Vec3();
        this.newPosition = Vec3();
        this.viewport = viewport;
        Camera.copySnapshot(this.state, state);
    }
}
(function (Camera) {
    function ViewOffset() {
        return {
            enabled: false,
            fullWidth: 1, fullHeight: 1,
            offsetX: 0, offsetY: 0,
            width: 1, height: 1
        };
    }
    Camera.ViewOffset = ViewOffset;
    function setViewOffset(out, fullWidth, fullHeight, offsetX, offsetY, width, height) {
        out.fullWidth = fullWidth;
        out.fullHeight = fullHeight;
        out.offsetX = offsetX;
        out.offsetY = offsetY;
        out.width = width;
        out.height = height;
    }
    Camera.setViewOffset = setViewOffset;
    function copyViewOffset(out, view) {
        out.enabled = view.enabled;
        out.fullWidth = view.fullWidth;
        out.fullHeight = view.fullHeight;
        out.offsetX = view.offsetX;
        out.offsetY = view.offsetY;
        out.width = view.width;
        out.height = view.height;
    }
    Camera.copyViewOffset = copyViewOffset;
    function targetDistance(radius, mode, fov, width, height) {
        const r = Math.max(radius, 0.01);
        const aspect = width / height;
        const aspectFactor = (height < width ? 1 : aspect);
        if (mode === 'orthographic')
            return Math.abs((r / aspectFactor) / Math.tan(fov / 2));
        else
            return Math.abs((r / aspectFactor) / Math.sin(fov / 2));
    }
    Camera.targetDistance = targetDistance;
    function createDefaultSnapshot() {
        return {
            mode: 'perspective',
            fov: Math.PI / 4,
            position: Vec3.create(0, 0, 100),
            up: Vec3.create(0, 1, 0),
            target: Vec3.create(0, 0, 0),
            radius: 0,
            radiusMax: 10,
            fog: 50,
            clipFar: true,
            minNear: 5,
            minFar: 0,
        };
    }
    Camera.createDefaultSnapshot = createDefaultSnapshot;
    function copySnapshot(out, source) {
        if (!source)
            return out;
        if (typeof source.mode !== 'undefined')
            out.mode = source.mode;
        if (typeof source.fov !== 'undefined')
            out.fov = source.fov;
        if (typeof source.position !== 'undefined')
            Vec3.copy(out.position, source.position);
        if (typeof source.up !== 'undefined')
            Vec3.copy(out.up, source.up);
        if (typeof source.target !== 'undefined')
            Vec3.copy(out.target, source.target);
        if (typeof source.radius !== 'undefined')
            out.radius = source.radius;
        if (typeof source.radiusMax !== 'undefined')
            out.radiusMax = source.radiusMax;
        if (typeof source.fog !== 'undefined')
            out.fog = source.fog;
        if (typeof source.clipFar !== 'undefined')
            out.clipFar = source.clipFar;
        if (typeof source.minNear !== 'undefined')
            out.minNear = source.minNear;
        if (typeof source.minFar !== 'undefined')
            out.minFar = source.minFar;
        return out;
    }
    Camera.copySnapshot = copySnapshot;
    function areSnapshotsEqual(a, b) {
        return a.mode === b.mode
            && a.fov === b.fov
            && a.radius === b.radius
            && a.radiusMax === b.radiusMax
            && a.fog === b.fog
            && a.clipFar === b.clipFar
            && a.minNear === b.minNear
            && a.minFar === b.minFar
            && Vec3.exactEquals(a.position, b.position)
            && Vec3.exactEquals(a.up, b.up)
            && Vec3.exactEquals(a.target, b.target);
    }
    Camera.areSnapshotsEqual = areSnapshotsEqual;
})(Camera || (Camera = {}));
function updateOrtho(camera) {
    const { viewport, zoom, near, far, viewOffset } = camera;
    const fullLeft = -viewport.width / 2;
    const fullRight = viewport.width / 2;
    const fullTop = viewport.height / 2;
    const fullBottom = -viewport.height / 2;
    const dx = (fullRight - fullLeft) / (2 * zoom);
    const dy = (fullTop - fullBottom) / (2 * zoom);
    const cx = (fullRight + fullLeft) / 2;
    const cy = (fullTop + fullBottom) / 2;
    let left = cx - dx;
    let right = cx + dx;
    let top = cy + dy;
    let bottom = cy - dy;
    if (viewOffset.enabled) {
        const zoomW = zoom / (viewOffset.width / viewOffset.fullWidth);
        const zoomH = zoom / (viewOffset.height / viewOffset.fullHeight);
        const scaleW = (fullRight - fullLeft) / viewOffset.width;
        const scaleH = (fullTop - fullBottom) / viewOffset.height;
        left += scaleW * (viewOffset.offsetX / zoomW);
        right = left + scaleW * (viewOffset.width / zoomW);
        top -= scaleH * (viewOffset.offsetY / zoomH);
        bottom = top - scaleH * (viewOffset.height / zoomH);
    }
    // build projection matrix
    Mat4.ortho(camera.projection, left, right, top, bottom, near, far);
    // build view matrix
    Mat4.lookAt(camera.view, camera.position, camera.target, camera.up);
}
function updatePers(camera) {
    const aspect = camera.viewport.width / camera.viewport.height;
    const { near, far, viewOffset } = camera;
    let top = near * Math.tan(0.5 * camera.state.fov);
    let height = 2 * top;
    let width = aspect * height;
    let left = -0.5 * width;
    if (viewOffset.enabled) {
        left += viewOffset.offsetX * width / viewOffset.fullWidth;
        top -= viewOffset.offsetY * height / viewOffset.fullHeight;
        width *= viewOffset.width / viewOffset.fullWidth;
        height *= viewOffset.height / viewOffset.fullHeight;
    }
    // build projection matrix
    Mat4.perspective(camera.projection, left, left + width, top, top - height, near, far);
    // build view matrix
    Mat4.lookAt(camera.view, camera.position, camera.target, camera.up);
}
function updateClip(camera) {
    let { radius, radiusMax, mode, fog, clipFar, minNear, minFar } = camera.state;
    if (radius < 0.01)
        radius = 0.01;
    const normalizedFar = Math.max(clipFar ? radius : radiusMax, minFar);
    const cameraDistance = Vec3.distance(camera.position, camera.target);
    let near = cameraDistance - radius;
    let far = cameraDistance + normalizedFar;
    if (mode === 'perspective') {
        // set at least to 5 to avoid slow sphere impostor rendering
        near = Math.max(Math.min(radiusMax, minNear), near);
        far = Math.max(minNear, far);
    }
    else {
        // not too close to 0 as it causes issues with outline rendering
        near = Math.max(Math.min(radiusMax, minNear), near);
        far = Math.max(minNear, far);
    }
    if (near === far) {
        // make sure near and far are not identical to avoid Infinity in the projection matrix
        far = near + 0.01;
    }
    const fogNearFactor = -(50 - fog) / 50;
    const fogNear = cameraDistance - (normalizedFar * fogNearFactor);
    const fogFar = far;
    camera.near = near;
    camera.far = far;
    camera.fogNear = fogNear;
    camera.fogFar = fogFar;
}
