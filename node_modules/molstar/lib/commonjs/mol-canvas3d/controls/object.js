"use strict";
/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectControls = void 0;
const linear_algebra_1 = require("../../mol-math/linear-algebra");
var ObjectControls;
(function (ObjectControls) {
    function mouseOnScreen(out, page, viewport) {
        return linear_algebra_1.Vec2.set(out, (page[0] - viewport.x) / viewport.width, (page[1] - viewport.y) / viewport.height);
    }
    const panMouseChange = (0, linear_algebra_1.Vec2)();
    const panObjUp = (0, linear_algebra_1.Vec3)();
    const panOffset = (0, linear_algebra_1.Vec3)();
    const eye = (0, linear_algebra_1.Vec3)();
    const panStart = (0, linear_algebra_1.Vec2)();
    const panEnd = (0, linear_algebra_1.Vec2)();
    const target = (0, linear_algebra_1.Vec3)();
    /**
     * Get vector for movement in camera projection plane:
     * `pageStart` and `pageEnd` are 2d window coordinates;
     * `ref` defines the plane depth, if not given `camera.target` is used
     */
    function panDirection(out, pageStart, pageEnd, input, camera, ref) {
        mouseOnScreen(panStart, pageStart, camera.viewport);
        mouseOnScreen(panEnd, pageEnd, camera.viewport);
        linear_algebra_1.Vec2.sub(panMouseChange, linear_algebra_1.Vec2.copy(panMouseChange, panEnd), panStart);
        linear_algebra_1.Vec3.sub(eye, camera.position, camera.target);
        if (!ref || camera.state.mode === 'orthographic')
            linear_algebra_1.Vec3.copy(target, camera.target);
        else
            linear_algebra_1.Vec3.projectPointOnVector(target, ref, eye, camera.position);
        const dist = linear_algebra_1.Vec3.distance(camera.position, target);
        const height = 2 * Math.tan(camera.state.fov / 2) * dist;
        const zoom = camera.viewport.height / height;
        panMouseChange[0] *= (1 / zoom) * camera.viewport.width * input.pixelRatio;
        panMouseChange[1] *= (1 / zoom) * camera.viewport.height * input.pixelRatio;
        linear_algebra_1.Vec3.cross(panOffset, linear_algebra_1.Vec3.copy(panOffset, eye), camera.up);
        linear_algebra_1.Vec3.setMagnitude(panOffset, panOffset, panMouseChange[0]);
        linear_algebra_1.Vec3.setMagnitude(panObjUp, camera.up, panMouseChange[1]);
        linear_algebra_1.Vec3.add(panOffset, panOffset, panObjUp);
        return linear_algebra_1.Vec3.negate(out, panOffset);
    }
    ObjectControls.panDirection = panDirection;
})(ObjectControls || (exports.ObjectControls = ObjectControls = {}));
