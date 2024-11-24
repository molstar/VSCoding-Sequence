"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSphere = getSphere;
exports.addSphere = addSphere;
const linear_algebra_1 = require("../../../../mol-math/linear-algebra");
const mesh_builder_1 = require("../mesh-builder");
const sphere_1 = require("../../../primitive/sphere");
const sphereMap = new Map();
const tmpSphereMat = linear_algebra_1.Mat4.identity();
function setSphereMat(m, center, radius) {
    return linear_algebra_1.Mat4.scaleUniformly(m, linear_algebra_1.Mat4.fromTranslation(m, center), radius);
}
function getSphere(detail) {
    let sphere = sphereMap.get(detail);
    if (sphere === undefined) {
        sphere = (0, sphere_1.Sphere)(detail);
        sphereMap.set(detail, sphere);
    }
    return sphere;
}
function addSphere(state, center, radius, detail) {
    mesh_builder_1.MeshBuilder.addPrimitive(state, setSphereMat(tmpSphereMat, center, radius), getSphere(detail));
}
