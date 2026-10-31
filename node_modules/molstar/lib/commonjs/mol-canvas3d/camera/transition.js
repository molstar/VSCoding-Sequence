"use strict";
/**
 * Copyright (c) 2018-2024 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraTransitionManager = void 0;
const camera_1 = require("../camera");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const interpolate_1 = require("../../mol-math/interpolate");
class CameraTransitionManager {
    get source() { return this._source; }
    get target() { return this._target; }
    apply(to, durationMs = 0, transition) {
        if (!this.inTransition || durationMs > 0) {
            camera_1.Camera.copySnapshot(this._source, this.camera.state);
        }
        if (!this.inTransition) {
            camera_1.Camera.copySnapshot(this._target, this.camera.state);
        }
        camera_1.Camera.copySnapshot(this._target, to);
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
        camera_1.Camera.copySnapshot(this.camera.state, to);
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
        camera_1.Camera.copySnapshot(this.camera.state, this._current);
    }
    constructor(camera) {
        this.camera = camera;
        this.t = 0;
        this.func = CameraTransitionManager.defaultTransition;
        this.start = 0;
        this.inTransition = false;
        this.durationMs = 0;
        this._source = camera_1.Camera.createDefaultSnapshot();
        this._target = camera_1.Camera.createDefaultSnapshot();
        this._current = camera_1.Camera.createDefaultSnapshot();
    }
}
exports.CameraTransitionManager = CameraTransitionManager;
(function (CameraTransitionManager) {
    const _rotUp = linear_algebra_1.Quat.identity();
    const _rotDist = linear_algebra_1.Quat.identity();
    const _sourcePosition = (0, linear_algebra_1.Vec3)();
    const _targetPosition = (0, linear_algebra_1.Vec3)();
    function defaultTransition(out, t, source, target) {
        camera_1.Camera.copySnapshot(out, target);
        // Rotate up
        linear_algebra_1.Quat.slerp(_rotUp, linear_algebra_1.Quat.Identity, linear_algebra_1.Quat.rotationTo(_rotUp, source.up, target.up), t);
        linear_algebra_1.Vec3.transformQuat(out.up, source.up, _rotUp);
        // Lerp target, position & radius
        linear_algebra_1.Vec3.lerp(out.target, source.target, target.target, t);
        // Interpolate distance
        const distSource = linear_algebra_1.Vec3.distance(source.target, source.position);
        const distTarget = linear_algebra_1.Vec3.distance(target.target, target.position);
        const dist = (0, interpolate_1.lerp)(distSource, distTarget, t);
        // Rotate between source and targer direction
        linear_algebra_1.Vec3.sub(_sourcePosition, source.position, source.target);
        linear_algebra_1.Vec3.normalize(_sourcePosition, _sourcePosition);
        linear_algebra_1.Vec3.sub(_targetPosition, target.position, target.target);
        linear_algebra_1.Vec3.normalize(_targetPosition, _targetPosition);
        linear_algebra_1.Quat.rotationTo(_rotDist, _sourcePosition, _targetPosition);
        linear_algebra_1.Quat.slerp(_rotDist, linear_algebra_1.Quat.Identity, _rotDist, t);
        linear_algebra_1.Vec3.transformQuat(_sourcePosition, _sourcePosition, _rotDist);
        linear_algebra_1.Vec3.scale(_sourcePosition, _sourcePosition, dist);
        linear_algebra_1.Vec3.add(out.position, out.target, _sourcePosition);
        // Interpolate radius
        out.radius = (0, interpolate_1.lerp)(source.radius, target.radius, t);
        // TODO take change of `clipFar` into account
        out.radiusMax = (0, interpolate_1.lerp)(source.radiusMax, target.radiusMax, t);
        // Interpolate fov & fog
        out.fov = (0, interpolate_1.lerp)(source.fov, target.fov, t);
        out.fog = (0, interpolate_1.lerp)(source.fog, target.fog, t);
    }
    CameraTransitionManager.defaultTransition = defaultTransition;
})(CameraTransitionManager || (exports.CameraTransitionManager = CameraTransitionManager = {}));
