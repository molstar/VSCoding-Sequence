"use strict";
/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * Adapted from three.js, The MIT License, Copyright © 2010-2020 three.js authors
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StereoCamera = exports.DefaultStereoCameraProps = exports.StereoCameraParams = void 0;
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const param_definition_1 = require("../../mol-util/param-definition");
const camera_1 = require("../camera");
const util_1 = require("./util");
exports.StereoCameraParams = {
    eyeSeparation: param_definition_1.ParamDefinition.Numeric(0.062, { min: 0.02, max: 0.1, step: 0.001 }, { description: 'Distance between left and right camera.' }),
    focus: param_definition_1.ParamDefinition.Numeric(10, { min: 1, max: 20, step: 0.1 }, { description: 'Apparent object distance.' }),
};
exports.DefaultStereoCameraProps = param_definition_1.ParamDefinition.getDefaultValues(exports.StereoCameraParams);
class StereoCamera {
    get viewport() {
        return this.parent.viewport;
    }
    get viewOffset() {
        return this.parent.viewOffset;
    }
    constructor(parent, props = {}) {
        this.parent = parent;
        this.left = new EyeCamera();
        this.right = new EyeCamera();
        this.props = { ...exports.DefaultStereoCameraProps, ...props };
    }
    setProps(props) {
        Object.assign(this.props, props);
    }
    update() {
        this.parent.update();
        update(this.parent, this.props, this.left, this.right);
    }
}
exports.StereoCamera = StereoCamera;
(function (StereoCamera) {
    function is(camera) {
        return 'left' in camera && 'right' in camera;
    }
    StereoCamera.is = is;
})(StereoCamera || (exports.StereoCamera = StereoCamera = {}));
class EyeCamera {
    constructor() {
        this.viewport = util_1.Viewport.create(0, 0, 0, 0);
        this.view = (0, linear_algebra_1.Mat4)();
        this.projection = (0, linear_algebra_1.Mat4)();
        this.projectionView = (0, linear_algebra_1.Mat4)();
        this.inverseProjectionView = (0, linear_algebra_1.Mat4)();
        this.state = camera_1.Camera.createDefaultSnapshot();
        this.viewOffset = camera_1.Camera.ViewOffset();
        this.far = 0;
        this.near = 0;
        this.fogFar = 0;
        this.fogNear = 0;
    }
}
const eyeLeft = linear_algebra_1.Mat4.identity(), eyeRight = linear_algebra_1.Mat4.identity();
function update(camera, props, left, right) {
    // Copy the states
    util_1.Viewport.copy(left.viewport, camera.viewport);
    linear_algebra_1.Mat4.copy(left.view, camera.view);
    linear_algebra_1.Mat4.copy(left.projection, camera.projection);
    camera_1.Camera.copySnapshot(left.state, camera.state);
    camera_1.Camera.copyViewOffset(left.viewOffset, camera.viewOffset);
    left.far = camera.far;
    left.near = camera.near;
    left.fogFar = camera.fogFar;
    left.fogNear = camera.fogNear;
    util_1.Viewport.copy(right.viewport, camera.viewport);
    linear_algebra_1.Mat4.copy(right.view, camera.view);
    linear_algebra_1.Mat4.copy(right.projection, camera.projection);
    camera_1.Camera.copySnapshot(right.state, camera.state);
    camera_1.Camera.copyViewOffset(right.viewOffset, camera.viewOffset);
    right.far = camera.far;
    right.near = camera.near;
    right.fogFar = camera.fogFar;
    right.fogNear = camera.fogNear;
    // update the view offsets
    const w = Math.floor(camera.viewport.width / 2);
    const aspect = w / camera.viewport.height;
    left.viewport.width = w;
    right.viewport.x += w;
    right.viewport.width -= w;
    // update the projection and view matrices
    const eyeSepHalf = props.eyeSeparation / 2;
    const eyeSepOnProjection = eyeSepHalf * camera.near / props.focus;
    const ymax = camera.near * Math.tan(camera.state.fov * 0.5);
    let xmin, xmax;
    // translate xOffset
    eyeLeft[12] = -eyeSepHalf;
    eyeRight[12] = eyeSepHalf;
    // for left eye
    xmin = -ymax * aspect + eyeSepOnProjection;
    xmax = ymax * aspect + eyeSepOnProjection;
    left.projection[0] = 2 * camera.near / (xmax - xmin);
    left.projection[8] = (xmax + xmin) / (xmax - xmin);
    linear_algebra_1.Mat4.mul(left.view, left.view, eyeLeft);
    linear_algebra_1.Mat4.mul(left.projectionView, left.projection, left.view);
    linear_algebra_1.Mat4.invert(left.inverseProjectionView, left.projectionView);
    // for right eye
    xmin = -ymax * aspect - eyeSepOnProjection;
    xmax = ymax * aspect - eyeSepOnProjection;
    right.projection[0] = 2 * camera.near / (xmax - xmin);
    right.projection[8] = (xmax + xmin) / (xmax - xmin);
    linear_algebra_1.Mat4.mul(right.view, right.view, eyeRight);
    linear_algebra_1.Mat4.mul(right.projectionView, right.projection, right.view);
    linear_algebra_1.Mat4.invert(right.inverseProjectionView, right.projectionView);
}
