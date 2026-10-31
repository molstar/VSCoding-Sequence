/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Mat4 } from '../../../../mol-math/linear-algebra';
import { MeshBuilder } from '../mesh-builder';
import { Sphere } from '../../../primitive/sphere';
const sphereMap = new Map();
const tmpSphereMat = Mat4.identity();
function setSphereMat(m, center, radius) {
    return Mat4.scaleUniformly(m, Mat4.fromTranslation(m, center), radius);
}
export function getSphere(detail) {
    let sphere = sphereMap.get(detail);
    if (sphere === undefined) {
        sphere = Sphere(detail);
        sphereMap.set(detail, sphere);
    }
    return sphere;
}
export function addSphere(state, center, radius, detail) {
    MeshBuilder.addPrimitive(state, setSphereMat(tmpSphereMat, center, radius), getSphere(detail));
}
