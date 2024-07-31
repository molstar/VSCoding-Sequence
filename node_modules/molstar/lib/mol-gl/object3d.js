/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Vec3, Mat4 } from '../mol-math/linear-algebra';
export var Object3D;
(function (Object3D) {
    function create() {
        return {
            view: Mat4.identity(),
            position: Vec3.create(0, 0, 0),
            direction: Vec3.create(0, 0, -1),
            up: Vec3.create(0, 1, 0),
        };
    }
    Object3D.create = create;
    const center = Vec3.zero();
    function update(object3d) {
        Vec3.add(center, object3d.position, object3d.direction);
        Mat4.lookAt(object3d.view, object3d.position, center, object3d.up);
    }
    Object3D.update = update;
})(Object3D || (Object3D = {}));
