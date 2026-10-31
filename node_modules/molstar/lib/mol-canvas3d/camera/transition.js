/**
 * Copyright (c) 2018-2024 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Camera } from '../camera';
import { Quat, Vec3 } from '../../mol-math/linear-algebra';
import { lerp } from '../../mol-math/interpolate';
export { CameraTransitionManager };
class CameraTransitionManager {
    get source() { return this._source; }
    get target() { return this._target; }
    apply(to, durationMs = 0, transition) {
        if (!this.inTransition || durationMs > 0) {
            Camera.copySnapshot(this._source, this.camera.state);
        }
        if (!this.inTransition) {
            Camera.copySnapshot(this._target, this.camera.state);
        }
        Camera.copySnapshot(this._target, to);
        if (this._target.radius > this._target.radiusMax) {
            this._target.radius = this._target.radiusMax;
        }
        if (this._target.radius < 0.01)
            this._target.radius = 0.01;
        if (this._target.radiusMax < 0.01)
            this._target.radiusMax = 0.01;
        if (!this.inTransition && durationMs <= 0 || (typeof to.mode !== 'undefined' && to.mode !== this.camera.state.mode)) {
            this.finish(this._target);
            return;
        }
        this.inTransition = true;
        this.func = transition || CameraTransitionManager.defaultTransition;
        if (!this.inTransition || durationMs > 0) {
            this.start = this.t;
            this.durationMs = durationMs;
        }
    }
    tick(t) {
        this.t = t;
        this.update();
    }
    finish(to) {
        Camera.copySnapshot(this.camera.state, to);
        this.inTransition = false;
    }
    update() {
        if (!this.inTransition)
            return;
        const normalized = Math.min((this.t - this.start) / this.durationMs, 1);
        if (normalized === 1) {
            this.finish(this._target);
            return;
        }
        this.func(this._current, normalized, this._source, this._target);
        Camera.copySnapshot(this.camera.state, this._current);
    }
    constructor(camera) {
        this.camera = camera;
        this.t = 0;
        this.func = CameraTransitionManager.defaultTransition;
        this.start = 0;
        this.inTransition = false;
        this.durationMs = 0;
        this._source = Camera.createDefaultSnapshot();
        this._target = Camera.createDefaultSnapshot();
        this._current = Camera.createDefaultSnapshot();
    }
}
(function (CameraTransitionManager) {
    const _rotUp = Quat.identity();
    const _rotDist = Quat.identity();
    const _sourcePosition = Vec3();
    const _targetPosition = Vec3();
    function defaultTransition(out, t, source, target) {
        Camera.copySnapshot(out, target);
        // Rotate up
        Quat.slerp(_rotUp, Quat.Identity, Quat.rotationTo(_rotUp, source.up, target.up), t);
        Vec3.transformQuat(out.up, source.up, _rotUp);
        // Lerp target, position & radius
        Vec3.lerp(out.target, source.target, target.target, t);
        // Interpolate distance
        const distSource = Vec3.distance(source.target, source.position);
        const distTarget = Vec3.distance(target.target, target.position);
        const dist = lerp(distSource, distTarget, t);
        // Rotate between source and targer direction
        Vec3.sub(_sourcePosition, source.position, source.target);
        Vec3.normalize(_sourcePosition, _sourcePosition);
        Vec3.sub(_targetPosition, target.position, target.target);
        Vec3.normalize(_targetPosition, _targetPosition);
        Quat.rotationTo(_rotDist, _sourcePosition, _targetPosition);
        Quat.slerp(_rotDist, Quat.Identity, _rotDist, t);
        Vec3.transformQuat(_sourcePosition, _sourcePosition, _rotDist);
        Vec3.scale(_sourcePosition, _sourcePosition, dist);
        Vec3.add(out.position, out.target, _sourcePosition);
        // Interpolate radius
        out.radius = lerp(source.radius, target.radius, t);
        // TODO take change of `clipFar` into account
        out.radiusMax = lerp(source.radiusMax, target.radiusMax, t);
        // Interpolate fov & fog
        out.fov = lerp(source.fov, target.fov, t);
        out.fog = lerp(source.fog, target.fog, t);
    }
    CameraTransitionManager.defaultTransition = defaultTransition;
})(CameraTransitionManager || (CameraTransitionManager = {}));
