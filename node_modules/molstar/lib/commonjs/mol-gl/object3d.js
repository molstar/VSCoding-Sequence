"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Object3D = void 0;
const linear_algebra_1 = require("../mol-math/linear-algebra");
var Object3D;
(function (Object3D) {
    function create() {
        return {
            view: linear_algebra_1.Mat4.identity(),
            position: linear_algebra_1.Vec3.create(0, 0, 0),
            direction: linear_algebra_1.Vec3.create(0, 0, -1),
            up: linear_algebra_1.Vec3.create(0, 1, 0),
        };
    }
    Object3D.create = create;
    const center = linear_algebra_1.Vec3.zero();
    function update(object3d) {
        linear_algebra_1.Vec3.add(center, object3d.position, object3d.direction);
        linear_algebra_1.Mat4.lookAt(object3d.view, object3d.position, center, object3d.up);
    }
    Object3D.update = update;
})(Object3D || (exports.Object3D = Object3D = {}));
