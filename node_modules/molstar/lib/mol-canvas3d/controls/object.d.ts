/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Vec2, Vec3 } from '../../mol-math/linear-algebra';
import { InputObserver } from '../../mol-util/input/input-observer';
import { Camera } from '../camera';
export declare namespace ObjectControls {
    /**
     * Get vector for movement in camera projection plane:
     * `pageStart` and `pageEnd` are 2d window coordinates;
     * `ref` defines the plane depth, if not given `camera.target` is used
     */
    function panDirection(out: Vec3, pageStart: Vec2, pageEnd: Vec2, input: InputObserver, camera: Camera, ref?: Vec3): Vec3;
}
