"use strict";
/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Viewport = Viewport;
exports.cameraProject = cameraProject;
exports.cameraUnproject = cameraUnproject;
const linear_algebra_1 = require("../../mol-math/linear-algebra");
function Viewport() {
    return Viewport.zero();
}
(function (Viewport) {
    function zero() {
        return { x: 0, y: 0, width: 0, height: 0 };
    }
    Viewport.zero = zero;
    function create(x, y, width, height) {
        return { x, y, width, height };
    }
    Viewport.create = create;
    function clone(viewport) {
        return { ...viewport };
    }
    Viewport.clone = clone;
    function copy(target, source) {
        return Object.assign(target, source);
    }
    Viewport.copy = copy;
    function set(viewport, x, y, width, height) {
        viewport.x = x;
        viewport.y = y;
        viewport.width = width;
        viewport.height = height;
        return viewport;
    }
    Viewport.set = set;
    function toVec4(v4, viewport) {
        v4[0] = viewport.x;
        v4[1] = viewport.y;
        v4[2] = viewport.width;
        v4[3] = viewport.height;
        return v4;
    }
    Viewport.toVec4 = toVec4;
    function equals(a, b) {
        return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
    }
    Viewport.equals = equals;
})(Viewport || (exports.Viewport = Viewport = {}));
//
const tmpVec4 = (0, linear_algebra_1.Vec4)();
/** Transform point into 2D window coordinates. */
function cameraProject(out, point, viewport, projectionView) {
    const { x, y, width, height } = viewport;
    // clip space -> NDC -> window coordinates, implicit 1.0 for w component
    linear_algebra_1.Vec4.set(tmpVec4, point[0], point[1], point[2], 1.0);
    // transform into clip space
    linear_algebra_1.Vec4.transformMat4(tmpVec4, tmpVec4, projectionView);
    // transform into NDC
    const w = tmpVec4[3];
    if (w !== 0) {
        tmpVec4[0] /= w;
        tmpVec4[1] /= w;
        tmpVec4[2] /= w;
    }
    // transform into window coordinates, set fourth component to 1 / clip.w as in gl_FragCoord.w
    out[0] = (tmpVec4[0] + 1) * width * 0.5 + x;
    out[1] = (tmpVec4[1] + 1) * height * 0.5 + y;
    out[2] = (tmpVec4[2] + 1) * 0.5;
    out[3] = w === 0 ? 0 : 1 / w;
    return out;
}
/**
 * Transform point from screen space to 3D coordinates.
 * The point must have `x` and `y` set to 2D window coordinates
 * and `z` between 0 (near) and 1 (far); the optional `w` is not used.
 */
function cameraUnproject(out, point, viewport, inverseProjectionView) {
    const { x, y, width, height } = viewport;
    const px = point[0] - x;
    const py = point[1] - y;
    const pz = point[2];
    out[0] = (2 * px) / width - 1;
    out[1] = (2 * py) / height - 1;
    out[2] = 2 * pz - 1;
    return linear_algebra_1.Vec3.transformMat4(out, out, inverseProjectionView);
}
